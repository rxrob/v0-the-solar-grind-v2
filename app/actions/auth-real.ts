"use server"

import { createClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error)
      return { error: error.message }
    }

    console.log("Sign in successful for:", email)
    return { error: null, user: data.user }
  } catch (error) {
    console.error("Sign in exception:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "All fields are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          name: name,
        },
      },
    })

    if (error) {
      console.error("Sign up error:", error)
      return { error: error.message }
    }

    console.log("Sign up successful for:", email)
    return { error: null, user: data.user }
  } catch (error) {
    console.error("Sign up exception:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function signOut() {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error)
      return { error: error.message }
    }

    console.log("Sign out successful")
    redirect("/")
  } catch (error) {
    console.error("Sign out exception:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getCurrentUser() {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Get user error:", error)
      return { error: error.message, user: null }
    }

    return { error: null, user }
  } catch (error) {
    console.error("Get user exception:", error)
    return { error: "An unexpected error occurred", user: null }
  }
}

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      console.error("Reset password error:", error)
      return { error: error.message }
    }

    console.log("Reset password email sent to:", email)
    return { error: null }
  } catch (error) {
    console.error("Reset password exception:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password || !confirmPassword) {
    return { error: "Both password fields are required" }
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      console.error("Update password error:", error)
      return { error: error.message }
    }

    console.log("Password updated successfully")
    return { error: null }
  } catch (error) {
    console.error("Update password exception:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateUserProfile(updates: {
  email?: string
  password?: string
  data?: any
}) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.updateUser(updates)

    if (error) {
      console.error("Update user profile error:", error)
      return { error: error.message }
    }

    console.log("User profile updated successfully")
    return { error: null }
  } catch (error) {
    console.error("Update user profile exception:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function checkUserPermissions(userId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("users")
      .select("subscription_status, subscription_type, pro_trial_used, pro_trial_expires_at")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Check permissions error:", error)
      return { error: error.message, permissions: null }
    }

    const isPro = data.subscription_status === "active" && data.subscription_type === "pro"
    const isTrialActive = data.pro_trial_expires_at && new Date(data.pro_trial_expires_at) > new Date()

    return {
      success: true,
      permissions: {
        isPro: isPro || isTrialActive,
        canUsePro: isPro || isTrialActive,
        subscriptionStatus: data.subscription_status,
        subscriptionType: data.subscription_type,
        trialUsed: data.pro_trial_used,
        trialActive: isTrialActive,
      },
    }
  } catch (error) {
    console.error("Check permissions exception:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function trackUsageReal(userId: string, action: string, metadata?: any) {
  const supabase = createClient()

  try {
    // Insert usage tracking record
    const { error: trackError } = await supabase.from("usage_tracking").insert({
      user_id: userId,
      action,
      metadata,
      created_at: new Date().toISOString(),
    })

    if (trackError) {
      console.error("Track usage error:", trackError)
    }

    // Update user calculations count
    const { error: updateError } = await supabase.rpc("increment_user_calculations", {
      user_email: userId,
    })

    if (updateError) {
      console.error("Update calculations count error:", updateError)
      return { error: updateError.message }
    }

    return { error: null }
  } catch (error) {
    console.error("Track usage exception:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Additional auth helper functions
export async function signInWithEmailReal(email: string, password: string) {
  return signIn(email, password)
}

export async function signUpReal(email: string, password: string, metadata?: any) {
  return signUp(email, password, metadata)
}

export async function signOutReal() {
  return signOut()
}

export async function getCurrentUserReal() {
  return getCurrentUser()
}

export async function resetPasswordReal(email: string) {
  return resetPassword(email)
}

export async function updatePasswordReal(password: string) {
  return updatePassword(password)
}

export async function updateUserProfileReal(updates: any) {
  return updateUserProfile(updates)
}
