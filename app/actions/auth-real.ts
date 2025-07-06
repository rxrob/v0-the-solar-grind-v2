"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { revalidatePath } from "next/cache"

interface AuthResult {
  success: boolean
  error?: string
  user?: any
  needsVerification?: boolean
  message?: string
}

export async function signInWithEmailReal(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = createServerClient()

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

    revalidatePath("/", "layout")
    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign in",
    }
  }
}

export async function signUpReal(email: string, password: string, fullName: string): Promise<AuthResult> {
  try {
    const supabase = createServerClient()

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

    // Check if email confirmation is required
    if (data.user && !data.user.email_confirmed_at) {
      return {
        success: true,
        needsVerification: true,
        user: data.user,
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
      user: data.user,
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign up",
    }
  }
}

export async function signOutReal(): Promise<AuthResult> {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/", "layout")
    return {
      success: true,
    }
  } catch (error) {
    console.error("Sign out error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign out",
    }
  }
}

export async function getCurrentUserReal() {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Get user error:", error)
      return null
    }

    if (!user) {
      return null
    }

    // Get user profile from our users table
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return {
        ...user,
        subscriptionPlan: "basic",
        subscriptionStatus: "inactive",
        emailVerified: !!user.email_confirmed_at,
      }
    }

    return {
      ...user,
      subscriptionPlan: profile?.subscription_type || "basic",
      subscriptionStatus: profile?.subscription_status || "inactive",
      emailVerified: !!user.email_confirmed_at,
      profile,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function resetPasswordReal(email: string): Promise<AuthResult> {
  try {
    const supabase = createServerClient()

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
      message: "Password reset email sent successfully",
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during password reset",
    }
  }
}

export async function updatePasswordReal(newPassword: string): Promise<AuthResult> {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Password updated successfully",
    }
  } catch (error) {
    console.error("Update password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during password update",
    }
  }
}

export async function updateUserProfileReal(updates: {
  name?: string
  phone?: string
  company?: string
}): Promise<AuthResult> {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    // Update auth user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: updates,
    })

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      }
    }

    // Update custom users table
    const { error: profileError } = await supabase
      .from("users")
      .update({
        full_name: updates.name,
        phone: updates.phone,
        company: updates.company,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("Profile update error:", profileError)
    }

    return {
      success: true,
      message: "Profile updated successfully",
    }
  } catch (error) {
    console.error("Update profile error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during profile update",
    }
  }
}

export async function checkUserPermissions(action: "basic_calc" | "pro_calc" | "admin") {
  try {
    const user = await getCurrentUserReal()

    if (!user) {
      return {
        canPerform: false,
        reason: "User not authenticated",
      }
    }

    const subscriptionPlan = user.subscriptionPlan || "basic"
    const subscriptionStatus = user.subscriptionStatus || "inactive"

    // Check if user's subscription is active
    if (subscriptionStatus !== "active") {
      return {
        canPerform: false,
        reason: "Subscription not active",
      }
    }

    switch (action) {
      case "basic_calc":
        return {
          canPerform: true,
          reason: "Basic calculations available to all users",
        }

      case "pro_calc":
        return {
          canPerform: subscriptionPlan === "professional" || subscriptionPlan === "enterprise",
          reason: subscriptionPlan === "basic" ? "Pro subscription required" : "Access granted",
        }

      case "admin":
        return {
          canPerform: subscriptionPlan === "enterprise",
          reason: subscriptionPlan !== "enterprise" ? "Enterprise subscription required" : "Access granted",
        }

      default:
        return {
          canPerform: false,
          reason: "Unknown action",
        }
    }
  } catch (error) {
    console.error("Permission check error:", error)
    return {
      canPerform: false,
      reason: "Permission check failed",
    }
  }
}

export async function trackUsageReal(calculationType: "basic" | "pro") {
  try {
    const user = await getCurrentUserReal()

    if (!user) {
      return {
        error: "User not authenticated",
      }
    }

    const supabase = createServerClient()

    // Track usage in database
    const { error } = await supabase.from("usage_tracking").insert({
      user_id: user.id,
      calculation_type: calculationType,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Usage tracking error:", error)
      return {
        error: "Failed to track usage",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Track usage error:", error)
    return {
      error: "Failed to track usage",
    }
  }
}

// Legacy exports for backward compatibility
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
