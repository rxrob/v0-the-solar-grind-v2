"use server"

import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import type { FormData } from "next"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long."),
})

export async function signup(prevState: any, formData: FormData) {
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      error: "Invalid email or password.",
    }
  }

  const { email, password } = validatedFields.data

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  return {
    message: "Check your email to confirm your account.",
  }
}
