"use client"

import { useState, useEffect, useCallback } from "react"
import type { User, AuthError } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase-browser"

interface AuthState {
  user: User | null
  loading: boolean
  error: AuthError | null
}

export function useAuthReal() {
  const supabase = createClient()
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
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
          error: error as AuthError,
        })
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        loading: false,
        error: null,
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = useCallback(
    async (email, password) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setState((prev) => ({ ...prev, loading: false, error }))
      }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))
    await supabase.auth.signOut()
    setState({ user: null, loading: false, error: null })
  }, [supabase])

  return {
    ...state,
    signIn,
    signOut,
  }
}

// Alias for compatibility
export const useAuth = useAuthReal
