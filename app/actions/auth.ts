"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  full_name: z.string().min(2, { message: "Full name is required." }),
})

export type SignupFormState = {
  message: string
  errors?: {
    email?: string[]
    password?: string[]
    full_name?: string[]
    _form?: string[]
  }
  success: boolean
}

export async function signupAndCreateProfile(prevState: SignupFormState, formData: FormData): Promise<SignupFormState> {
  const supabase = createClient()
  const supabaseAdmin = createAdminClient()

  const validatedFields = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    full_name: formData.get("full_name"),
  })

  if (!validatedFields.success) {
    return {
      message: "Invalid form data.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    }
  }

  const { email, password, full_name } = validatedFields.data

  // Step 1: Sign up the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  })

  if (authError) {
    return {
      message: "Failed to sign up.",
      errors: { _form: [authError.message] },
      success: false,
    }
  }

  if (!authData.user) {
    return {
      message: "User not found after sign up.",
      errors: { _form: ["An unexpected error occurred. Please try again."] },
      success: false,
    }
  }

  // Step 2: Create the user profile using the admin client to bypass RLS
  const { error: profileError } = await supabaseAdmin.from("users").insert({
    id: authData.user.id,
    email: authData.user.email,
    full_name: full_name,
    // Set default values for the new user
    subscription_type: "free",
    subscription_status: "active",
    calculations_used: 0,
    monthly_calculation_limit: 3,
    pro_trial_used: false,
  })

  if (profileError) {
    // This is a critical error. We should ideally clean up the auth user.
    console.error("CRITICAL: Failed to create user profile for auth user:", authData.user.id, profileError)
    return {
      message: "Failed to create user profile.",
      errors: { _form: ["A critical error occurred during sign-up. Please contact support."] },
      success: false,
    }
  }

  return {
    message: "Sign up successful! Please check your email for a confirmation link.",
    success: true,
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, user: null, profile: null }
  }

  // FIX: Using .select() correctly to avoid 406 error and handling potential errors.
  const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (profileError) {
    console.error("Error fetching user profile:", profileError)
    // Still return the user object even if profile fails
    return { success: true, user, profile: null }
  }

  return { success: true, user, profile }
}
