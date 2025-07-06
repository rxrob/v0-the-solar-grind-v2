import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    console.log("Creating new Supabase client")
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  } else {
    console.log("Reusing existing Supabase client")
  }

  return supabaseClient
}

// Singleton instance
export const supabase = createClient()

// Get client status
export function getSupabaseClientStatus() {
  return {
    hasClient: !!supabaseClient,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Missing",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configured" : "Missing",
  }
}

// Test client connection
export async function testClientConnection() {
  try {
    const client = createClient()
    const { data, error } = await client.from("users").select("count").limit(1)

    if (error) {
      console.error("Client connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Client connection test error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
