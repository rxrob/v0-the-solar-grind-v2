"use server"

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Sign up with email and password
export async function signUpReal(email: string, password: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          email: data.user.email,
          subscription_type: "free",
          subscription_status: "active",
          created_at: new Date().toISOString(),
        },
      ])

      if (profileError) {
        console.error("Profile creation error:", profileError)
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Sign up failed" }
  }
}

// Sign in with email and password
export async function signInWithEmailReal(email: string, password: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true, data }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Sign in failed" }
  }
}

// Sign out
export async function signOutReal() {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Sign out failed" }
  }
}

// Get current user
export async function getCurrentUserReal() {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { success: false, error: error.message, user: null }
    }

    // Get user profile
    if (user) {
      const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        return { success: true, user, profile: null }
      }

      return { success: true, user, profile }
    }

    return { success: true, user: null, profile: null }
  } catch (error) {
    console.error("Get current user error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to get user", user: null }
  }
}

// Reset password
export async function resetPasswordReal(email: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Password reset email sent" }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Password reset failed" }
  }
}

// Update password
export async function updatePasswordReal(password: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Password updated successfully" }
  } catch (error) {
    console.error("Update password error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Password update failed" }
  }
}

// Update user profile
export async function updateUserProfileReal(userId: string, updates: any) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true, data }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Profile update failed" }
  }
}

// Check user permissions
export async function checkUserPermissions(userId: string) {
  const supabase = createClient()

  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("subscription_type, subscription_status, calculations_used, reports_generated, api_calls_made")
      .eq("id", userId)
      .single()

    if (error) {
      return { success: false, error: error.message, permissions: null }
    }

    const permissions = {
      canUseAdvancedCalculator: user.subscription_type === "pro" && user.subscription_status === "active",
      canGenerateReports: user.subscription_type === "pro" && user.subscription_status === "active",
      canAccessProFeatures: user.subscription_type === "pro" && user.subscription_status === "active",
      calculationsUsed: user.calculations_used || 0,
      reportsGenerated: user.reports_generated || 0,
      apiCallsMade: user.api_calls_made || 0,
      subscriptionType: user.subscription_type,
      subscriptionStatus: user.subscription_status,
    }

    return { success: true, permissions }
  } catch (error) {
    console.error("Check permissions error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Permission check failed",
      permissions: null,
    }
  }
}

// Track usage
export async function trackUsageReal(userId: string, type: "calculation" | "report" | "api_call") {
  const supabase = createClient()

  try {
    const field =
      type === "calculation" ? "calculations_used" : type === "report" ? "reports_generated" : "api_calls_made"

    const { data, error } = await supabase.rpc("increment_usage", {
      user_id: userId,
      usage_type: field,
    })

    if (error) {
      // Fallback to manual increment if RPC doesn't exist
      const { data: currentUser, error: fetchError } = await supabase
        .from("users")
        .select(field)
        .eq("id", userId)
        .single()

      if (fetchError) {
        return { success: false, error: fetchError.message }
      }

      const currentValue = currentUser[field] || 0
      const { error: updateError } = await supabase
        .from("users")
        .update({ [field]: currentValue + 1 })
        .eq("id", userId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Track usage error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Usage tracking failed" }
  }
}

// Legacy compatibility exports
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
export const signInWithEmail = signInWithEmailReal
export const signUp = signUpReal
