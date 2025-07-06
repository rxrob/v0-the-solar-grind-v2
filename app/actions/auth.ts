"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function signUp(formData: FormData) {
  const supabase = createServerClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect("/error")
  }

  redirect("/success")
}

export async function signIn(formData: FormData) {
  const supabase = createServerClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect("/error")
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/")
}

export async function signInWithGoogle() {
  const supabase = createServerClient()
  const origin = headers().get("origin")

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect("/error")
  }

  redirect(data.url)
}

export async function resetPassword(formData: FormData) {
  const supabase = createServerClient()
  const email = formData.get("email") as string
  const origin = headers().get("origin")

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    redirect("/error")
  }

  redirect("/success")
}

export async function updatePassword(formData: FormData) {
  const supabase = createServerClient()
  const password = formData.get("password") as string

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    redirect("/error")
  }

  redirect("/dashboard")
}

export async function getCurrentUser() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
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

  return { success: true, user: data.user }
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || "",
      },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Check if email confirmation is required
  if (data.user && !data.session) {
    return {
      success: true,
      needsVerification: true,
      message: "Please check your email to confirm your account.",
    }
  }

  return { success: true, user: data.user }
}

export async function handleAuthCallback(code: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, user: data.user }
}

export async function checkAuthStatus() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { authenticated: false, user: null }
    }

    return { authenticated: !!user, user }
  } catch (error) {
    return { authenticated: false, user: null }
  }
}

export async function handlePasswordReset(email: string) {
  const supabase = createServerClient()
  const origin = headers().get("origin")

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    message: "Password reset email sent. Please check your inbox.",
  }
}

export async function handlePasswordUpdate(password: string) {
  const supabase = createServerClient()

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    message: "Password updated successfully.",
  }
}

export async function getUserProfile() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get user profile from custom users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("email", user.email)
      .single()

    if (profileError) {
      return { success: false, error: "Profile not found" }
    }

    return {
      success: true,
      user: {
        ...user,
        profile,
      },
    }
  } catch (error) {
    return { success: false, error: "Failed to get user profile" }
  }
}

export async function updateUserProfile(updates: {
  name?: string
  avatar_url?: string
}) {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Update auth user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: updates,
    })

    if (updateError) {
      return { success: false, error: updateError.message }
    }

    // Update custom users table
    const { error: profileError } = await supabase.from("users").update(updates).eq("email", user.email)

    if (profileError) {
      console.error("Profile update error:", profileError)
    }

    return { success: true, message: "Profile updated successfully" }
  } catch (error) {
    return { success: false, error: "Failed to update profile" }
  }
}

export async function deleteAccount() {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Delete user data from custom tables
    await supabase.from("solar_calculations").delete().eq("user_email", user.email)

    await supabase.from("user_projects").delete().eq("user_email", user.email)

    await supabase.from("users").delete().eq("email", user.email)

    // Sign out user
    await supabase.auth.signOut()

    return { success: true, message: "Account deleted successfully" }
  } catch (error) {
    return { success: false, error: "Failed to delete account" }
  }
}
