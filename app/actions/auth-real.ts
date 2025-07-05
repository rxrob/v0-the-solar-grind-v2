"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient, supabaseAdmin, getUserProfile, updateUserProfile } from "@/lib/supabase"
import type { Database } from "@/types/supabase"

type User = Database["public"]["Tables"]["users"]["Row"]

// Sign up with email and password
export async function signUpReal(
  email: string,
  password: string,
  userDataOrFullName?: string | { fullName?: string; company?: string; phone?: string },
) {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase not configured")
  }

  let userData: { fullName?: string; company?: string; phone?: string } = {}

  if (typeof userDataOrFullName === "string") {
    userData.fullName = userDataOrFullName
  } else if (userDataOrFullName) {
    userData = userDataOrFullName
  }

  try {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
        },
      },
    })

    if (authError) {
      throw authError
    }

    // If user was created, create profile in users table
    if (authData.user && supabaseAdmin) {
      try {
        const { error: profileError } = await supabaseAdmin.from("users").insert({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: userData.fullName || "",
          company: userData.company || "",
          phone: userData.phone || "",
          subscription_type: "free",
          subscription_status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Error creating user profile:", profileError)
        }
      } catch (profileError) {
        console.error("Failed to create user profile:", profileError)
      }
    }

    return authData
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

// Sign in with email and password
export async function signInWithEmailReal(email: string, password: string) {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase not configured")
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

// Get current user with profile data
export async function getCurrentUserReal(): Promise<(User & { auth_user: any }) | null> {
  const supabase = createClient()
  if (!supabase) return null

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    const profile = await getUserProfile(user.id)

    if (!profile) {
      return null
    }

    return {
      ...profile,
      auth_user: user,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Reset password
export async function resetPasswordReal(email: string) {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase not configured")
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  })

  if (error) {
    throw error
  }

  return { message: "Password reset email sent" }
}

// Update password
export async function updatePasswordReal(password: string) {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase not configured")
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw error
  }

  revalidatePath("/", "layout")
  return { message: "Password updated successfully" }
}

// Update user profile
export async function updateUserProfileReal(
  userId: string,
  updates: Partial<Database["public"]["Tables"]["users"]["Update"]>,
) {
  try {
    const updatedProfile = await updateUserProfile(userId, updates)

    if (!updatedProfile) {
      throw new Error("Failed to update profile")
    }

    revalidatePath("/", "layout")
    return updatedProfile
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Check user permissions
export async function checkUserPermissions(userId: string) {
  try {
    const profile = await getUserProfile(userId)

    if (!profile) {
      return {
        canAccessPro: false,
        canGenerateReports: false,
        subscriptionType: "free",
        subscriptionStatus: "inactive",
      }
    }

    const canAccessPro = profile.subscription_type === "pro" && profile.subscription_status === "active"
    const canGenerateReports =
      canAccessPro || (profile.single_reports_remaining && profile.single_reports_remaining > 0)

    return {
      canAccessPro,
      canGenerateReports,
      subscriptionType: profile.subscription_type,
      subscriptionStatus: profile.subscription_status,
      singleReportsRemaining: profile.single_reports_remaining || 0,
    }
  } catch (error) {
    console.error("Error checking user permissions:", error)
    return {
      canAccessPro: false,
      canGenerateReports: false,
      subscriptionType: "free",
      subscriptionStatus: "inactive",
    }
  }
}

// Track usage
export async function trackUsageReal(userId: string, usageType: "calculation" | "report" | "api_call") {
  try {
    if (!supabaseAdmin) return

    const profile = await getUserProfile(userId)
    if (!profile) return

    // Update usage counters
    const updates: Partial<Database["public"]["Tables"]["users"]["Update"]> = {
      updated_at: new Date().toISOString(),
    }

    if (usageType === "calculation") {
      updates.calculations_used = (profile.calculations_used || 0) + 1
    } else if (usageType === "report") {
      updates.reports_generated = (profile.reports_generated || 0) + 1
      if (profile.subscription_type === "free" && profile.single_reports_remaining) {
        updates.single_reports_remaining = Math.max(0, profile.single_reports_remaining - 1)
      }
    } else if (usageType === "api_call") {
      updates.api_calls_made = (profile.api_calls_made || 0) + 1
    }

    await updateUserProfile(userId, updates)
  } catch (error) {
    console.error("Error tracking usage:", error)
  }
}

// Sign out
export async function signOut() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase not configured")
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }

  revalidatePath("/", "layout")
  redirect("/")
}

// Sign out (alternative name for compatibility)
export async function signOutReal() {
  return signOut()
}

// Wrapper functions for compatibility with other imports
export async function getCurrentUser() {
  return getCurrentUserReal()
}

export async function resetPassword(email: string) {
  return resetPasswordReal(email)
}

export async function updatePassword(password: string) {
  return updatePasswordReal(password)
}
