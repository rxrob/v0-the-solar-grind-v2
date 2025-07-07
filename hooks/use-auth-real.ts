"use client"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { useSupabase } from "@/components/supabase-provider"
import { toast } from "sonner"

interface SignUpData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

interface SignInData {
  email: string
  password: string
}

export function useAuthReal() {
  const { user, session, loading } = useSupabase()
  const router = useRouter()

  const signUp = async ({ email, password, firstName, lastName }: SignUpData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || null,
            first_name: firstName || null,
            last_name: lastName || null,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      if (data.user && !data.session) {
        toast.success("Check your email to confirm your account")
        return { success: true, needsConfirmation: true }
      }

      toast.success("Account created!")
      return { success: true, user: data.user }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred"
      toast.error(msg)
      return { success: false, error: msg }
    }
  }

  const signIn = async ({ email, password }: SignInData) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      toast.success("Signed in!")
      router.push("/dashboard")
      return { success: true, user: data.user }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred"
      toast.error(msg)
      return { success: false, error: msg }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      toast.success("Signed out!")
      router.push("/")
      return { success: true }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred"
      toast.error(msg)
      return { success: false, error: msg }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      toast.success("Password reset email sent!")
      return { success: true }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred"
      toast.error(msg)
      return { success: false, error: msg }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })

      if (error) {
        toast.error(error.message)
        return { success: false, error: error.message }
      }

      toast.success("Password updated!")
      return { success: true }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred"
      toast.error(msg)
      return { success: false, error: msg }
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }
}

export default useAuthReal
