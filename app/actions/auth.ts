"use server"

import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          subscription_type: "free",
          calculations_used: 0,
          calculations_limit: 5,
        },
      }
    }

    return { success: true, data: userData }
  } catch (error) {
    console.error("Get current user error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user",
    }
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

    // Set session cookie
    if (data.session) {
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

export async function signUp(email: string, password: string, fullName?: string) {
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
      // Create user record in our users table
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        subscription_type: "free",
        calculations_used: 0,
        calculations_limit: 5,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating user record:", insertError)
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

export async function redirectToLogin() {
  redirect("/login")
}

export async function redirectToDashboard() {
  redirect("/dashboard")
}
