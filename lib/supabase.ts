import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Environment variables - only public ones accessible on client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton pattern for Supabase client
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }

  return supabaseInstance
}

// Create client function - REQUIRED EXPORT
export const createClient = () => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client - REQUIRED EXPORT
export function createServerSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("createServerSupabaseClient can only be called on the server")
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Admin Supabase client (server-only)
export function createServiceSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("createServiceSupabaseClient can only be called on the server")
  }

  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin environment variables")
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Default Supabase client instance
export const supabase = createClient()

// Check if Supabase is available
export function isSupabaseAvailable(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Get Supabase configuration status
export function getSupabaseConfig() {
  return {
    isAvailable: isSupabaseAvailable(),
    url: !!supabaseUrl,
    anonKey: !!supabaseAnonKey,
    connectionStatus: isSupabaseAvailable() ? "ready" : "missing-config",
  }
}

// Authentication functions
export async function signUp(email: string, password: string) {
  // Input validation
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required")
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  const client = createClient()
  return await client.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
  })
}

export async function signIn(email: string, password: string) {
  // Input validation
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required")
  }
  if (!password) {
    throw new Error("Password is required")
  }

  const client = createClient()
  return await client.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  })
}

export async function signOut() {
  const client = createClient()
  return await client.auth.signOut()
}

export async function getCurrentUser() {
  const client = createClient()
  const {
    data: { user },
  } = await client.auth.getUser()
  return user
}

export async function resetPassword(email: string) {
  // Input validation
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required")
  }

  const client = createClient()
  return await client.auth.resetPasswordForEmail(email.toLowerCase().trim())
}

export const updatePassword = async (password: string) => {
  // Input validation
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  const client = createClient()
  try {
    const { data, error } = await client.auth.updateUser({ password })
    return { data, error }
  } catch (err: any) {
    console.error("Update password error:", err)
    return { data: null, error: { message: `Network error: ${err.message || "Connection failed"}` } }
  }
}

// Database functions
export async function getUserProfile(userId: string) {
  if (!userId) {
    throw new Error("User ID is required")
  }

  const client = createClient()
  return await client.from("users").select("*").eq("id", userId).single()
}

export async function updateUserProfile(userId: string, updates: any) {
  if (!userId) {
    throw new Error("User ID is required")
  }
  if (!updates || typeof updates !== "object") {
    throw new Error("Valid updates object is required")
  }

  const client = createClient()
  return await client
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
}

export async function createUserProfile(userId: string, profileData: any) {
  const client = createClient()
  try {
    const { data, error } = await client
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
  const client = createClient()
  try {
    const { data, error } = await client
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
  const client = createClient()
  try {
    const { data, error } = await client
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
  const client = createClient()
  try {
    const { data, error } = await client
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
  const client = createClient()
  try {
    const { data, error } = await client
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

// Test connection function
export async function testConnection() {
  try {
    const client = createClient()
    const { data, error } = await client.from("users").select("count").limit(1)

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

// Helper functions
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    return { success: !error, error: error?.message }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}

export async function getSupabaseStatus() {
  const connection = await checkSupabaseConnection()
  return {
    connected: connection.success,
    error: connection.error,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "configured" : "missing",
  }
}

// Legacy exports for backward compatibility
export { createClient as createSupabaseClient }
export { createClient as createBrowserClient }
export { createServerSupabaseClient as createServerClient }

// Type exports
export type { Database }
