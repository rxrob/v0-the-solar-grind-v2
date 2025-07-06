import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Client-side environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton client instance
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

// Create or get existing Supabase client
export function createSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("createSupabaseClient can only be called on the client")
  }

  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables")
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }

  return supabaseClient
}

// Default export - the singleton client
export const supabase = createSupabaseClient()

// Check if Supabase is available on client
export function isSupabaseClientAvailable(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Type exports
export type { Database }
