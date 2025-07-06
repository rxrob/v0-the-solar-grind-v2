"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  subscription_type: "free" | "pro"
  subscription_status: "active" | "inactive" | "cancelled"
  calculations_used: number
  reports_generated: number
  api_calls_made: number
  created_at: string
  updated_at: string
}

interface UserPermissions {
  canUseAdvancedCalculator: boolean
  canGenerateReports: boolean
  canAccessProFeatures: boolean
  calculationsUsed: number
  reportsGenerated: number
  apiCallsMade: number
  subscriptionType: string
  subscriptionStatus: string
}

export function useAuthReal() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          console.error("Session error:", error)
          setError(error.message)
        } else if (session?.user) {
          setUser(session.user)
          await loadUserProfile(session.user.id)
        }
      } catch (err) {
        console.error("Initial session error:", err)
        setError(err instanceof Error ? err.message : "Failed to get session")
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setPermissions(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.error("Profile load error:", profileError)
        setError(profileError.message)
        return
      }

      setProfile(profileData)

      // Calculate permissions
      const userPermissions: UserPermissions = {
        canUseAdvancedCalculator:
          profileData.subscription_type === "pro" && profileData.subscription_status === "active",
        canGenerateReports: profileData.subscription_type === "pro" && profileData.subscription_status === "active",
        canAccessProFeatures: profileData.subscription_type === "pro" && profileData.subscription_status === "active",
        calculationsUsed: profileData.calculations_used || 0,
        reportsGenerated: profileData.reports_generated || 0,
        apiCallsMade: profileData.api_calls_made || 0,
        subscriptionType: profileData.subscription_type,
        subscriptionStatus: profileData.subscription_status,
      }

      setPermissions(userPermissions)
      setError(null)
    } catch (err) {
      console.error("Load profile error:", err)
      setError(err instanceof Error ? err.message : "Failed to load profile")
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  return {
    user,
    profile,
    permissions,
    loading,
    error,
    refreshProfile,
    isAuthenticated: !!user,
    isPro: permissions?.canAccessProFeatures || false,
  }
}
