import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  supabaseClient = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)

  return supabaseClient
}

// Test client connection
export async function testClientConnection() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return {
        success: false,
        error: error.message,
        details: "Failed to query users table",
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

// Legacy exports
export const supabase = createClient()
export default createClient
