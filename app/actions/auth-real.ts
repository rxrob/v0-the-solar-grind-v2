"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

interface User {
  id: string
  email: string | null
  full_name?: string
  subscription_type?: string
  subscription_status?: string
}

interface AuthResult {
  success: boolean
  error?: string
  user?: User | null
  needsVerification?: boolean
}

export async function signUpReal(email: string, password: string, fullName: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.user && !data.user.email_confirmed_at) {
      return {
        success: true,
        needsVerification: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          full_name: fullName,
        },
      }
    }

    // Create user profile in our users table
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        subscription_type: "free",
        subscription_status: "active",
        created_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
      }
    }

    return {
      success: true,
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
          }
        : null,
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    }
  }
}

export async function signInReal(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Get user profile
    let userProfile = null
    if (data.user) {
      const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

      userProfile = profile
    }

    return {
      success: true,
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            full_name: userProfile?.full_name,
            subscription_type: userProfile?.subscription_type,
            subscription_status: userProfile?.subscription_status,
          }
        : null,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    }
  }
}

export async function signInWithEmailReal(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Get user profile
    let userProfile = null
    if (data.user) {
      const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()
      userProfile = profile
    }

    return {
      success: true,
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            full_name: userProfile?.full_name,
            subscription_type: userProfile?.subscription_type,
            subscription_status: userProfile?.subscription_status,
          }
        : null,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    }
  }
}

export async function signOutReal(): Promise<void> {
  try {
    const supabase = await createServerClient()
    await supabase.auth.signOut()
    revalidatePath("/")
    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
    redirect("/")
  }
}

export async function getCurrentUserReal(): Promise<User | null> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get user profile from our users table
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return {
        id: user.id,
        email: user.email,
      }
    }

    return {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name,
      subscription_type: profile?.subscription_type,
      subscription_status: profile?.subscription_status,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function resetPasswordReal(email: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
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
      error: error instanceof Error ? error.message : "Reset password failed",
    }
  }
}

export async function updatePasswordReal(password: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
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
      error: error instanceof Error ? error.message : "Update password failed",
    }
  }
}

export async function handleAuthCallbackReal() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error("Auth callback error:", error)
      redirect("/login?error=auth_callback_error")
    }

    if (data.session) {
      redirect("/dashboard")
    } else {
      redirect("/login")
    }
  } catch (error) {
    console.error("Auth callback error:", error)
    redirect("/login?error=auth_callback_error")
  }
}

// Legacy exports for backward compatibility
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
