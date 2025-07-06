import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Export singleton instance
export const supabase = createClient()

// Test client connection
export async function testClientConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return {
        success: false,
        error: error.message,
        details: "Failed to query users table from client",
      }
    }

    return {
      success: true,
      message: "Client connection successful",
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: "Client connection failed",
    }
  }
}

// Get current user session
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Sign out user
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Legacy exports for backward compatibility
export { createClient as createSupabaseClient }
export { createClient as createBrowserClient }

// Type exports
export type { Database }
