import { createClient as createSupabaseClientBase } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the main client instance
export const createClient = () => {
  return createSupabaseClientBase<Database>(supabaseUrl, supabaseAnonKey)
}

// Create client with custom parameters - THIS WAS THE MISSING EXPORT
export const createSupabaseClient = (url: string, key: string) => {
  return createSupabaseClientBase<Database>(url, key)
}

// Server-side client creation
export const createServerSupabaseClient = () => {
  return createSupabaseClientBase<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Default client instance
export const supabase = createClient()

// Authentication utilities
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user, error }
}

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
  return { data, error }
}

export const updatePassword = async (password: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password,
  })
  return { data, error }
}

// Database utilities
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
  return { data, error }
}

export const createUserProject = async (projectData: any) => {
  const { data, error } = await supabase.from("user_projects").insert(projectData).select().single()
  return { data, error }
}

export const getUserProjects = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return { data, error }
}

export const saveSolarCalculation = async (calculationData: any) => {
  const { data, error } = await supabase.from("solar_calculations").insert(calculationData).select().single()
  return { data, error }
}

export const getUserCalculations = async (userId: string) => {
  const { data, error } = await supabase
    .from("solar_calculations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return { data, error }
}

// Configuration check
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Export types
export type { Database }
export type SupabaseClient = ReturnType<typeof createClient>
