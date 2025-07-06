"use server"

import {
  signInWithEmailReal,
  signUpReal,
  signOutReal,
  getCurrentUserReal,
  resetPasswordReal,
  updatePasswordReal,
  updateUserProfileReal,
  checkUserPermissions,
  trackUsageReal,
} from "./auth-real"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase"

// Main sign in function - now uses real Supabase auth
export async function signIn(email: string, password: string) {
  try {
    if (!email.includes("@")) {
      return { error: "Please enter a valid email address" }
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" }
    }

    // Use real Supabase authentication
    const result = await signInWithEmailReal(email, password)

    if (result.error) {
      return { error: result.error }
    }

    if (result.success && result.user) {
      // Get user data to determine redirect path
      const userData = await getCurrentUserReal()

      let redirectPath = "/dashboard"
      if (userData?.subscriptionPlan === "basic") {
        redirectPath = "/dashboard/free"
      } else if (userData?.subscriptionPlan === "professional") {
        redirectPath = "/dashboard/pro"
      } else if (userData?.subscriptionPlan === "enterprise") {
        redirectPath = "/dashboard/enterprise"
      }

      return {
        success: true,
        user: result.user,
        redirectPath,
      }
    }

    return { error: "Authentication failed" }
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "An unexpected error occurred during sign in" }
  }
}

// Google sign in - placeholder for future implementation
export async function signInWithGoogle() {
  try {
    // For now, return a message about Google auth
    // In the future, this would use Supabase OAuth
    return {
      error: "Google authentication will be available soon. Please use email/password for now.",
    }
  } catch (error) {
    console.error("Google sign in error:", error)
    return { error: "Google authentication temporarily unavailable" }
  }
}

// Sign up function - now uses real Supabase auth
export async function signUp(email: string, password: string, fullName: string) {
  try {
    if (!email.includes("@")) {
      return { error: "Please enter a valid email address" }
    }

    if (password.length < 6) {
      return { error: "Password must be at least 6 characters" }
    }

    if (!fullName.trim()) {
      return { error: "Full name is required" }
    }

    // Use real Supabase authentication
    const result = await signUpReal(email, password, fullName)

    if (result.error) {
      return { error: result.error }
    }

    if (result.success) {
      if ("needsVerification" in result && result.needsVerification) {
        return {
          success: true,
          needsVerification: true,
          message: "Please check your email to verify your account before signing in.",
          redirectPath: "/verify-email",
        }
      }

      // New signups default to basic tier
      return {
        success: true,
        user: result.user,
        redirectPath: "/dashboard/free",
      }
    }

    return { error: "Account creation failed" }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "An unexpected error occurred during sign up" }
  }
}

// Sign out function - now uses real Supabase auth
export async function signOut() {
  try {
    const result = await signOutReal()

    if (result.error) {
      return { error: result.error }
    }

    return {
      success: true,
      redirectPath: "/login",
    }
  } catch (error) {
    console.error("Sign out error:", error)
    return { error: "An unexpected error occurred during sign out" }
  }
}

// Get current user - uses real auth
export async function getCurrentUser() {
  try {
    return await getCurrentUserReal()
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

// Password reset
export async function resetPassword(email: string) {
  try {
    if (!email.includes("@")) {
      return { error: "Please enter a valid email address" }
    }

    const result = await resetPasswordReal(email)

    if (result.error) {
      return { error: result.error }
    }

    return {
      success: true,
      message: "Password reset instructions have been sent to your email.",
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return { error: "Failed to send password reset email" }
  }
}

// Update password
export async function updatePassword(newPassword: string) {
  try {
    if (newPassword.length < 6) {
      return { error: "Password must be at least 6 characters" }
    }

    const result = await updatePasswordReal(newPassword)

    if (result.error) {
      return { error: result.error }
    }

    return {
      success: true,
      message: "Password updated successfully",
    }
  } catch (error) {
    console.error("Update password error:", error)
    return { error: "Failed to update password" }
  }
}

// Update user profile
export async function updateProfile(updates: {
  name?: string
  phone?: string
  company?: string
}) {
  try {
    if (updates.name && !updates.name.trim()) {
      return { error: "Name cannot be empty" }
    }

    if (updates.phone && updates.phone.length > 0 && updates.phone.length < 10) {
      return { error: "Please enter a valid phone number" }
    }

    const result = await updateUserProfileReal(updates)

    if (result.error) {
      return { error: result.error }
    }

    return {
      success: true,
      message: "Profile updated successfully",
    }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: "Failed to update profile" }
  }
}

// Check if user can perform specific actions
export async function canPerformAction(action: "basic_calc" | "pro_calc" | "admin") {
  try {
    return await checkUserPermissions(action)
  } catch (error) {
    console.error("Permission check error:", error)
    return { canPerform: false, reason: "Permission check failed" }
  }
}

// Track usage for billing/limits
export async function trackUsage(calculationType: "basic" | "pro") {
  try {
    return await trackUsageReal(calculationType)
  } catch (error) {
    console.error("Track usage error:", error)
    return { error: "Failed to track usage" }
  }
}

// Helper function to get user subscription info
export async function getUserSubscriptionInfo() {
  try {
    const user = await getCurrentUserReal()

    if (!user) {
      return {
        subscriptionPlan: "basic",
        subscriptionStatus: "inactive",
        canUseBasic: false,
        canUsePro: false,
      }
    }

    const permissions = await checkUserPermissions("basic_calc")
    const proPermissions = await checkUserPermissions("pro_calc")

    return {
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      canUseBasic: permissions.canPerform,
      canUsePro: proPermissions.canPerform,
      emailVerified: user.emailVerified,
    }
  } catch (error) {
    console.error("Get subscription info error:", error)
    return {
      subscriptionPlan: "basic",
      subscriptionStatus: "inactive",
      canUseBasic: false,
      canUsePro: false,
    }
  }
}

// Upgrade subscription helper
export async function initiateSubscriptionUpgrade(plan: "professional" | "enterprise") {
  try {
    const user = await getCurrentUserReal()

    if (!user) {
      return { error: "User not authenticated" }
    }

    // This would integrate with Stripe for real billing
    // For now, return upgrade URL
    const upgradeUrl = `/pricing?plan=${plan}&user=${user.id}`

    return {
      success: true,
      upgradeUrl,
      message: `Ready to upgrade to ${plan} plan`,
    }
  } catch (error) {
    console.error("Subscription upgrade error:", error)
    return { error: "Failed to initiate subscription upgrade" }
  }
}

// Demo/development helpers
export async function createDemoUser() {
  if (process.env.NODE_ENV !== "development") {
    return { error: "Demo users only available in development" }
  }

  try {
    // Create a demo user for testing
    const demoEmail = `demo-${Date.now()}@ionsolar.com`
    const result = await signUpReal(demoEmail, "demo123456", "Demo User")

    if (result.success) {
      return {
        success: true,
        demoUser: {
          email: demoEmail,
          password: "demo123456",
        },
        message: "Demo user created successfully",
      }
    }

    return { error: "Failed to create demo user" }
  } catch (error) {
    console.error("Create demo user error:", error)
    return { error: "Failed to create demo user" }
  }
}

// Health check for auth system
export async function checkAuthHealth() {
  try {
    // Basic health checks
    const hasSupabaseConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    const hasDatabaseConfig = !!process.env.DATABASE_URL

    return {
      supabaseConfigured: hasSupabaseConfig,
      databaseConfigured: hasDatabaseConfig,
      authSystemHealthy: hasSupabaseConfig && hasDatabaseConfig,
    }
  } catch (error) {
    console.error("Auth health check error:", error)
    return {
      supabaseConfigured: false,
      databaseConfigured: false,
      authSystemHealthy: false,
    }
  }
}

// Login function using Supabase client
export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect("/error")
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

// Signup function using Supabase client
export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect("/error")
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
