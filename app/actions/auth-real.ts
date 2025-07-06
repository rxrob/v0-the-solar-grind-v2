"use server"

import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"

export async function signInWithEmail(email: string, password: string) {
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

    if (data.session) {
      // Set session cookie
      cookieStore.set("supabase-auth-token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return { success: true, data: data.user }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    }
  }
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
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

      // Set session cookie if user is confirmed
      if (data.session) {
        cookieStore.set("supabase-auth-token", data.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }
    }

    return { success: true, data: data.user }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    }
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

    // Clear session cookie
    cookieStore.delete("supabase-auth-token")

    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign out failed",
    }
  }
}

export async function getUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, user: null }
    }

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return {
        success: true,
        user: {
          ...user,
          subscription_type: "free",
          calculations_used: 0,
          monthly_calculation_limit: 3,
        },
      }
    }

    return {
      success: true,
      user: {
        ...user,
        ...userData,
      },
    }
  } catch (error) {
    console.error("Get user error:", error)
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : "Failed to get user",
    }
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password reset failed",
    }
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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password update failed",
    }
  }
}

export async function getCurrentUser() {
  return await getUser()
}
