"use server"

import { createServerClient } from "@/lib/supabase-server-client"

// Types for authentication
interface AuthUser {
  id: string
  email: string | null
  name: string | null
  phone: string | null
  company: string | null
  subscriptionPlan: "basic" | "professional" | "enterprise"
  subscriptionStatus: "active" | "inactive" | "trial" | "cancelled"
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  stripeCustomerId?: string
  trialEndsAt?: string
  subscriptionEndsAt?: string
}

interface AuthResult {
  success: boolean
  error?: string
  user?: AuthUser | null
  needsVerification?: boolean
  message?: string
}

// Get current authenticated user
export async function getCurrentUserReal(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // Get user profile from our custom users table
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError || !profile) {
      // Create profile if it doesn't exist
      const newProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        phone: user.user_metadata?.phone || null,
        company: null,
        subscription_plan: "basic",
        subscription_status: "inactive",
        email_verified: user.email_confirmed_at ? true : false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data: createdProfile, error: createError } = await supabase
        .from("users")
        .insert(newProfile)
        .select()
        .single()

      if (createError) {
        console.error("Error creating user profile:", createError)
        return null
      }

      return {
        id: createdProfile.id,
        email: createdProfile.email,
        name: createdProfile.name,
        phone: createdProfile.phone,
        company: createdProfile.company,
        subscriptionPlan: createdProfile.subscription_plan,
        subscriptionStatus: createdProfile.subscription_status,
        emailVerified: createdProfile.email_verified,
        createdAt: createdProfile.created_at,
        updatedAt: createdProfile.updated_at,
        stripeCustomerId: createdProfile.stripe_customer_id,
        trialEndsAt: createdProfile.trial_ends_at,
        subscriptionEndsAt: createdProfile.subscription_ends_at,
      }
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone,
      company: profile.company,
      subscriptionPlan: profile.subscription_plan,
      subscriptionStatus: profile.subscription_status,
      emailVerified: profile.email_verified,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      stripeCustomerId: profile.stripe_customer_id,
      trialEndsAt: profile.trial_ends_at,
      subscriptionEndsAt: profile.subscription_ends_at,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Sign in with email and password
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

    if (data.user) {
      // Update last login
      await supabase
        .from("users")
        .update({
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        })
        .eq("id", data.user.id)

      const user = await getCurrentUserReal()
      return {
        success: true,
        user,
      }
    }

    return {
      success: false,
      error: "Authentication failed",
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    }
  }
}

// Sign up with email and password
export async function signUpReal(email: string, password: string, fullName: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.user) {
      // Check if email confirmation is required
      if (!data.user.email_confirmed_at && !data.session) {
        return {
          success: true,
          needsVerification: true,
          message: "Please check your email to verify your account",
        }
      }

      const user = await getCurrentUserReal()
      return {
        success: true,
        user,
      }
    }

    return {
      success: false,
      error: "Account creation failed",
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    }
  }
}

// Sign out
export async function signOutReal(): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.auth.signOut()

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
    console.error("Sign out error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign out failed",
    }
  }
}

// Reset password
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
      message: "Password reset instructions sent to your email",
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password reset failed",
    }
  }
}

// Update password
export async function updatePasswordReal(newPassword: string): Promise<AuthResult> {
  try {
    const supabase = await createServerClient()

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
      error: error instanceof Error ? error.message : "Password update failed",
    }
  }
}

// Update user profile
export async function updateUserProfileReal(updates: {
  name?: string
  phone?: string
  company?: string
}): Promise<AuthResult> {
  try {
    const user = await getCurrentUserReal()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const supabase = await createServerClient()

    const { error } = await supabase
      .from("users")
      .update({
        name: updates.name,
        phone: updates.phone,
        company: updates.company,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Also update auth metadata if name changed
    if (updates.name) {
      await supabase.auth.updateUser({
        data: { full_name: updates.name, name: updates.name },
      })
    }

    const updatedUser = await getCurrentUserReal()
    return {
      success: true,
      user: updatedUser,
    }
  } catch (error) {
    console.error("Update profile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Profile update failed",
    }
  }
}

// Check user permissions
export async function checkUserPermissions(action: "basic_calc" | "pro_calc" | "admin") {
  try {
    const user = await getCurrentUserReal()

    if (!user) {
      return { canPerform: false, reason: "User not authenticated" }
    }

    // Check email verification for all actions
    if (!user.emailVerified) {
      return { canPerform: false, reason: "Email not verified" }
    }

    switch (action) {
      case "basic_calc":
        // Basic calculations available to all verified users
        return { canPerform: true }

      case "pro_calc":
        // Pro calculations require active subscription or trial
        if (user.subscriptionPlan === "basic" && user.subscriptionStatus !== "trial") {
          return { canPerform: false, reason: "Pro subscription required" }
        }

        if (user.subscriptionStatus === "cancelled" || user.subscriptionStatus === "inactive") {
          return { canPerform: false, reason: "Active subscription required" }
        }

        // Check if trial has expired
        if (user.subscriptionStatus === "trial" && user.trialEndsAt) {
          const trialEnd = new Date(user.trialEndsAt)
          if (trialEnd < new Date()) {
            return { canPerform: false, reason: "Trial period expired" }
          }
        }

        return { canPerform: true }

      case "admin":
        // Admin actions require enterprise plan
        if (user.subscriptionPlan !== "enterprise") {
          return { canPerform: false, reason: "Admin privileges required" }
        }
        return { canPerform: true }

      default:
        return { canPerform: false, reason: "Unknown action" }
    }
  } catch (error) {
    console.error("Permission check error:", error)
    return { canPerform: false, reason: "Permission check failed" }
  }
}

// Track usage for billing/limits
export async function trackUsageReal(calculationType: "basic" | "pro") {
  try {
    const user = await getCurrentUserReal()
    if (!user) {
      return { error: "User not authenticated" }
    }

    const supabase = await createServerClient()

    // Record usage
    const { error } = await supabase.from("usage_tracking").insert({
      user_id: user.id,
      calculation_type: calculationType,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Usage tracking error:", error)
      return { error: "Failed to track usage" }
    }

    return { success: true }
  } catch (error) {
    console.error("Track usage error:", error)
    return { error: "Usage tracking failed" }
  }
}

// Legacy exports for backward compatibility
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
