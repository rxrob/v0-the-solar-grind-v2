import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// REQUIRED EXPORT - createClient as named export
export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.error("Error setting cookie:", error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
          console.error("Error removing cookie:", error)
        }
      },
    },
  })
}

// Create server client with cookies - REQUIRED EXPORT
export function createSupabaseServerClient() {
  return createClient()
}

// Create service client for admin operations
export function createSupabaseServiceClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase service role key")
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Test server connection
export async function testServerConnection() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Server connection successful" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Test database connection with service client
export async function testDatabaseConnection() {
  try {
    const supabase = createSupabaseServiceClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Database connection successful" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get server configuration status
export function getSupabaseServerConfig() {
  return {
    url: supabaseUrl ? "Configured" : "Missing",
    anonKey: supabaseAnonKey ? "Configured" : "Missing",
    serviceKey: supabaseServiceRoleKey ? "Configured" : "Missing",
    isConfigured: !!(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey),
  }
}

// Check if server Supabase is configured
export function isSupabaseServerConfigured() {
  return !!(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey)
}

// Default export
export default createClient
