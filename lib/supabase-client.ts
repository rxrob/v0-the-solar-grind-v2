import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Global variable to store the singleton client instance
let clientInstance: SupabaseClient<Database> | null = null

export function getSupabaseClient(): SupabaseClient<Database> {
  // If we already have a client instance, return it
  if (clientInstance) {
    console.log("🔄 Reusing existing Supabase client instance")
    return clientInstance
  }

  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Create new client instance
  console.log("🆕 Creating new Supabase client instance")
  clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return clientInstance
}

// Export the singleton client instance
export const supabase = getSupabaseClient()

// Export for compatibility
export default supabase

// Function to reset the client (useful for testing)
export function resetSupabaseClient() {
  console.log("🔄 Resetting Supabase client instance")
  clientInstance = null
}

// Function to check if client is configured
export function isSupabaseConfigured(): boolean {
  try {
    const client = getSupabaseClient()
    return !!client
  } catch {
    return false
  }
}

// Function to get client status
export function getClientStatus() {
  return {
    hasInstance: !!clientInstance,
    configured: isSupabaseConfigured(),
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
  }
}
