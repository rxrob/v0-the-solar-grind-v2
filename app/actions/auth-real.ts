"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { redirect } from "next/navigation"

const passwordSchema = z.string().min(8, "Password must be at least 8 characters long.")

export async function resetPassword(formData: FormData) {
  const email = formData.get("email") as string
  const supabase = createClient()

  if (!email) {
    return { error: "Email is required." }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/update-password`,
  })

  if (error) {
    console.error("Error resetting password:", error)
    return { error: "Could not send password reset link. Please try again." }
  }

  return { message: "Password reset email sent. Please check your inbox." }
}

export async function updatePassword(formData: FormData) {
  const password = formData.get("password") as string
  const supabase = createClient()

  const validation = passwordSchema.safeParse(password)
  if (!validation.success) {
    return { error: validation.error.errors[0].message }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error("Error updating password:", error)
    return { error: "Could not update your password. Please try again." }
  }

  // Redirect to a confirmation page or dashboard after successful password update
  redirect("/dashboard")
}
