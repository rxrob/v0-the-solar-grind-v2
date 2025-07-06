"use server"

import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function signUp(email: string, password: string, fullName: string) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()

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
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Create user profile in our users table
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        subscription_type: "free",
        subscription_status: "active",
        calculations_used: 0,
        monthly_calculation_limit: 3,
        pro_trial_used: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

export async function signOut() {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: "Failed to sign out" }
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, user: null }
    }

    // Get user profile from our users table
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return { success: true, user, profile: null }
    }

    return { success: true, user, profile }
  } catch (error) {
    console.error("Get current user error:", error)
    return { success: false, user: null }
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Update user profile error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function resetPassword(email: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Password reset email sent" }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "Failed to send reset email" }
  }
}

export async function updatePassword(password: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    console.error("Update password error:", error)
    return { success: false, error: "Failed to update password" }
  }
}
