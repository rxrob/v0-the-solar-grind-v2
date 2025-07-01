"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  email: string
  subscription_tier: "free" | "pro" | "enterprise"
  subscription_plan?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          // In demo mode, create a mock user
          setUser({
            id: session.user.id,
            email: session.user.email || "demo@example.com",
            subscription_tier: "pro", // Demo user has pro access
            subscription_plan: "professional",
          })
        } else {
          // Demo mode - create a mock user for testing
          setUser({
            id: "demo-user-id",
            email: "demo@example.com",
            subscription_tier: "pro",
            subscription_plan: "professional",
          })
        }
      } catch (error) {
        console.warn("Auth error, using demo mode:", error)
        // Fallback to demo user
        setUser({
          id: "demo-user-id",
          email: "demo@example.com",
          subscription_tier: "pro",
          subscription_plan: "professional",
        })
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "demo@example.com",
          subscription_tier: "pro",
          subscription_plan: "professional",
        })
      } else {
        // Keep demo user even when signed out
        setUser({
          id: "demo-user-id",
          email: "demo@example.com",
          subscription_tier: "pro",
          subscription_plan: "professional",
        })
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Keep demo user after sign out
      setUser({
        id: "demo-user-id",
        email: "demo@example.com",
        subscription_tier: "pro",
        subscription_plan: "professional",
      })
    } catch (error) {
      console.warn("Sign out error:", error)
    }
  }

  return {
    user,
    loading,
    signOut,
  }
}
