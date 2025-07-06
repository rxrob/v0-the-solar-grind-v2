"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  company?: string
  subscription_type: "free" | "pro"
  subscription_status?: string
  pro_trial_used: boolean
  single_reports_purchased: number
  created_at: string
  updated_at?: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export function useAuthReal() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          setState((prev) => ({ ...prev, error: error.message, loading: false }))
          return
        }

        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setState((prev) => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error("Initial session error:", error)
        setState((prev) => ({ ...prev, error: "Failed to get session", loading: false }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        await fetchUserProfile(session.user)
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (error) {
        console.error("Profile fetch error:", error)
        setState({
          user,
          profile: null,
          loading: false,
          error: error.message,
        })
        return
      }

      setState({
        user,
        profile,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error("Fetch profile error:", error)
      setState({
        user,
        profile: null,
        loading: false,
        error: "Failed to fetch profile",
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setState((prev) => ({ ...prev, error: error.message, loading: false }))
        return { error: error.message }
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error("Sign in error:", error)
      setState((prev) => ({ ...prev, error: "An unexpected error occurred", loading: false }))
      return { error: "An unexpected error occurred" }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setState((prev) => ({ ...prev, error: error.message, loading: false }))
        return { error: error.message }
      }

      return { success: true, user: data.user }
    } catch (error) {
      console.error("Sign up error:", error)
      setState((prev) => ({ ...prev, error: "An unexpected error occurred", loading: false }))
      return { error: "An unexpected error occurred" }
    }
  }

  const signOut = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const { error } = await supabase.auth.signOut()

      if (error) {
        setState((prev) => ({ ...prev, error: error.message, loading: false }))
        return { error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Sign out error:", error)
      setState((prev) => ({ ...prev, error: "An unexpected error occurred", loading: false }))
      return { error: "An unexpected error occurred" }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Reset password error:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error("Update password error:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!state.user) {
        return { error: "User not authenticated" }
      }

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: updates,
      })

      if (authError) {
        return { error: authError.message }
      }

      // Update user profile in database
      const { error: profileError } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", state.user.id)

      if (profileError) {
        return { error: profileError.message }
      }

      // Refresh profile
      await fetchUserProfile(state.user)

      return { success: true }
    } catch (error) {
      console.error("Update profile error:", error)
      return { error: "An unexpected error occurred" }
    }
  }

  const refreshProfile = async () => {
    if (state.user) {
      await fetchUserProfile(state.user)
    }
  }

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    isAuthenticated: !!state.user,
    isPro: state.profile?.subscription_type === "pro" && state.profile?.subscription_status === "active",
    canUseProFeatures: state.profile?.subscription_type === "pro" && state.profile?.subscription_status === "active",
    canStartProTrial: !state.profile?.pro_trial_used && state.profile?.subscription_type !== "pro",
    hasSingleReports: (state.profile?.single_reports_purchased || 0) > 0,
  }
}
