"use server"

import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

interface AuthResult {
  success: boolean
  error?: string
  user?: any
  message?: string
}

export async function signUpAction(email: string, password: string, fullName?: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      // Insert user into our users table
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
        subscription_type: "free",
        subscription_status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error inserting user:", insertError)
      }
    }

    return { success: true, message: "Check your email to confirm your account" }
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signInAction(email: string, password: string): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data.user) {
      redirect("/dashboard")
    }

    return { success: true }
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Sign out error:", error)
  }

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
      return null
    }

    return user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect("/error")
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect("/error")
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
