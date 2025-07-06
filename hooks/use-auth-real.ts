"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  subscription_type: "free" | "pro"
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string; message?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>
  clearError: () => void
  refreshProfile: () => Promise<void>
}

export function useAuthReal(): AuthState &
  AuthActions & {
    isAuthenticated: boolean
    isPro: boolean
  } {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })

  const supabase = createClient()

  // Clear error function
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // Load user profile
  const loadProfile = useCallback(
    async (userId: string) => {
      try {
        const { data: profile, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) {
          console.error("Profile load error:", error)
          return null
        }

        return profile as UserProfile
      } catch (error) {
        console.error("Profile load error:", error)
        return null
      }
    },
    [supabase],
  )

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!state.user) return

    const profile = await loadProfile(state.user.id)
    setState((prev) => ({ ...prev, profile }))
  }, [state.user, loadProfile])

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Session error:", error)
          if (mounted) {
            setState((prev) => ({ ...prev, error: error.message, loading: false }))
          }
          return
        }

        if (session?.user) {
          const profile = await loadProfile(session.user.id)
          if (mounted) {
            setState({
              user: session.user,
              profile,
              loading: false,
              error: null,
            })
          }
        } else {
          if (mounted) {
            setState({
              user: null,
              profile: null,
              loading: false,
              error: null,
            })
          }
        }
      } catch (error: any) {
        console.error("Auth initialization error:", error)
        if (mounted) {
          setState((prev) => ({
            ...prev,
            error: error.message || "Authentication error",
            loading: false,
          }))
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        const profile = await loadProfile(session.user.id)
        setState({
          user: session.user,
          profile,
          loading: false,
          error: null,
        })
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        })
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        const profile = await loadProfile(session.user.id)
        setState((prev) => ({
          ...prev,
          user: session.user,
          profile,
          error: null,
        }))
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, loadProfile])

  // Sign in function
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        // Input validation
        if (!email || !email.includes("@")) {
          return { success: false, error: "Valid email is required" }
        }
        if (!password || password.length < 6) {
          return { success: false, error: "Password must be at least 6 characters" }
        }

        setState((prev) => ({ ...prev, loading: true, error: null }))

        const { error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password,
        })

        if (error) {
          setState((prev) => ({ ...prev, error: error.message, loading: false }))
          return { success: false, error: error.message }
        }

        return { success: true }
      } catch (error: any) {
        const errorMessage = error.message || "Sign in failed"
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
        return { success: false, error: errorMessage }
      }
    },
    [supabase],
  )

  // Sign up function
  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        // Input validation
        if (!email || !email.includes("@")) {
          return { success: false, error: "Valid email is required" }
        }
        if (!password || password.length < 6) {
          return { success: false, error: "Password must be at least 6 characters" }
        }

        setState((prev) => ({ ...prev, loading: true, error: null }))

        const { error } = await supabase.auth.signUp({
          email: email.toLowerCase().trim(),
          password,
        })

        if (error) {
          setState((prev) => ({ ...prev, error: error.message, loading: false }))
          return { success: false, error: error.message }
        }

        setState((prev) => ({ ...prev, loading: false }))
        return { success: true, message: "Check your email to confirm your account" }
      } catch (error: any) {
        const errorMessage = error.message || "Sign up failed"
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
        return { success: false, error: errorMessage }
      }
    },
    [supabase],
  )

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { error } = await supabase.auth.signOut()

      if (error) {
        setState((prev) => ({ ...prev, error: error.message, loading: false }))
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      const errorMessage = error.message || "Sign out failed"
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
      return { success: false, error: errorMessage }
    }
  }, [supabase])

  // Update profile function
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!state.user) {
        return { success: false, error: "Not authenticated" }
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))

        // Sanitize updates
        const allowedFields = ["subscription_type"]
        const sanitizedUpdates = Object.keys(updates)
          .filter((key) => allowedFields.includes(key))
          .reduce((obj: any, key) => {
            obj[key] = updates[key as keyof UserProfile]
            return obj
          }, {})

        const { data, error } = await supabase
          .from("users")
          .update({
            ...sanitizedUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", state.user.id)
          .select()
          .single()

        if (error) {
          setState((prev) => ({ ...prev, error: error.message, loading: false }))
          return { success: false, error: error.message }
        }

        setState((prev) => ({ ...prev, profile: data as UserProfile, loading: false }))
        return { success: true }
      } catch (error: any) {
        const errorMessage = error.message || "Profile update failed"
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }))
        return { success: false, error: errorMessage }
      }
    },
    [supabase, state.user],
  )

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    clearError,
    refreshProfile,
    isAuthenticated: !!state.user,
    isPro: state.profile?.subscription_type === "pro",
  }
}

// Legacy export for backward compatibility
export const useAuth = useAuthReal
