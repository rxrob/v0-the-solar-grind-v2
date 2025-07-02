"use client"

import { useState, useEffect } from "react"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        if (!isSupabaseAvailable()) {
          console.log("🔄 Demo mode: No authentication available")
          setAuthState({
            user: null,
            session: null,
            loading: false,
            isAuthenticated: false,
          })
          return
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error && error.message !== "Auth session missing!") {
          console.error("Error getting session:", error.message)
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          isAuthenticated: !!session?.user,
        })

        if (session?.user) {
          console.log("✅ User authenticated:", session.user.email)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setAuthState({
          user: null,
          session: null,
          loading: false,
          isAuthenticated: false,
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    if (isSupabaseAvailable()) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        // Only log meaningful auth state changes
        if (event !== "INITIAL_SESSION" || session) {
          console.log("🔄 Auth state changed:", event, session?.user?.email || "no user")
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          isAuthenticated: !!session?.user,
        })
      })

      return () => subscription.unsubscribe()
    }
  }, [])

  // Helper functions for client-side auth operations
  const signInClient = async (email: string, password: string) => {
    if (!isSupabaseAvailable()) {
      return { error: "Authentication not available in demo mode" }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { data, error }
    } catch (error) {
      console.error("Client sign in error:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  const signUpClient = async (email: string, password: string, fullName?: string) => {
    if (!isSupabaseAvailable()) {
      return { error: "Authentication not available in demo mode" }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      return { data, error }
    } catch (error) {
      console.error("Client sign up error:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  const signOutClient = async () => {
    if (!isSupabaseAvailable()) {
      return { error: null }
    }

    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      console.error("Client sign out error:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  return {
    ...authState,
    signIn: signInClient,
    signUp: signUpClient,
    signOut: signOutClient,
    isSupabaseAvailable: isSupabaseAvailable(),
  }
}
