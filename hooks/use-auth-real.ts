"use client"

import { useState, useEffect, useCallback } from "react"
import type { User, Session, SignUpWithPasswordCredentials } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase-browser"

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

interface SignUpResult {
  success: boolean
  error?: string | null
  needsConfirmation?: boolean
}

// This is the primary authentication hook for the application.
// It uses a named export to prevent import errors.
export function useAuthReal() {
  const supabase = createClient()
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
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
          session: session,
          loading: false,
          error: null,
          isAuthenticated: !!session?.user,
        })
      } catch (error) {
        setState({
          user: null,
          session: null,
          loading: false,
          error: error instanceof Error ? error.message : "Authentication error",
          isAuthenticated: false,
        })
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session: session,
        loading: false,
        error: null,
        isAuthenticated: !!session?.user,
      })
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = useCallback(
    async (credentials: { email: string; password: string }) => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const { error } = await supabase.auth.signInWithPassword(credentials)
      if (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }))
        return { success: false, error: error.message }
      }
      return { success: true }
    },
    [supabase],
  )

  const signUp = useCallback(
    async (credentials: SignUpWithPasswordCredentials): Promise<SignUpResult> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      const { data, error } = await supabase.auth.signUp(credentials)

      if (error) {
        setState((prev) => ({ ...prev, loading: false, error: error.message }))
        return { success: false, error: error.message }
      }

      const needsConfirmation = data.user?.identities?.length === 0
      setState((prev) => ({ ...prev, loading: false }))
      return { success: true, needsConfirmation }
    },
    [supabase],
  )

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }))
    await supabase.auth.signOut()
    // The onAuthStateChange listener will handle setting the final state
    return { success: true }
  }, [supabase])

  return {
    ...state,
    signIn,
    signOut,
    signUp,
  }
}

// Alias for compatibility
export const useAuth = useAuthReal

// Default export for components that might be using it
export default useAuthReal
