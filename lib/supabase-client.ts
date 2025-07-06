import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Client-side Supabase singleton
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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

// Default export
export const supabase = getSupabaseClient()

// Named exports
export { getSupabaseClient as createClient }
export { getSupabaseClient as createSupabaseClient }

// Type exports
export type { Database }
