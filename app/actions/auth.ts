"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
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

  return { success: true, user: data.user }
}

export async function signIn(formData: FormData) {
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

export async function signOut() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  redirect("/")
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    return { error: error.message }
  }

  return { user }
}

export async function resetPassword(formData: FormData) {
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

export async function updatePassword(formData: FormData) {
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

export async function signInWithGoogle() {
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

export async function handleAuthCallback(code: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return { error: error.message }
  }

  // Check if user needs verification
  const result = data as any
  if ("needsVerification" in result && result.needsVerification) {
    return {
      success: true,
      needsVerification: true,
      message: "Please check your email to verify your account",
    }
  }

  return { success: true, user: data.user }
}
