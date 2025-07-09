"use client"

import { useState, useEffect } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuthReal() {
  const [state, setState] = useState<AuthState>({
    user: null,
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
        if (error) throw error

        setState({
          user: session?.user ?? null,
          loading: false,
          error: null,
        })
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : "Authentication error",
        })
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : "Sign in failed",
      }))
    }
  }

  const signOut = async () => {
    setState((prev) => ({ ...prev, loading: true }))
    await supabase.auth.signOut()
  }

  return {
    ...state,
    signIn,
    signOut,
  }
}

// Alias for compatibility
export const useAuth = useAuthReal
