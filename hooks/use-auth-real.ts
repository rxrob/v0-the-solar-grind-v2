"use client"

import { useState, useEffect, createContext } from "react"
import { createClient } from "@/lib/supabase-client"
import type { User, Session } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  subscription: "free" | "pro" | null
  isProUser: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<{ error: any }>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthReal(): AuthContextType {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<"free" | "pro" | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          if (session?.user) {
            await fetchUserSubscription(session.user.id)
          }
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchUserSubscription(session.user.id)
      } else {
        setSubscription(null)
      }

      setLoading(false)
    })

    return () => {
      authSubscription?.unsubscribe()
    }
  }, [])

  const fetchUserSubscription = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("subscription_type").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user subscription:", error)
        setSubscription("free") // Default to free on error
      } else {
        setSubscription(data?.subscription_type || "free")
      }
    } catch (error) {
      console.error("Error in fetchUserSubscription:", error)
      setSubscription("free")
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setSubscription(null)
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const refreshAuth = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession()
      if (error) {
        console.error("Error refreshing session:", error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchUserSubscription(session.user.id)
        }
      }
    } catch (error) {
      console.error("Error in refreshAuth:", error)
    }
  }

  const isProUser = subscription === "pro"

  return {
    user,
    session,
    loading,
    subscription,
    isProUser,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    refreshAuth,
  }
}

// Export useAuth as an alias for compatibility
export const useAuth = useAuthReal
