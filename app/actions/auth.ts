"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { redirect } from "next/navigation"

interface AuthResult {
  success: boolean
  error?: string
  user?: any
  needsVerification?: boolean
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Sign up error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.user && !data.user.email_confirmed_at) {
      return {
        success: true,
        needsVerification: true,
        user: data.user,
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createServerClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Sign out error:", error)
  }
  redirect("/")
}

export async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Get user error:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      console.error("Reset password error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error("Update password error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Update password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function handleAuthCallback(code: string) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Auth callback error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function signInWithGoogle() {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Google sign in error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.url) {
      redirect(data.url)
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Google sign in error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

export async function handleSignUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  const result = await signUp(email, password)

  if (result.success && "needsVerification" in result && result.needsVerification) {
    redirect("/verify-email")
  } else if (result.success) {
    redirect("/dashboard")
  }

  return result
}

export async function handleSignIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  const result = await signIn(email, password)

  if (result.success) {
    redirect("/dashboard")
  }

  return result
}

export async function handleResetPassword(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return {
      success: false,
      error: "Email is required",
    }
  }

  return await resetPassword(email)
}

export async function handleUpdatePassword(formData: FormData) {
  const password = formData.get("password") as string

  if (!password) {
    return {
      success: false,
      error: "Password is required",
    }
  }

  const result = await updatePassword(password)

  if (result.success) {
    redirect("/dashboard")
  }

  return result
}
