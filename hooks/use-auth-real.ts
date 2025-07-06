"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface UserProfile {
  id: string
  email: string
  full_name: string
  subscription_type: "free" | "pro"
  calculations_used: number
  reports_used: number
  stripe_customer_id?: string
  created_at: string
  updated_at: string
}

interface UserPermissions {
  canAccessPro: boolean
  canGenerateReports: boolean
  calculationsRemaining: number
  reportsRemaining: number
  subscriptionType: "free" | "pro"
  calculationsUsed: number
  reportsUsed: number
}

export function useAuthReal() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Load user profile and permissions
  const loadUserData = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError) {
        console.error("Error loading user profile:", profileError)
        setError(profileError.message)
        return
      }

      setProfile(profileData)

      // Calculate permissions
      const isPro = profileData.subscription_type === "pro"
      const calculationsUsed = profileData.calculations_used || 0
      const reportsUsed = profileData.reports_used || 0

      setPermissions({
        canAccessPro: isPro,
        canGenerateReports: isPro || reportsUsed < 1,
        calculationsRemaining: isPro ? -1 : Math.max(0, 5 - calculationsUsed),
        reportsRemaining: isPro ? -1 : Math.max(0, 1 - reportsUsed),
        subscriptionType: profileData.subscription_type,
        calculationsUsed,
        reportsUsed,
      })
    } catch (error) {
      console.error("Error loading user data:", error)
      setError("Failed to load user data")
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { user: initialUser },
        } = await supabase.auth.getUser()

        setUser(initialUser)

        if (initialUser) {
          await loadUserData(initialUser.id)
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setError("Failed to initialize authentication")
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserData(session.user.id)
      } else {
        setProfile(null)
        setPermissions(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Refresh user data
  const refreshUserData = async () => {
    if (user) {
      await loadUserData(user.id)
    }
  }

  return {
    user,
    profile,
    permissions,
    loading,
    error,
    refreshUserData,
    isAuthenticated: !!user,
    isPro: permissions?.subscriptionType === "pro",
  }
}
