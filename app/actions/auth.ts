"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { signInWithEmailReal, signUpReal, signOutReal, getCurrentUserReal } from "./auth-real"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const result = await signUpReal(email, password, fullName)

  if (result.success) {
    if ("needsVerification" in result && result.needsVerification) {
      return {
        success: true,
        needsVerification: true,
        message: "Please check your email to verify your account",
      }
    }
    redirect("/dashboard")
  } else {
    return { error: result.error }
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const result = await signInWithEmailReal(email, password)

  if (result.success) {
    redirect("/dashboard")
  } else {
    return { error: result.error }
  }
}

export async function signOut() {
  await signOutReal()
}

export async function getCurrentUser() {
  return await getCurrentUserReal()
}

export async function resetPassword(email: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: "Password reset email sent" }
}

export async function updatePassword(password: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: "Password updated successfully" }
}

export async function signInWithGoogle() {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function handleAuthCallback(code: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return { success: false, error: error.message }
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
  const cookieStore = await cookies()
  const supabase = createServerClient(cookieStore)

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

export async function checkAuthCallback(searchParams: { code?: string; error?: string }) {
  if (searchParams.error) {
    return { success: false, error: searchParams.error }
  }

  if (searchParams.code) {
    const result = await handleAuthCallback(searchParams.code)

    if (!result.success) {
      return result
    }

    // Check if user needs verification
    if ("needsVerification" in result && result.needsVerification) {
      redirect("/verify-email")
    }

    // Redirect to dashboard or intended page
    redirect("/dashboard")
  }

  return { success: false, error: "No authorization code provided" }
}
