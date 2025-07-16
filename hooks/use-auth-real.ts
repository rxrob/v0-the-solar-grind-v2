"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { getSupabaseBrowserClient } from "@/lib/supabaseClient"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  subscription_tier?: string
  subscription_status?: string
  reports_used?: number
  single_reports_purchased?: number
  max_reports?: number
  stripe_customer_id?: string
  trial_ends_at?: string
  created_at?: string
  updated_at?: string
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  isPro: boolean
  isIONEmployee: boolean
  signOut: () => Promise<void>
}

export function useAuthReal(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileFetched, setProfileFetched] = useState(false)

  const supabase = getSupabaseBrowserClient()

  const fetchProfile = async (currentUser: User) => {
    if (profileFetched) return

    try {
      setProfileFetched(true)
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const text = await response.text()
        console.error("Profile fetch failed:", text)

        // If it's a rate limit error, allow retry
        if (response.status === 429) {
          setProfileFetched(false)
          return
        }

        setError(`Failed to fetch profile: ${response.status}`)
        return
      }

      const data = await response.json()
      setProfile(data.profile)
      setError(null)
    } catch (err) {
      console.error("Profile fetch error:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
      setProfileFetched(false) // Allow retry on error
    }
  }

  const signOut = async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error("Sign out error:", signOutError)
        setError(signOutError.message)
      } else {
        setUser(null)
        setProfile(null)
        setProfileFetched(false)
        setError(null)
      }
    } catch (err) {
      console.error("Sign out error:", err)
      setError(err instanceof Error ? err.message : "Sign out failed")
    }
  }

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError(sessionError.message)
          setLoading(false)
          return
        }

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user)
        } else {
          setUser(null)
          setProfile(null)
        }

        setLoading(false)
      } catch (err) {
        console.error("Auth initialization error:", err)
        if (mounted) {
          setError(err instanceof Error ? err.message : "Auth initialization failed")
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event, session?.user?.email)

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setProfileFetched(false) // Reset profile fetch flag
        await fetchProfile(session.user)
        setError(null)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setProfileFetched(false)
        setError(null)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const isAuthenticated = !!user
  const isPro = profile?.subscription_tier === "pro" || profile?.email?.includes("@ionsolar.com") || false
  const isIONEmployee = profile?.email?.includes("@ionsolar.com") || false

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    isPro,
    isIONEmployee,
    signOut,
  }
}

// Named export for compatibility
export function useAuth(): AuthState {
  return useAuthReal()
}

// Default export
export default useAuthReal
