"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase-browser"
import type { User, Session } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  subscription_type: "free" | "pro"
  subscription_status: string | null
  stripe_customer_id: string | null
  single_reports_purchased: number
  single_reports_used: number
  pro_trial_used: boolean
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false,
  })

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log("Fetching user profile for:", userId)

      // Use maybeSingle() to handle cases where no profile exists
      const { data: profile, error } = await supabase.from("users").select("*").eq("id", userId).maybeSingle()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      if (!profile) {
        console.log("No profile found, creating new user profile...")

        // Get user data from auth
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.error("No authenticated user found")
          return null
        }

        // Create new user profile
        const newProfile = {
          id: userId,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          subscription_type: "free" as const,
          subscription_status: "active",
          stripe_customer_id: null,
          single_reports_purchased: 1, // Give 1 free advanced report
          single_reports_used: 0,
          pro_trial_used: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: createdProfile, error: createError } = await supabase
          .from("users")
          .insert([newProfile])
          .select()
          .single()

        if (createError) {
          console.error("Error creating user profile:", createError)
          return null
        }

        console.log("Created new user profile:", createdProfile)
        return createdProfile
      }

      console.log("Found existing user profile:", profile)
      return profile
    } catch (error) {
      console.error("Profile fetch error:", error)
      return null
    }
  }, [])

  const getInitialSession = useCallback(async () => {
    try {
      console.log("Getting initial session...")

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) {
        console.error("Error getting session:", error)
        setState((prev) => ({ ...prev, loading: false, initialized: true }))
        return
      }

      if (session?.user) {
        console.log("Found session for user:", session.user.id)
        const profile = await fetchUserProfile(session.user.id)

        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          initialized: true,
        })
      } else {
        console.log("No active session found")
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true,
        })
      }
    } catch (error) {
      console.error("Error in getInitialSession:", error)
      setState((prev) => ({ ...prev, loading: false, initialized: true }))
    }
  }, [fetchUserProfile])

  const signInWithGoogle = useCallback(async () => {
    try {
      console.log("Starting Google sign in...")

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("Google sign in error:", error)
        return { success: false, error: error.message }
      }

      console.log("Google sign in initiated successfully")
      return { success: true, data }
    } catch (error) {
      console.error("Unexpected error during Google sign in:", error)
      return { success: false, error: "Unexpected error" }
    }
  }, [])

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        console.log("Starting email sign in for:", email)

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          console.error("Email sign in error:", error)
          return { success: false, error: error.message }
        }

        if (data.user) {
          const profile = await fetchUserProfile(data.user.id)
          setState({
            user: data.user,
            profile,
            session: data.session,
            loading: false,
            initialized: true,
          })
        }

        console.log("Email sign in successful")
        return { success: true, data }
      } catch (error) {
        console.error("Unexpected error during email sign in:", error)
        return { success: false, error: "Unexpected error" }
      }
    },
    [fetchUserProfile],
  )

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      console.log("Starting email sign up for:", email)

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
        console.error("Email sign up error:", error)
        return { success: false, error: error.message }
      }

      console.log("Email sign up successful")
      return { success: true, data }
    } catch (error) {
      console.error("Unexpected error during email sign up:", error)
      return { success: false, error: "Unexpected error" }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      console.log("Signing out...")

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Sign out error:", error)
        return { success: false, error: error.message }
      }

      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        initialized: true,
      })

      console.log("Sign out successful")
      return { success: true }
    } catch (error) {
      console.error("Unexpected error during sign out:", error)
      return { success: false, error: "Unexpected error" }
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!state.user) return null

    console.log("Refreshing user profile...")
    const profile = await fetchUserProfile(state.user.id)

    setState((prev) => ({ ...prev, profile }))
    return profile
  }, [state.user, fetchUserProfile])

  // Initialize auth state
  useEffect(() => {
    getInitialSession()
  }, [getInitialSession])

  // Listen for auth changes
  useEffect(() => {
    console.log("Setting up auth state listener...")

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          initialized: true,
        })
      } else if (event === "SIGNED_OUT") {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true,
        })
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setState((prev) => ({
          ...prev,
          session,
          user: session.user,
        }))
      }
    })

    return () => {
      console.log("Cleaning up auth state listener")
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  return {
    ...state,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshProfile,
    isAuthenticated: !!state.user,
    isPro: state.profile?.subscription_type === "pro" && state.profile?.subscription_status === "active",
    hasAdvancedReports: (state.profile?.single_reports_purchased || 0) > (state.profile?.single_reports_used || 0),
    canUseProFeatures: state.profile?.subscription_type === "pro" && state.profile?.subscription_status === "active",
  }
}
