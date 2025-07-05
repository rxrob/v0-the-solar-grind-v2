"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface AuthUser {
  id: string
  email: string
  name: string
  accountType: string
  subscriptionStatus: string
  subscriptionPlan: string
  calculationsUsed: number
  monthlyLimit: number
  emailVerified: boolean
}

export function useAuthReal() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          setError(error.message)
          setLoading(false)
          return
        }

        if (session?.user) {
          await fetchUserProfile(session.user)
        } else {
          setUser(null)
        }

        setLoading(false)
      } catch (err) {
        setError("Failed to get session")
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (error) {
        console.error("Profile fetch error:", error)
        // Use basic user info if profile fetch fails
        setUser({
          id: authUser.id,
          email: authUser.email || "",
          name: authUser.user_metadata?.name || authUser.email || "",
          accountType: "free",
          subscriptionStatus: "active",
          subscriptionPlan: "free",
          calculationsUsed: 0,
          monthlyLimit: 5,
          emailVerified: !!authUser.email_confirmed_at,
        })
        return
      }

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        name: profile?.name || authUser.user_metadata?.name || authUser.email || "",
        accountType: profile?.subscription_type || "free",
        subscriptionStatus: profile?.subscription_status || "active",
        subscriptionPlan: profile?.subscription_type || "free",
        calculationsUsed: profile?.calculations_used || 0,
        monthlyLimit: profile?.monthly_limit || 5,
        emailVerified: !!authUser.email_confirmed_at,
      })
    } catch (err) {
      console.error("Failed to fetch user profile:", err)
      setError("Failed to fetch user profile")
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true, user: data.user }
    } catch (err) {
      const errorMessage = "An unexpected error occurred"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      setError(null)

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
        setError(error.message)
        return { success: false, error: error.message }
      }

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: email,
          full_name: fullName,
          name: fullName,
          subscription_type: "free",
          subscription_status: "active",
          calculations_used: 0,
          monthly_limit: 5,
          created_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Failed to create user profile:", profileError)
        }
      }

      return { success: true, user: data.user }
    } catch (err) {
      const errorMessage = "An unexpected error occurred"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(null)
      return { success: true }
    } catch (err) {
      const errorMessage = "An unexpected error occurred"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, message: "Password reset email sent" }
    } catch (err) {
      return { success: false, error: "An unexpected error occurred" }
    }
  }

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
