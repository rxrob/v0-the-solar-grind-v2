import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// This function can be used to create a new client instance.
export const createClient = (): SupabaseClient =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// This is the singleton instance that can be imported directly.
export const supabase: SupabaseClient = createClient()
