import { createClient as createSupabaseClient, createBrowserClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Environment variables - only public ones accessible on client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Singleton pattern for Supabase client
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
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
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
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

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    throw new Error("Missing Supabase admin environment variables")
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Default Supabase client instance
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

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

  return await supabase.auth.signUp({
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

  return await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  })
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function resetPassword(email: string) {
  // Input validation
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required")
  }

  return await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim())
}

export const updatePassword = async (password: string) => {
  // Input validation
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

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
  if (!userId) {
    throw new Error("User ID is required")
  }

  return await supabase.from("users").select("*").eq("id", userId).single()
}

export async function updateUserProfile(userId: string, updates: any) {
  if (!userId) {
    throw new Error("User ID is required")
  }
  if (!updates || typeof updates !== "object") {
    throw new Error("Valid updates object is required")
  }

  return await supabase
    .from("users")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
}

export async function createUserProfile(userId: string, profileData: any) {
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

// Test connection function
export async function testConnection() {
  try {
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
    url: supabaseUrl ? "configured" : "missing",
    key: supabaseAnonKey ? "configured" : "missing",
  }
}

// Legacy exports for backward compatibility
export { createClient as createSupabaseClient }
export { createClient as createBrowserClient }
export { createServerSupabaseClient as createServerClient }

// Type exports
export type { Database }
