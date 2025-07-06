"use server"

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

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

    return { success: false, error: "No user returned" }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Sign up with email and password
export async function signUpReal(email: string, password: string, fullName?: string) {
  const supabase = createClient()

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

      return { success: true, user: data.user, session: data.session }
    }

    return { success: false, error: "No user returned" }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "An unexpected error occurred" }
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
    return { success: false, error: "An unexpected error occurred" }
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
      return { user: null, error: error.message }
    }

    return { user, error: null }
  } catch (error) {
    console.error("Get current user error:", error)
    return { user: null, error: "An unexpected error occurred" }
  }
}

// Reset password
export async function resetPasswordReal(email: string) {
  const supabase = createClient()

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
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update password
export async function updatePasswordReal(password: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Update password error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Update user profile
export async function updateUserProfileReal(userId: string, updates: any) {
  const supabase = createClient()

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

    revalidatePath("/dashboard")
    return { success: true, user: data }
  } catch (error) {
    console.error("Update user profile error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Check user permissions
export async function checkUserPermissions(userId: string) {
  const supabase = createClient()

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
        canGenerateReports: isPro || reportsUsed < 1,
        calculationsRemaining: isPro ? -1 : Math.max(0, 5 - calculationsUsed),
        reportsRemaining: isPro ? -1 : Math.max(0, 1 - reportsUsed),
        subscriptionType: user.subscription_type,
        calculationsUsed,
        reportsUsed,
      },
    }
  } catch (error) {
    console.error("Check user permissions error:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
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
  const supabase = createClient()

  try {
    const field = type === "calculation" ? "calculations_used" : "reports_used"

    const { data, error } = await supabase
      .from("users")
      .update({
        [field]: supabase.rpc("increment_usage", { user_id: userId, usage_type: type }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data }
  } catch (error) {
    console.error("Track usage error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Legacy compatibility exports
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
