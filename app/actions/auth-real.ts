"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

interface AuthResult {
  success: boolean
  error?: string
  user?: any
  session?: any
  needsVerification?: boolean
  message?: string
}

export async function signUpReal(email: string, password: string, fullName?: string): Promise<AuthResult> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Sign up error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Create user profile in database
    if (data.user) {
      try {
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
      } catch (profileError) {
        console.error("Profile creation error:", profileError)
      }
    }

    if (data.user && !data.user.email_confirmed_at) {
      return {
        success: true,
        needsVerification: true,
        user: data.user,
        message: "Please check your email to verify your account",
      }
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign up",
    }
  }
}

export async function signInWithEmailReal(email: string, password: string): Promise<AuthResult> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/", "layout")
    return {
      success: true,
      user: data.user,
      session: data.session,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign in",
    }
  }
}

export async function signOutReal(): Promise<void> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    await supabase.auth.signOut()
    revalidatePath("/", "layout")
  } catch (error) {
    console.error("Sign out error:", error)
  }
  redirect("/")
}

export async function getCurrentUserReal() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Get user error:", error)
      return null
    }

    if (!user) {
      return null
    }

    // Get user profile from our users table
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      console.error("Error fetching user profile:", profileError)
      return {
        ...user,
        subscriptionPlan: "free",
        subscriptionStatus: "active",
        emailVerified: !!user.email_confirmed_at,
      }
    }

    return {
      ...user,
      subscriptionPlan: profile?.subscription_type || "free",
      subscriptionStatus: profile?.subscription_status || "active",
      emailVerified: !!user.email_confirmed_at,
      profile,
    }
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function resetPasswordReal(email: string): Promise<AuthResult> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      console.error("Reset password error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Password reset email sent successfully",
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during password reset",
    }
  }
}

export async function updatePasswordReal(newPassword: string): Promise<AuthResult> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Update password error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Password updated successfully",
    }
  } catch (error) {
    console.error("Update password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during password update",
    }
  }
}

export async function signInWithGoogleReal(): Promise<AuthResult> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Google sign in error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    if (data.url) {
      redirect(data.url)
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Google sign in error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during Google sign in",
    }
  }
}

export async function handleAuthCallbackReal(code: string): Promise<AuthResult> {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Auth callback error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Check if user profile exists, create if not
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

    return {
      success: true,
      user: data.user,
      session: data.session,
    }
  } catch (error) {
    console.error("Auth callback error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during authentication",
    }
  }
}

export async function getUserProfileReal() {
  try {
    const user = await getCurrentUserReal()
    if (!user) {
      return null
    }

    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Get user profile error:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Get user profile error:", error)
    return null
  }
}

export async function updateUserProfileReal(updates: {
  full_name?: string
  phone?: string
  company?: string
  address?: string
}): Promise<AuthResult> {
  try {
    const user = await getCurrentUserReal()
    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    const { error } = await supabase.from("users").update(updates).eq("id", user.id)

    if (error) {
      console.error("Update user profile error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Profile updated successfully",
    }
  } catch (error) {
    console.error("Update user profile error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during profile update",
    }
  }
}

// Legacy exports for backward compatibility - these are the missing exports
export const getCurrentUser = getCurrentUserReal
export const signOut = signOutReal
export const resetPassword = resetPasswordReal
export const updatePassword = updatePasswordReal
export const signInWithEmail = signInWithEmailReal
