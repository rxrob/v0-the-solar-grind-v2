"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

interface AuthResult {
  success: boolean
  error?: string
  user?: any
}

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

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

    if (data.user) {
      redirect("/dashboard")
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign in",
    }
  }
}

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string

  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    }
  }

  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

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

    // Create user profile in our users table
    if (data.user) {
      const { error: profileError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        subscription_type: "free",
        subscription_status: "active",
        calculations_used: 0,
        monthly_calculation_limit: 3,
        pro_trial_used: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Error creating user profile:", profileError)
        return {
          success: false,
          error: "Failed to create user profile",
        }
      }
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign up",
    }
  }
}

export async function signOutAction(): Promise<AuthResult> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    redirect("/")
  } catch (error) {
    console.error("Sign out error:", error)
    return {
      success: false,
      error: "An unexpected error occurred during sign out",
    }
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get additional user data from our users table
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return user
    }

    return {
      ...user,
      ...userData,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function resetPasswordAction(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string

  if (!email) {
    return {
      success: false,
      error: "Email is required",
    }
  }

  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred while resetting password",
    }
  }
}

export async function updatePasswordAction(formData: FormData): Promise<AuthResult> {
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!password || !confirmPassword) {
    return {
      success: false,
      error: "Password and confirmation are required",
    }
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: "Passwords do not match",
    }
  }

  if (password.length < 6) {
    return {
      success: false,
      error: "Password must be at least 6 characters long",
    }
  }

  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    const { error } = await supabase.auth.updateUser({
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
    }
  } catch (error) {
    console.error("Update password error:", error)
    return {
      success: false,
      error: "An unexpected error occurred while updating password",
    }
  }
}

// Add these export aliases at the end of the file
export const signOut = signOutAction
export const resetPassword = resetPasswordAction
export const updatePassword = updatePasswordAction
export const signUpReal = signUpAction
