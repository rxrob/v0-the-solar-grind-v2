"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface AuthResult {
  success: boolean
  error?: string
  user?: any
}

export async function signUp(email: string, password: string, fullName?: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

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
      console.error("Sign up error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        subscription_type: "free",
        subscription_status: "active",
        monthly_calculation_limit: 3,
        calculations_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
        // Don't fail signup if profile creation fails
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
      error: error instanceof Error ? error.message : "Sign up failed",
    }
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

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

    revalidatePath("/", "layout")
    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    }
  }
}

export async function signOut(): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/", "layout")
    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign out failed",
    }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Get current user error:", error)
      return {
        success: false,
        error: error.message,
        user: null,
      }
    }

    if (!user) {
      return {
        success: false,
        error: "No user found",
        user: null,
      }
    }

    // Get user profile data
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      console.error("Get user profile error:", profileError)
      return {
        success: true,
        user: {
          ...user,
          profile: null,
        },
      }
    }

    return {
      success: true,
      user: {
        ...user,
        profile,
      },
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get current user",
      user: null,
    }
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

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
      error: error instanceof Error ? error.message : "Password reset failed",
    }
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

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
      error: error instanceof Error ? error.message : "Password update failed",
    }
  }
}

export async function updateProfile(userId: string, updates: any): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Update profile error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/dashboard")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Update profile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Profile update failed",
    }
  }
}
