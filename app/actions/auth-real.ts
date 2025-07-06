"use server"

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Input validation schemas
const emailSchema = z.string().email("Invalid email address")
const passwordSchema = z.string().min(6, "Password must be at least 6 characters")
const userIdSchema = z.string().uuid("Invalid user ID")

// Rate limiting helper (simple in-memory store for demo)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(key: string, maxAttempts = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

// Sign in with email - REQUIRED EXPORT
export async function signInWithEmailReal(email: string, password: string) {
  try {
    // Input validation
    const validatedEmail = emailSchema.parse(email.toLowerCase().trim())
    const validatedPassword = passwordSchema.parse(password)

    // Rate limiting
    if (!checkRateLimit(`signin:${validatedEmail}`)) {
      return { success: false, error: "Too many sign-in attempts. Please try again later." }
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedEmail,
      password: validatedPassword,
    })

    if (error) {
      console.error("Sign in error:", error.message)
      return { success: false, error: error.message }
    }

    if (data.user && data.user.email) {
      // Check if user profile exists
      const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single()

      if (!profile) {
        // Create user profile if it doesn't exist
        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          subscription_type: "free",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      revalidatePath("/", "layout")
      redirect("/dashboard")
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Sign in error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Sign in failed. Please try again." }
  }
}

// Sign up - REQUIRED EXPORT
export async function signUpReal(email: string, password: string) {
  try {
    // Input validation
    const validatedEmail = emailSchema.parse(email.toLowerCase().trim())
    const validatedPassword = passwordSchema.parse(password)

    // Rate limiting
    if (!checkRateLimit(`signup:${validatedEmail}`)) {
      return { success: false, error: "Too many sign-up attempts. Please try again later." }
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: validatedEmail,
      password: validatedPassword,
    })

    if (error) {
      console.error("Sign up error:", error.message)
      return { success: false, error: error.message }
    }

    if (data.user && data.user.email) {
      // Create user profile
      try {
        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          subscription_type: "free",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } catch (profileError) {
        console.error("Profile creation error:", profileError)
        // Don't fail the signup if profile creation fails
      }

      return { success: true, message: "Check your email to confirm your account" }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error("Sign up error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Sign up failed. Please try again." }
  }
}

// Sign out - REQUIRED EXPORT
export async function signOutReal() {
  try {
    const supabase = createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error.message)
      return { success: false, error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/")
  } catch (error: any) {
    console.error("Sign out error:", error)
    return { success: false, error: "Sign out failed. Please try again." }
  }
}

// Get current user - REQUIRED EXPORT with fixed return type
export async function getCurrentUserReal() {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Get user error:", error.message)
      return {
        success: false,
        error: error.message,
        user: null,
        email: null,
        profile: null,
      }
    }

    if (user && user.email) {
      // Get user profile
      const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

      return {
        success: true,
        user: { ...user, profile },
        error: null,
        email: user.email,
        profile,
      }
    }

    return {
      success: true,
      user: null,
      error: null,
      email: null,
      profile: null,
    }
  } catch (error: any) {
    console.error("Get current user error:", error)
    return {
      success: false,
      error: "Failed to get user information",
      user: null,
      email: null,
      profile: null,
    }
  }
}

// Reset password - REQUIRED EXPORT
export async function resetPasswordReal(email: string) {
  try {
    // Input validation
    const validatedEmail = emailSchema.parse(email.toLowerCase().trim())

    // Rate limiting
    if (!checkRateLimit(`reset:${validatedEmail}`)) {
      return { success: false, error: "Too many reset attempts. Please try again later." }
    }

    const supabase = createClient()

    const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail)

    if (error) {
      console.error("Reset password error:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Password reset email sent" }
  } catch (error: any) {
    console.error("Reset password error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Password reset failed. Please try again." }
  }
}

// Update password - REQUIRED EXPORT
export async function updatePasswordReal(password: string) {
  try {
    // Input validation
    const validatedPassword = passwordSchema.parse(password)

    const supabase = createClient()

    const { error } = await supabase.auth.updateUser({ password: validatedPassword })

    if (error) {
      console.error("Update password error:", error.message)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Password updated successfully" }
  } catch (error: any) {
    console.error("Update password error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Password update failed. Please try again." }
  }
}

// Update user profile - REQUIRED EXPORT
export async function updateUserProfileReal(userId: string, updates: any) {
  try {
    // Input validation
    const validatedUserId = userIdSchema.parse(userId)

    if (!updates || typeof updates !== "object") {
      return { success: false, error: "Invalid update data" }
    }

    // Sanitize updates - only allow specific fields
    const allowedFields = ["subscription_type", "pro_trial_used", "single_reports_purchased", "stripe_customer_id"]
    const sanitizedUpdates = Object.keys(updates)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = updates[key]
        return obj
      }, {})

    if (Object.keys(sanitizedUpdates).length === 0) {
      return { success: false, error: "No valid fields to update" }
    }

    const supabase = createClient()

    const { data, error } = await supabase
      .from("users")
      .update({
        ...sanitizedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validatedUserId)
      .select()
      .single()

    if (error) {
      console.error("Update profile error:", error.message)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true, data }
  } catch (error: any) {
    console.error("Update user profile error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Profile update failed. Please try again." }
  }
}

// Check user permissions - REQUIRED EXPORT
export async function checkUserPermissions(userId: string) {
  try {
    // Input validation
    const validatedUserId = userIdSchema.parse(userId)

    const supabase = createClient()

    const { data: profile, error } = await supabase
      .from("users")
      .select("subscription_type, pro_trial_used, single_reports_purchased")
      .eq("id", validatedUserId)
      .single()

    if (error) {
      console.error("Check permissions error:", error.message)
      return { success: false, error: error.message }
    }

    const permissions = {
      canAccessPro: profile.subscription_type === "pro",
      canUseTrial: !profile.pro_trial_used,
      singleReports: profile.single_reports_purchased || 0,
      subscriptionType: profile.subscription_type,
    }

    return { success: true, permissions }
  } catch (error: any) {
    console.error("Check user permissions error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Permission check failed. Please try again." }
  }
}

// Track usage - REQUIRED EXPORT
export async function trackUsageReal(userId: string, action: string, metadata?: any) {
  try {
    // Input validation
    const validatedUserId = userIdSchema.parse(userId)

    if (!action || typeof action !== "string") {
      return { success: false, error: "Invalid action" }
    }

    // Sanitize metadata
    const sanitizedMetadata = metadata && typeof metadata === "object" ? JSON.parse(JSON.stringify(metadata)) : null

    // Log usage (in production, you'd store this in a database)
    console.log("Usage tracked:", {
      userId: validatedUserId,
      action,
      metadata: sanitizedMetadata,
      timestamp: new Date().toISOString(),
    })

    return { success: true }
  } catch (error: any) {
    console.error("Track usage error:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: "Usage tracking failed" }
  }
}

// Legacy exports for backward compatibility - REQUIRED EXPORTS
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
