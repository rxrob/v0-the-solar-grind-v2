"use client"

import { useState, useEffect, useCallback } from "react"

interface User {
  id: string
  email: string
  user_metadata?: any
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string, fullName?: string) => Promise<boolean>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (newPassword: string) => Promise<boolean>
  updateProfile: (updates: any) => Promise<boolean>
  refreshUser: () => Promise<void>
}

export function useAuthReal(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // Check for existing session in localStorage or cookies
      const storedUser = localStorage.getItem("auth-user")
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setState((prev) => ({ ...prev, user, loading: false }))
        } catch (e) {
          localStorage.removeItem("auth-user")
          setState((prev) => ({ ...prev, user: null, loading: false }))
        }
      } else {
        setState((prev) => ({ ...prev, user: null, loading: false }))
      }
    } catch (error) {
      console.error("Auth initialization error:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Auth initialization failed",
        loading: false,
      }))
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success && result.user) {
        const user = result.user
        localStorage.setItem("auth-user", JSON.stringify(user))
        setState((prev) => ({ ...prev, user, loading: false }))
        return true
      } else {
        setState((prev) => ({
          ...prev,
          error: result.message || "Sign in failed",
          loading: false,
        }))
        return false
      }
    } catch (error) {
      console.error("Sign in error:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Sign in failed",
        loading: false,
      }))
      return false
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      })

      const result = await response.json()

      if (result.success) {
        setState((prev) => ({ ...prev, loading: false }))
        return true
      } else {
        setState((prev) => ({
          ...prev,
          error: result.message || "Sign up failed",
          loading: false,
        }))
        return false
      }
    } catch (error) {
      console.error("Sign up error:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Sign up failed",
        loading: false,
      }))
      return false
    }
  }, [])

  const signOut = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      // Clear local storage
      localStorage.removeItem("auth-user")

      // Call server-side signout
      await fetch("/api/auth/signout", { method: "POST" })

      setState((prev) => ({ ...prev, user: null, loading: false }))
    } catch (error) {
      console.error("Sign out error:", error)
      // Still clear local state even if server call fails
      localStorage.removeItem("auth-user")
      setState((prev) => ({
        ...prev,
        user: null,
        error: error instanceof Error ? error.message : "Sign out failed",
        loading: false,
      }))
    }
  }, [])

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      setState((prev) => ({ ...prev, loading: false }))

      if (result.success) {
        return true
      } else {
        setState((prev) => ({
          ...prev,
          error: result.message || "Password reset failed",
        }))
        return false
      }
    } catch (error) {
      console.error("Password reset error:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Password reset failed",
        loading: false,
      }))
      return false
    }
  }, [])

  const updatePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })

      const result = await response.json()

      setState((prev) => ({ ...prev, loading: false }))

      if (result.success) {
        return true
      } else {
        setState((prev) => ({
          ...prev,
          error: result.message || "Password update failed",
        }))
        return false
      }
    } catch (error) {
      console.error("Password update error:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Password update failed",
        loading: false,
      }))
      return false
    }
  }, [])

  const updateProfile = useCallback(async (updates: any): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      const result = await response.json()

      if (result.success && result.user) {
        const updatedUser = result.user
        localStorage.setItem("auth-user", JSON.stringify(updatedUser))
        setState((prev) => ({ ...prev, user: updatedUser, loading: false }))
        return true
      } else {
        setState((prev) => ({
          ...prev,
          error: result.message || "Profile update failed",
          loading: false,
        }))
        return false
      }
    } catch (error) {
      console.error("Profile update error:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Profile update failed",
        loading: false,
      }))
      return false
    }
  }, [])

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch("/api/auth/user")
      const result = await response.json()

      if (result.success && result.user) {
        const user = result.user
        localStorage.setItem("auth-user", JSON.stringify(user))
        setState((prev) => ({ ...prev, user, loading: false }))
      } else {
        localStorage.removeItem("auth-user")
        setState((prev) => ({ ...prev, user: null, loading: false }))
      }
    } catch (error) {
      console.error("Refresh user error:", error)
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to refresh user",
        loading: false,
      }))
    }
  }, [])

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshUser,
  }
}
