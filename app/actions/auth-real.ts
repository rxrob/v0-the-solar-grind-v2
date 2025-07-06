"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { headers } from "next/headers"

export async function signUpReal(email: string, password: string, name?: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || "",
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return {
        success: true,
        needsVerification: true,
        message: "Please check your email to confirm your account.",
      }
    }

    // Create user profile in custom table
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        name: name || "",
        subscription_tier: "free",
        subscription_status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Profile creation error:", profileError)
      }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "Failed to create account" }
  }
}

export async function signInReal(email: string, password: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "Failed to sign in" }
  }
}

export async function signInWithEmailReal(email: string, password: string) {
  return signInReal(email, password)
}

export async function signOutReal() {
  const supabase = createServerClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Sign out error:", error)
    return { success: false, error: "Failed to sign out" }
  }
}

export async function getCurrentUserReal() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { success: false, error: error.message, user: null }
    }

    if (!user) {
      return { success: false, error: "Not authenticated", user: null }
    }

    // Get user profile from custom users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .single()

    return {
      success: true,
      user: {
        ...user,
        profile: profile || null,
      },
    }
  } catch (error) {
    console.error("Get user error:", error)
    return { success: false, error: "Failed to get user", user: null }
  }
}

export async function resetPasswordReal(email: string) {
  const supabase = createServerClient()
  const origin = headers().get("origin")

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: "Password reset email sent. Please check your inbox.",
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return { success: false, error: "Failed to send reset email" }
  }
}

export async function updatePasswordReal(password: string) {
  const supabase = createServerClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: "Password updated successfully.",
    }
  } catch (error) {
    console.error("Update password error:", error)
    return { success: false, error: "Failed to update password" }
  }
}

export async function signInWithGoogleReal() {
  const supabase = createServerClient()
  const origin = headers().get("origin")

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, url: data.url }
  } catch (error) {
    console.error("Google sign in error:", error)
    return { success: false, error: "Failed to sign in with Google" }
  }
}

export async function handleAuthCallbackReal(code: string) {
  const supabase = createServerClient()

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return { success: false, error: error.message }
    }

    // Create user profile if it doesn't exist
    if (data.user) {
      const { data: existingProfile } = await supabase.from("users").select("id").eq("email", data.user.email).single()

      if (!existingProfile) {
        const { error: profileError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || "",
          avatar_url: data.user.user_metadata?.avatar_url || "",
          subscription_tier: "free",
          subscription_status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Profile creation error:", profileError)
        }
      }
    }

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Auth callback error:", error)
    return { success: false, error: "Failed to handle auth callback" }
  }
}

export async function checkAuthStatusReal() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { authenticated: false, user: null, error: error.message }
    }

    return { authenticated: !!user, user }
  } catch (error) {
    console.error("Auth status check error:", error)
    return { authenticated: false, user: null, error: "Failed to check auth status" }
  }
}

export async function getUserProfileReal() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get user profile from custom users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .single()

    if (profileError) {
      return { success: false, error: "Profile not found" }
    }

    return {
      success: true,
      user: {
        ...user,
        profile,
      },
    }
  } catch (error) {
    console.error("Get profile error:", error)
    return { success: false, error: "Failed to get user profile" }
  }
}

export async function updateUserProfileReal(updates: {
  name?: string
  avatar_url?: string
}) {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Update auth user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: updates,
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Update custom users table
    const { error: profileError } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("email", user.email)

    if (profileError) {
      console.error("Profile update error:", profileError)
    }

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    console.error("Update profile error:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function deleteAccountReal() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Delete user data from custom tables
    await supabase.from("solar_calculations").delete().eq("user_email", user.email)

    await supabase.from("user_projects").delete().eq("user_email", user.email)

    await supabase.from("users").delete().eq("email", user.email)

    // Sign out user
    await supabase.auth.signOut()

    return { success: true, message: "Account deleted successfully" }
  } catch (error) {
    console.error("Delete account error:", error)
    return { success: false, error: "Failed to delete account" }
  }
}

// Legacy exports for backward compatibility
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
