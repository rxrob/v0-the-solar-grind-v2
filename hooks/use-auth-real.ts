"use client"

import { useState, useEffect, createContext } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthReal(): AuthContextType {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  })

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: "Supabase not configured",
      }))
      return
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting initial session:", error)
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: error.message,
          }))
          return
        }

        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error("Failed to get initial session:", error)
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to initialize authentication",
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error("Supabase not configured")

    setAuthState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign in failed"
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    if (!supabase) throw new Error("Supabase not configured")

    setAuthState((prev) => ({ ...prev, loading: true, error: null }))

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

      if (error) throw error

      setAuthState({
        user: data.user,
        session: data.session,
        loading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign up failed"
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const signOut = async () => {
    if (!supabase) throw new Error("Supabase not configured")

    setAuthState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Sign out failed"
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }))
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) throw new Error("Supabase not configured")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) throw error
  }

  const updatePassword = async (password: string) => {
    if (!supabase) throw new Error("Supabase not configured")

    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const refreshSession = async () => {
    if (!supabase) throw new Error("Supabase not configured")

    const { data, error } = await supabase.auth.refreshSession()
    if (error) throw error

    setAuthState({
      user: data.user,
      session: data.session,
      loading: false,
      error: null,
    })
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
  }
}

// Export alias for compatibility
export const useAuth = useAuthReal

// Default export
export default useAuthReal
