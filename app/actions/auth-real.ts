"use server"

import { createServerSupabaseClient, isSupabaseAvailable } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Sign in with email and password
export async function signInWithEmailReal(email: string, password: string) {
  if (!isSupabaseAvailable()) {
    return { error: "Authentication service not available - using demo mode" }
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/dashboard")
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "An unexpected error occurred during sign in" }
  }
}

// Sign up new user
export async function signUpReal(email: string, password: string, fullName?: string) {
  if (!isSupabaseAvailable()) {
    return { error: "Authentication service not available - using demo mode" }
  }

  try {
    const supabase = createServerSupabaseClient()
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
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true, message: "Check your email to confirm your account" }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred during sign up" }
  }
}

// Sign out user
export async function signOutReal() {
  if (!isSupabaseAvailable()) {
    redirect("/")
    return
  }

  try {
    const supabase = createServerSupabaseClient()
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
    redirect("/")
  }
}

// Get current user
export async function getCurrentUserReal() {
  if (!isSupabaseAvailable()) {
    return { user: null, error: "Authentication service not available" }
  }

  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: error.message }
    }

    return { user, error: null }
  } catch (error) {
    console.error("Get user error:", error)
    return { user: null, error: "Failed to get user information" }
  }
}

// Reset password
export async function resetPasswordReal(email: string) {
  if (!isSupabaseAvailable()) {
    return { error: "Authentication service not available - using demo mode" }
  }

  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true, message: "Password reset email sent" }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update password
export async function updatePasswordReal(newPassword: string) {
  if (!isSupabaseAvailable()) {
    return { error: "Authentication service not available - using demo mode" }
  }

  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    console.error("Update password error:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update user profile
export async function updateUserProfileReal(updates: { full_name?: string; email?: string }) {
  if (!isSupabaseAvailable()) {
    return { error: "Authentication service not available - using demo mode" }
  }

  try {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Check user permissions
export async function checkUserPermissions() {
  if (!isSupabaseAvailable()) {
    // Return demo permissions when Supabase is not available
    return {
      user: {
        id: "demo-user",
        email: "demo@example.com",
        subscription_status: "pro",
        subscription_type: "monthly",
        trial_ends_at: null,
        calculations_used: 0,
        max_calculations: 1000,
      },
      permissions: {
        canAccessPro: true,
        canGenerateReports: true,
        calculationsRemaining: 1000,
      },
    }
  }

  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        user: null,
        permissions: {
          canAccessPro: false,
          canGenerateReports: false,
          calculationsRemaining: 0,
        },
      }
    }

    // Get user data from database
    const { data: userData, error: dbError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (dbError) {
      console.error("Database error:", dbError)
      return {
        user: null,
        permissions: {
          canAccessPro: false,
          canGenerateReports: false,
          calculationsRemaining: 0,
        },
      }
    }

    const isPro = userData?.subscription_status === "active" || userData?.subscription_status === "pro"
    const calculationsUsed = userData?.calculations_used || 0
    const maxCalculations = isPro ? 1000 : 5
    const calculationsRemaining = Math.max(0, maxCalculations - calculationsUsed)

    return {
      user: userData,
      permissions: {
        canAccessPro: isPro,
        canGenerateReports: isPro,
        calculationsRemaining,
      },
    }
  } catch (error) {
    console.error("Check permissions error:", error)
    return {
      user: null,
      permissions: {
        canAccessPro: false,
        canGenerateReports: false,
        calculationsRemaining: 0,
      },
    }
  }
}

// Track usage
export async function trackUsageReal(calculationType = "basic") {
  if (!isSupabaseAvailable()) {
    console.log("📊 Demo mode: Usage tracking simulated")
    return { success: true, message: "Usage tracked (demo mode)" }
  }

  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "User not authenticated" }
    }

    // Update user's calculation count
    const { error: updateError } = await supabase
      .from("users")
      .update({
        calculations_used: supabase.raw("calculations_used + 1"),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Usage tracking error:", updateError)
      return { error: "Failed to track usage" }
    }

    // Log the calculation
    const { error: logError } = await supabase.from("solar_calculations").insert({
      user_id: user.id,
      calculation_type: calculationType,
      created_at: new Date().toISOString(),
    })

    if (logError) {
      console.error("Calculation logging error:", logError)
      // Don't return error here as usage was still tracked
    }

    return { success: true, message: "Usage tracked successfully" }
  } catch (error) {
    console.error("Track usage error:", error)
    return { error: "An unexpected error occurred while tracking usage" }
  }
}

// Export functions without "Real" suffix for backward compatibility
export const signIn = signInWithEmailReal
export const signUp = signUpReal
export const signOut = signOutReal
export const getCurrentUser = getCurrentUserReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
