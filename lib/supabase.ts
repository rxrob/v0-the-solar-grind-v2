import { createBrowserClient } from "@supabase/ssr"
import { createClient as createSupabaseClientBase } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Environment variables with proper validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Create client function - REQUIRED EXPORT
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Create Supabase client function - REQUIRED EXPORT
export function createSupabaseClient() {
  return createClient()
}

// Check if Supabase is available - REQUIRED EXPORT
export function isSupabaseAvailable(): boolean {
  try {
    return !!(supabaseUrl && supabaseAnonKey)
  } catch {
    return false
  }
}

// Server-side client with service role - REQUIRED EXPORT
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

// Legacy export - singleton client
export const supabase = createClient()

// Admin client for server operations
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

// Authentication functions
export async function signUp(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return await supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  const supabase = createClient()
  return await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function resetPassword(email: string) {
  const supabase = createClient()
  return await supabase.auth.resetPasswordForEmail(email)
}

export const updatePassword = async (password: string) => {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.updateUser({ password })
    return { data, error }
  } catch (err: any) {
    console.error("Update password error:", err)
    return { data: null, error: { message: `Network error: ${err.message || "Connection failed"}` } }
  }
}

// Database functions
export async function getUserProfile(userId: string) {
  const supabase = createClient()
  return await supabase.from("users").select("*").eq("id", userId).single()
}

export async function updateUserProfile(userId: string, updates: any) {
  const supabase = createClient()
  return await supabase.from("users").update(updates).eq("id", userId)
}

export async function createUserProfile(userId: string, profileData: any) {
  const supabase = createClient()
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
export function getSupabaseConfig() {
  return {
    url: supabaseUrl || "Not configured",
    anonKey: supabaseAnonKey ? "Configured" : "Not configured",
    serviceKey: supabaseServiceRoleKey ? "Configured" : "Not configured",
    isAvailable: isSupabaseAvailable(),
    connectionStatus: isSupabaseAvailable() ? "Ready" : "Needs configuration",
  }
}

// Test connection function
export async function testConnection() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Connection successful" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Type exports
export type { Database }

// Default export
export default createClient
