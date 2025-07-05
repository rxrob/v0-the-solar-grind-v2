import { createClient as createSupabaseClientBase } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Create client with default configuration
export const createClient = () => {
  if (!isSupabaseAvailable()) {
    throw new Error("Supabase configuration is missing")
  }
  return createSupabaseClientBase<Database>(supabaseUrl, supabaseAnonKey)
}

// THE MISSING EXPORT - Create client with custom parameters
export const createSupabaseClient = (url: string, key: string) => {
  return createSupabaseClientBase<Database>(url, key)
}

// Admin client for server operations
export const supabaseAdmin = createSupabaseClientBase<Database>(supabaseUrl, supabaseServiceRoleKey)

// Server-side client with service role
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase server configuration is missing")
  }
  return createSupabaseClientBase<Database>(supabaseUrl, supabaseServiceRoleKey)
}

// Authentication functions
export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email: string, password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user, error }
}

export const resetPassword = async (email: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.resetPasswordForEmail(email)
  return { data, error }
}

export const updatePassword = async (password: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.auth.updateUser({ password })
  return { data, error }
}

// Database functions
export const getUserProfile = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
  return { data, error }
}

export const updateUserProfile = async (userId: string, updates: any) => {
  const supabase = createClient()
  const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()
  return { data, error }
}

export const createUserProject = async (projectData: any) => {
  const supabase = createClient()
  const { data, error } = await supabase.from("user_projects").insert(projectData).select().single()
  return { data, error }
}

export const getUserProjects = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("user_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return { data, error }
}

export const saveSolarCalculation = async (calculationData: any) => {
  const supabase = createClient()
  const { data, error } = await supabase.from("solar_calculations").insert(calculationData).select().single()
  return { data, error }
}

export const getUserCalculations = async (userId: string) => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("solar_calculations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  return { data, error }
}

// Configuration utilities
export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isAvailable: isSupabaseAvailable(),
  }
}

// Type exports
export type { Database }
