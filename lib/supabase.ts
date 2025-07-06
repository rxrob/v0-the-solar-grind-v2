import { createClient as createSupabaseClientBase, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Environment variables with proper validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create client function
export function createClient(): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createSupabaseClientBase<Database>(supabaseUrl, supabaseAnonKey)
}

// Create Supabase client function
export function createSupabaseClient(): SupabaseClient<Database> {
  return createClient()
}

// Check if Supabase is available (required for deployment)
export function isSupabaseAvailable(): boolean {
  try {
    return !!(supabaseUrl && supabaseAnonKey)
  } catch {
    return false
  }
}

// Use the singleton client for all operations
export function createSupabaseClientInstance() {
  return createClient()
}

// Legacy export - now uses singleton
export const supabase = createClient()

// Admin client for server operations (separate from browser client)
export const supabaseAdmin = (() => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("Supabase admin not configured")
    return null
  }

  try {
    return createSupabaseClientBase<Database>(supabaseUrl, supabaseServiceRoleKey)
  } catch (error) {
    console.error("Failed to create Supabase admin client:", error)
    return null
  }
})()

// Server-side client with service role (separate from browser client)
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn("Supabase server not configured")
    return null
  }

  try {
    return createSupabaseClientBase<Database>(supabaseUrl, supabaseServiceRoleKey)
  } catch (error) {
    console.error("Failed to create server Supabase client:", error)
    return null
  }
}

// Authentication functions using the singleton client
export const signIn = async (email: string, password: string) => {
  const supabase = createClient()
  if (!supabase) {
    return {
      data: null,
      error: { message: "Supabase connection unavailable - check your configuration" },
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (err: any) {
    console.error("Sign in error:", err)
    return {
      data: null,
      error: { message: `Network error: ${err.message || "Connection failed"}` },
    }
  }
}

export const signUp = async (email: string, password: string, fullName?: string) => {
  const supabase = createClient()
  if (!supabase) {
    return {
      data: null,
      error: { message: "Supabase connection unavailable - check your configuration" },
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: fullName
        ? {
            data: {
              full_name: fullName,
            },
          }
        : undefined,
    })
    return { data, error }
  } catch (err: any) {
    console.error("Sign up error:", err)
    return { data: null, error: { message: `Network error: ${err.message || "Connection failed"}` } }
  }
}

export const signOut = async () => {
  const supabase = createClient()
  if (!supabase) {
    return { error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err: any) {
    console.error("Sign out error:", err)
    return { error: { message: `Network error: ${err.message || "Connection failed"}` } }
  }
}

export const getCurrentUser = async () => {
  const supabase = createClient()
  if (!supabase) {
    return { user: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    return { user, error }
  } catch (err: any) {
    console.error("Get user error:", err)
    return { user: null, error: { message: `Network error: ${err.message || "Connection failed"}` } }
  }
}

export const resetPassword = async (email: string) => {
  const supabase = createClient()
  if (!supabase) {
    return { data: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  } catch (err: any) {
    console.error("Reset password error:", err)
    return { data: null, error: { message: `Network error: ${err.message || "Connection failed"}` } }
  }
}

export const updatePassword = async (password: string) => {
  const supabase = createClient()
  if (!supabase) {
    return { data: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { data, error } = await supabase.auth.updateUser({ password })
    return { data, error }
  } catch (err: any) {
    console.error("Update password error:", err)
    return { data: null, error: { message: `Network error: ${err.message || "Connection failed"}` } }
  }
}

// Database functions using the singleton client
export async function getUserProfile(userId: string) {
  const supabase = createClient()
  if (!supabase) {
    return { data: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()
    return { data, error }
  } catch (err: any) {
    console.error("Get user profile error:", err)
    return { data: null, error: { message: `Database error: ${err.message || "Connection failed"}` } }
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  const supabase = createClient()
  if (!supabase) {
    return { data: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()
    return { data, error }
  } catch (err: any) {
    console.error("Update user profile error:", err)
    return { data: null, error: { message: `Database error: ${err.message || "Connection failed"}` } }
  }
}

export async function createUserProfile(userId: string, profileData: any) {
  const supabase = createClient()
  if (!supabase) {
    return { data: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        id: userId,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    return { data, error }
  } catch (err: any) {
    console.error("Create user profile error:", err)
    return { data: null, error: { message: `Database error: ${err.message || "Connection failed"}` } }
  }
}

export const createUserProject = async (projectData: any) => {
  const supabase = createClient()
  if (!supabase) {
    return { data: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { data, error } = await supabase
      .from("user_projects")
      .insert({
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    return { data, error }
  } catch (err: any) {
    console.error("Create user project error:", err)
    return { data: null, error: { message: `Database error: ${err.message || "Connection failed"}` } }
  }
}

export const getUserProjects = async (userId: string) => {
  const supabase = createClient()
  if (!supabase) {
    return { data: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { data, error } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return { data, error }
  } catch (err: any) {
    console.error("Get user projects error:", err)
    return { data: null, error: { message: `Database error: ${err.message || "Connection failed"}` } }
  }
}

export const saveSolarCalculation = async (calculationData: any) => {
  const supabase = createClient()
  if (!supabase) {
    return { data: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { data, error } = await supabase
      .from("solar_calculations")
      .insert({
        ...calculationData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    return { data, error }
  } catch (err: any) {
    console.error("Save solar calculation error:", err)
    return { data: null, error: { message: `Database error: ${err.message || "Connection failed"}` } }
  }
}

export const getUserCalculations = async (userId: string) => {
  const supabase = createClient()
  if (!supabase) {
    return { data: null, error: { message: "Supabase connection unavailable" } }
  }

  try {
    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return { data, error }
  } catch (err: any) {
    console.error("Get user calculations error:", err)
    return { data: null, error: { message: `Database error: ${err.message || "Connection failed"}` } }
  }
}

// Configuration utilities
export const getSupabaseConfigUtil = () => {
  return {
    url: supabaseUrl || "Not configured",
    anonKey: supabaseAnonKey ? "Configured" : "Not configured",
    serviceKey: supabaseServiceRoleKey ? "Configured" : "Not configured",
    isAvailable: isSupabaseAvailable(),
    connectionStatus: isSupabaseAvailable() ? "Ready" : "Needs configuration",
  }
}

// Test connection function
export const testSupabaseConnection = async () => {
  const supabase = createClient()
  if (!supabase) {
    return {
      success: false,
      error: "Supabase client not available - check environment variables",
    }
  }

  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    if (error) {
      return {
        success: false,
        error: `Database connection failed: ${error.message}`,
      }
    }
    return {
      success: true,
      message: "Supabase connection successful",
    }
  } catch (err: any) {
    return {
      success: false,
      error: `Connection test failed: ${err.message || "Unknown error"}`,
    }
  }
}

// Type exports
export type { Database }

// Default export
export default createClient
