import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

function getSupabaseClient() {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    console.log("Creating new Supabase client instance")
    supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  } else {
    console.log("Reusing existing Supabase client instance")
  }
  return supabaseInstance
}

// REQUIRED EXPORT - createClient as named export
export function createClient() {
  return getSupabaseClient()
}

// Export the singleton client instance
export const supabase = getSupabaseClient()

// Get client status for diagnostics
export function getSupabaseClientStatus() {
  return {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
    clientExists: !!supabaseInstance,
  }
}

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Reset client instance (for testing)
export function resetSupabaseClient() {
  console.log("Resetting Supabase client instance")
  supabaseInstance = null
}

// Test connection
export async function testConnection() {
  try {
    const client = getSupabaseClient()
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

// Default export
export default getSupabaseClient
