"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  loading: boolean
  subscription: "free" | "pro" | null
  isAuthenticated: boolean
}

export function useAuthReal(): AuthState {
  const [user, setUser] = useState<User | null>(null)
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
          setUser(null)
          setSubscription(null)
        } else if (session?.user) {
          setUser(session.user)
          await fetchUserSubscription(session.user.id)
        } else {
          setUser(null)
          setSubscription(null)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setUser(null)
        setSubscription(null)
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

      if (session?.user) {
        setUser(session.user)
        await fetchUserSubscription(session.user.id)
      } else {
        setUser(null)
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
      setSubscription("free") // Default to free on error
    }
  }

  return {
    user,
    loading,
    subscription,
    isAuthenticated: !!user,
  }
}

// Export alias for compatibility
export const useAuth = useAuthReal
