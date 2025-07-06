"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

interface AuthResult {
  success: boolean
  error?: string
  user?: any
  message?: string
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting current user:", error)
      return { user: null, error: error.message }
    }

    return { user, error: null }
  } catch (error) {
    console.error("Get current user error:", error)
    return {
      user: null,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function resetPassword(email: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

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
      message: "Password reset email sent",
    }
  } catch (error) {
    console.error("Reset password error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send reset email",
    }
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

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
      message: "Password updated successfully",
    }
  } catch (error) {
    console.error("Update password error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update password",
    }
  }
}

export async function updateUserProfile(formData: FormData) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    const updates = {
      full_name: formData.get("fullName") as string,
      company: formData.get("company") as string,
      phone: formData.get("phone") as string,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("users").update(updates).eq("id", user.id)

    if (error) {
      console.error("Error updating profile:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    }
  }
}

// Export the functions that are imported in other files
