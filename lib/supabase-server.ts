import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Server-side environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side Supabase client - REQUIRED EXPORT
export function createSupabaseServerClient() {
  if (typeof window !== "undefined") {
    throw new Error("createSupabaseServerClient can only be called on the server")
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Admin Supabase client (server-only)
export function createAdminSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminSupabaseClient can only be called on the server")
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Test server connection
export async function testServerConnection() {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return {
        success: false,
        error: error.message,
        canQuery: false,
      }
    }

    return {
      success: true,
      canQuery: true,
      message: "Server connection successful",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
      canQuery: false,
    }
  }
}

// Legacy exports for backward compatibility
export { createSupabaseServerClient as createServerSupabaseClient }
export { createAdminSupabaseClient as createServiceSupabaseClient }

// Type exports
export type { Database }
