"use server"

import { createClient } from "@/lib/supabase-client"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export interface AuthResult {
  success: boolean
  error?: string
  user?: any
  needsVerification?: boolean
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function getCurrentUser() {
  const supabase = createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return user
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(password: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function handleAuthCallback() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    console.error("Auth callback error:", error)
    redirect("/login?error=auth_callback_error")
  }

  if (data.session) {
    // Check if user profile exists
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.session.user.id)
      .single()

    if (profileError || !profile) {
      // Create user profile if it doesn't exist
      const { error: insertError } = await supabase.from("users").insert({
        id: data.session.user.id,
        email: data.session.user.email,
        full_name: data.session.user.user_metadata?.full_name || null,
        subscription_type: "free",
        subscription_status: "active",
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error creating user profile:", insertError)
      }
    }

    redirect("/dashboard")
  } else {
    redirect("/login")
  }
}

// Enhanced sign up with better error handling
export async function signUpWithEmail(email: string, password: string, fullName: string): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    const result: AuthResult = {
      success: true,
      user: data.user,
    }

    // Check if email verification is needed
    if (data.user && !data.user.email_confirmed_at) {
      result.needsVerification = true
    }

    // Safe check for needsVerification property
    if ("needsVerification" in result && result.needsVerification) {
      return {
        success: true,
        needsVerification: true,
        user: data.user,
      }
    }

    return result
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign up failed",
    }
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign in failed",
    }
  }
}
