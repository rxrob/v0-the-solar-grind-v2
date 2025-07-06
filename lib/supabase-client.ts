import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

let client: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (!client) {
    console.log("Creating new Supabase client")
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  } else {
    console.log("Reusing existing Supabase client")
  }
  return client
}

// Singleton client instance
export const supabase = createClient()

// Get client status
export function getSupabaseClientStatus() {
  return {
    hasClient: !!client,
    configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not configured",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configured" : "Not configured",
  }
}

// Test client connection
export async function testClientConnection() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "Client connection successful" }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown client error",
    }
  }
}

// Reset client (for testing)
export function resetClient() {
  client = null
  console.log("Supabase client reset")
}
