"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"
import { getCurrentUserReal, checkUserPermissions } from "@/app/actions/auth-real"

interface UserProfile {
  id: string
  email: string
  full_name: string
  subscription_type: string
  calculations_used: number
  reports_used: number
  created_at: string
  updated_at: string
}

interface UserPermissions {
  canAccessPro: boolean
  canGenerateReports: boolean
  calculationsRemaining: number
  reportsRemaining: number
  subscriptionType: string
  calculationsUsed: number
  reportsUsed: number
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  permissions: UserPermissions | null
  loading: boolean
  error: string | null
}

export function useAuthReal() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    permissions: null,
    loading: true,
    error: null,
  })

  // Load initial auth state
  useEffect(() => {
    async function loadAuthState() {
      try {
        setAuthState((prev) => ({ ...prev, loading: true, error: null }))

        // Get current user and profile
        const { user, profile, error } = await getCurrentUserReal()

        if (error) {
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error,
          }))
          return
        }

        if (user && profile) {
          // Get user permissions
          const permissionsResult = await checkUserPermissions(user.id)

          setAuthState({
            user,
            profile,
            permissions: permissionsResult.success ? permissionsResult.permissions : null,
            loading: false,
            error: permissionsResult.success ? null : permissionsResult.error,
          })
        } else {
          setAuthState({
            user: null,
            profile: null,
            permissions: null,
            loading: false,
            error: null,
          })
        }
      } catch (error) {
        console.error("Error loading auth state:", error)
        setAuthState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load auth state",
        }))
      }
    }

    loadAuthState()
  }, [])

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id)

      if (event === "SIGNED_OUT" || !session?.user) {
        setAuthState({
          user: null,
          profile: null,
          permissions: null,
          loading: false,
          error: null,
        })
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        try {
          setAuthState((prev) => ({ ...prev, loading: true }))

          // Get updated user and profile
          const { user, profile, error } = await getCurrentUserReal()

          if (error) {
            setAuthState((prev) => ({
              ...prev,
              loading: false,
              error,
            }))
            return
          }

          if (user && profile) {
            // Get updated permissions
            const permissionsResult = await checkUserPermissions(user.id)

            setAuthState({
              user,
              profile,
              permissions: permissionsResult.success ? permissionsResult.permissions : null,
              loading: false,
              error: permissionsResult.success ? null : permissionsResult.error,
            })
          }
        } catch (error) {
          console.error("Error updating auth state:", error)
          setAuthState((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : "Failed to update auth state",
          }))
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Refresh permissions
  const refreshPermissions = async () => {
    if (!authState.user) return

    try {
      const permissionsResult = await checkUserPermissions(authState.user.id)

      setAuthState((prev) => ({
        ...prev,
        permissions: permissionsResult.success ? permissionsResult.permissions : prev.permissions,
        error: permissionsResult.success ? null : permissionsResult.error,
      }))
    } catch (error) {
      console.error("Error refreshing permissions:", error)
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to refresh permissions",
      }))
    }
  }

  // Refresh profile
  const refreshProfile = async () => {
    if (!authState.user) return

    try {
      const { user, profile, error } = await getCurrentUserReal()

      if (error) {
        setAuthState((prev) => ({ ...prev, error }))
        return
      }

      setAuthState((prev) => ({
        ...prev,
        user: user || prev.user,
        profile: profile || prev.profile,
        error: null,
      }))

      // Also refresh permissions
      await refreshPermissions()
    } catch (error) {
      console.error("Error refreshing profile:", error)
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to refresh profile",
      }))
    }
  }

  return {
    ...authState,
    refreshPermissions,
    refreshProfile,
    isAuthenticated: !!authState.user,
    isPro: authState.permissions?.subscriptionType === "pro",
    canAccessPro: authState.permissions?.canAccessPro || false,
    canGenerateReports: authState.permissions?.canGenerateReports || false,
  }
}
