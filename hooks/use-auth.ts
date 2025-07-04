"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  const supabase = createSupabaseClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ Error getting session:", error.message)
          setAuthState({ user: null, loading: false, error: error.message })
        } else {
          setAuthState({ user: session?.user ?? null, loading: false, error: null })
        }
      } catch (err: any) {
        console.error("❌ Session error:", err)
        setAuthState({ user: null, loading: false, error: err.message })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email)
      setAuthState({ user: session?.user ?? null, loading: false, error: null })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  return authState
}

// Auth helper functions
export const authHelpers = {
  async signIn(email: string, password: string) {
    const supabase = createSupabaseClient()
    return await supabase.auth.signInWithPassword({ email, password })
  },

  async signUp(email: string, password: string) {
    const supabase = createSupabaseClient()
    return await supabase.auth.signUp({ email, password })
  },

  async signOut() {
    const supabase = createSupabaseClient()
    return await supabase.auth.signOut()
  },

  async signInWithGoogle() {
    const supabase = createSupabaseClient()
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  },

  async resetPassword(email: string) {
    const supabase = createSupabaseClient()
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
  },

  async updatePassword(password: string) {
    const supabase = createSupabaseClient()
    return await supabase.auth.updateUser({ password })
  },
}
