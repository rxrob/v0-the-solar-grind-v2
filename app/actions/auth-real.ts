"use server"

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export interface AuthResult {
  success: boolean
  error?: string
  user?: any
  message?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  subscription_type: "free" | "pro"
  subscription_status: "active" | "inactive" | "trial"
  trial_ends_at?: string
  created_at: string
  updated_at: string
}

export interface UserPermissions {
  canAccessProFeatures: boolean
  canGenerateReports: boolean
  calculationsRemaining: number
  reportsRemaining: number
  subscriptionType: "free" | "pro"
  subscriptionStatus: "active" | "inactive" | "trial"
  trialEndsAt?: string
}

// Sign in with email and password - REQUIRED EXPORT
export async function signInWithEmailReal(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      revalidatePath("/", "layout")
      return {
        success: true,
        user: data.user,
        message: "Successfully signed in",
      }
    }

    return { success: false, error: "No user returned" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Sign up with email and password - REQUIRED EXPORT
export async function signUpReal(email: string, password: string, fullName?: string): Promise<AuthResult> {
  try {
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Create user profile
      try {
        const serviceClient = createSupabaseServiceClient()
        const { error: profileError } = await serviceClient.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || "",
          subscription_type: "free",
          subscription_status: "active",
        })

        if (profileError) {
          console.error("Error creating user profile:", profileError)
        }
      } catch (profileError) {
        console.error("Error creating user profile:", profileError)
      }

      revalidatePath("/", "layout")
      return {
        success: true,
        user: data.user,
        message: "Successfully signed up. Please check your email for verification.",
      }
    }

    return { success: false, error: "No user returned" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Sign out - REQUIRED EXPORT
export async function signOutReal(): Promise<AuthResult> {
  try {
    const supabase = createSupabaseServerClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/")
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Get current user with profile - REQUIRED EXPORT
export async function getCurrentUserReal(): Promise<AuthResult & { profile?: UserProfile }> {
  try {
    const supabase = createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return { success: false, error: authError.message }
    }

    if (!user) {
      return { success: false, error: "No user found" }
    }

    // Get user profile
    try {
      const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        return {
          success: true,
          user,
          message: "User found but profile incomplete",
        }
      }

      return {
        success: true,
        user,
        profile: profile as UserProfile,
        message: "User and profile found",
      }
    } catch (profileError) {
      console.error("Error fetching user profile:", profileError)
      return {
        success: true,
        user,
        message: "User found but profile error",
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Reset password - REQUIRED EXPORT
export async function resetPasswordReal(email: string): Promise<AuthResult> {
  try {
    const supabase = createSupabaseServerClient()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: "Password reset email sent. Please check your inbox.",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Update password - REQUIRED EXPORT
export async function updatePasswordReal(newPassword: string): Promise<AuthResult> {
  try {
    const supabase = createSupabaseServerClient()

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: "Password updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Update user profile - REQUIRED EXPORT
export async function updateUserProfileReal(updates: Partial<UserProfile>): Promise<AuthResult> {
  try {
    const supabase = createSupabaseServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/", "layout")
    return {
      success: true,
      message: "Profile updated successfully",
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Check user permissions - REQUIRED EXPORT
export async function checkUserPermissions(): Promise<UserPermissions> {
  try {
    const userResult = await getCurrentUserReal()

    if (!userResult.success || !userResult.profile) {
      return {
        canAccessProFeatures: false,
        canGenerateReports: false,
        calculationsRemaining: 5, // Free tier default
        reportsRemaining: 0,
        subscriptionType: "free",
        subscriptionStatus: "inactive",
      }
    }

    const profile = userResult.profile
    const isPro = profile.subscription_type === "pro" && profile.subscription_status === "active"
    const isTrial = profile.subscription_status === "trial"

    return {
      canAccessProFeatures: isPro || isTrial,
      canGenerateReports: isPro || isTrial,
      calculationsRemaining: isPro ? 999 : 5,
      reportsRemaining: isPro ? 999 : isTrial ? 3 : 0,
      subscriptionType: profile.subscription_type,
      subscriptionStatus: profile.subscription_status,
      trialEndsAt: profile.trial_ends_at,
    }
  } catch (error) {
    console.error("Error checking user permissions:", error)
    return {
      canAccessProFeatures: false,
      canGenerateReports: false,
      calculationsRemaining: 5,
      reportsRemaining: 0,
      subscriptionType: "free",
      subscriptionStatus: "inactive",
    }
  }
}

// Track usage - REQUIRED EXPORT
export async function trackUsageReal(type: "calculation" | "report" | "api_call"): Promise<AuthResult> {
  try {
    const userResult = await getCurrentUserReal()

    if (!userResult.success || !userResult.user) {
      return { success: false, error: "User not authenticated" }
    }

    const supabase = createSupabaseServiceClient()

    // Insert usage record
    const { error } = await supabase.from("usage_tracking").insert({
      user_id: userResult.user.id,
      usage_type: type,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error tracking usage:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Usage tracked successfully" }
  } catch (error) {
    console.error("Error tracking usage:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Form action wrappers
export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  return await signUpReal(email, password, fullName)
}

export async function signInAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  return await signInWithEmailReal(email, password)
}

export async function signOutAction() {
  return await signOutReal()
}

export async function resetPasswordAction(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return {
      success: false,
      error: "Email is required",
    }
  }

  return await resetPasswordReal(email)
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get("password") as string

  if (!password) {
    return {
      success: false,
      error: "Password is required",
    }
  }

  return await updatePasswordReal(password)
}

export async function updateProfileAction(formData: FormData) {
  const fullName = formData.get("fullName") as string
  const company = formData.get("company") as string
  const phone = formData.get("phone") as string

  const updates: any = {}
  if (fullName) updates.full_name = fullName
  if (company) updates.company = company
  if (phone) updates.phone = phone

  return await updateUserProfileReal(updates)
}

// Legacy exports for backward compatibility - REQUIRED EXPORT
export const signInWithEmail = signInWithEmailReal
export const signUp = signUpReal
export const signOut = signOutReal
export const getCurrentUser = getCurrentUserReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
export const updateUserProfile = updateUserProfileReal
export const trackUsage = trackUsageReal
