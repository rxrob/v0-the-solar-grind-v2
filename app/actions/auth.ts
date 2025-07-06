"use server"

import { createServerClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(email: string, password: string, fullName?: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      data: {
        full_name: fullName || "",
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Create user profile in our users table
  if (data.user) {
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email: data.user.email,
      full_name: fullName || "",
      subscription_type: "free",
      subscription_status: "active",
      created_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
    }
  }

  // Check if user needs email verification
  if (data.user && !data.user.email_confirmed_at) {
    return {
      success: true,
      needsVerification: true,
      user: data.user,
    }
  }

  return { success: true, data }
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true, user: data.user }
}

export async function signOut() {
  const supabase = createServerClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/login")
}

export async function getCurrentUser() {
  const supabase = createServerClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    return { success: false, error: error.message, user: null }
  }

  if (!user) {
    return { success: true, user: null }
  }

  // Get user profile from our users table
  const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (profileError) {
    console.error("Error fetching user profile:", profileError)
    return {
      success: true,
      user: {
        ...user,
        subscriptionPlan: "free",
        subscriptionStatus: "active",
        emailVerified: !!user.email_confirmed_at,
      },
    }
  }

  return {
    success: true,
    user: {
      ...user,
      subscriptionPlan: profile?.subscription_type || "free",
      subscriptionStatus: profile?.subscription_status || "active",
      emailVerified: !!user.email_confirmed_at,
      profile,
    },
  }
}

export async function resetPassword(email: string) {
  const supabase = createServerClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: "Password reset email sent" }
}

export async function updatePassword(password: string) {
  const supabase = createServerClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: "Password updated successfully" }
}

export async function signInWithGoogle() {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { success: true, data }
}

export async function handleAuthCallback(code: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return { success: false, error: error.message }
  }

  // Create user profile if it doesn't exist
  if (data.user) {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError && profileError.code === "PGRST116") {
      // User doesn't exist, create profile
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || "",
        subscription_type: "free",
        subscription_status: "active",
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Profile creation error:", insertError)
      }
    }
  }

  // Check if user needs email verification
  if (data.user && !data.user.email_confirmed_at) {
    return {
      success: true,
      needsVerification: true,
      user: data.user,
    }
  }

  return { success: true, user: data.user }
}

export async function resendVerificationEmail(email: string) {
  const supabase = createServerClient()

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: "Verification email sent" }
}

export async function getUserSubscriptionStatus() {
  const supabase = createServerClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: "User not authenticated" }
  }

  // Get user subscription status from database
  const { data: userData, error: dbError } = await supabase
    .from("users")
    .select("subscription_status, subscription_type, stripe_customer_id")
    .eq("id", user.id)
    .single()

  if (dbError) {
    return { success: false, error: dbError.message }
  }

  return {
    success: true,
    user: {
      ...user,
      subscription_status: userData?.subscription_status || "free",
      subscription_type: userData?.subscription_type || "free",
      stripe_customer_id: userData?.stripe_customer_id,
    },
  }
}
