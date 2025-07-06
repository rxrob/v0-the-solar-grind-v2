"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signUpReal(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user && !data.user.email_confirmed_at) {
    return {
      success: true,
      needsVerification: true,
      message: "Please check your email to verify your account",
    }
  }

  // Create user profile in database
  if (data.user) {
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      subscription_type: "free",
      created_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Error creating user profile:", profileError)
    }
  }

  return { success: true, user: data.user }
}

export async function signInReal(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, user: data.user }
}

export async function signInWithEmailReal(email: string, password: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, user: data.user }
}

export async function signOutReal() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  redirect("/")
}

export async function getCurrentUserReal() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    return { error: error.message }
  }

  // Get user profile data
  if (user) {
    const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

    return { user: { ...user, profile } }
  }

  return { user }
}

export async function resetPasswordReal(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const email = formData.get("email") as string

  if (!email) {
    return { error: "Email is required" }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: "Password reset email sent" }
}

export async function updatePasswordReal(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const password = formData.get("password") as string

  if (!password) {
    return { error: "Password is required" }
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: "Password updated successfully" }
}

export async function signInWithGoogleReal() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { success: true }
}

export async function updateUserSubscriptionReal(userId: string, subscriptionType: string, stripeCustomerId?: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const updateData: any = {
    subscription_type: subscriptionType,
    updated_at: new Date().toISOString(),
  }

  if (stripeCustomerId) {
    updateData.stripe_customer_id = stripeCustomerId
  }

  const { error } = await supabase.from("users").update(updateData).eq("id", userId)

  if (error) {
    console.error("Error updating user subscription:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function getUserSubscriptionStatusReal(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from("users")
    .select("subscription_type, stripe_customer_id, pro_trial_used, pro_trial_end")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error getting user subscription:", error)
    return { error: error.message }
  }

  return { success: true, data }
}

// Legacy exports for backward compatibility
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
