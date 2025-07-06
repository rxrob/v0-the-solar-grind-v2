"use server"

import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Sign in with email and password
export async function signInWithEmailReal(email: string, password: string) {
  const supabase = createSupabaseServerClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Check if user profile exists, create if not
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (profileError && profileError.code === "PGRST116") {
        // User profile doesn't exist, create it
        const { error: createError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name || "",
          subscription_type: "free",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (createError) {
          console.error("Error creating user profile:", createError)
        }
      }

      revalidatePath("/", "layout")
      return { success: true, user: data.user }
    }

    return { success: false, error: "Authentication failed" }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Sign up with email and password
export async function signUpReal(email: string, password: string, fullName?: string) {
  const supabase = createSupabaseServerClient()

  try {
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
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName || "",
        subscription_type: "free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
      }

      return { success: true, user: data.user, needsVerification: !data.session }
    }

    return { success: false, error: "Sign up failed" }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Sign out
export async function signOutReal() {
  const supabase = createSupabaseServerClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Get current user
export async function getCurrentUserReal() {
  const supabase = createSupabaseServerClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: error.message }
    }

    if (user) {
      // Get user profile
      const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (profileError) {
        console.error("Error fetching user profile:", profileError)
        return { user, profile: null, error: null }
      }

      return { user, profile, error: null }
    }

    return { user: null, profile: null, error: null }
  } catch (error) {
    console.error("Get current user error:", error)
    return {
      user: null,
      profile: null,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Reset password
export async function resetPasswordReal(email: string) {
  const supabase = createSupabaseServerClient()

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Reset password error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Update password
export async function updatePasswordReal(password: string) {
  const supabase = createSupabaseServerClient()

  try {
    const { data, error } = await supabase.auth.updateUser({ password })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Update password error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Update user profile
export async function updateUserProfileReal(userId: string, updates: any) {
  const supabase = createSupabaseServerClient()

  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/", "layout")
    return { success: true, data }
  } catch (error) {
    console.error("Update user profile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Check user permissions
export async function checkUserPermissions(userId: string) {
  const supabase = createSupabaseServiceClient()

  try {
    const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      return {
        success: false,
        error: error.message,
        permissions: {
          canAccessPro: false,
          canGenerateReports: false,
          calculationsRemaining: 0,
          reportsRemaining: 0,
        },
      }
    }

    const isPro = user.subscription_type === "pro"
    const calculationsUsed = user.calculations_used || 0
    const reportsUsed = user.reports_used || 0

    return {
      success: true,
      user,
      permissions: {
        canAccessPro: isPro,
        canGenerateReports: isPro || reportsUsed < 1, // Free users get 1 report
        calculationsRemaining: isPro ? -1 : Math.max(0, 10 - calculationsUsed), // Free users get 10 calculations
        reportsRemaining: isPro ? -1 : Math.max(0, 1 - reportsUsed), // Free users get 1 report
        subscriptionType: user.subscription_type,
        calculationsUsed,
        reportsUsed,
      },
    }
  } catch (error) {
    console.error("Check user permissions error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
      permissions: {
        canAccessPro: false,
        canGenerateReports: false,
        calculationsRemaining: 0,
        reportsRemaining: 0,
      },
    }
  }
}

// Track usage
export async function trackUsageReal(userId: string, type: "calculation" | "report") {
  const supabase = createSupabaseServiceClient()

  try {
    const field = type === "calculation" ? "calculations_used" : "reports_used"

    const { data, error } = await supabase
      .from("users")
      .update({
        [field]: supabase.rpc("increment", { field_name: field }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Track usage error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Legacy compatibility exports
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
