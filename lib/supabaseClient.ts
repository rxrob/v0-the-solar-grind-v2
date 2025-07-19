import { createBrowserClient } from "@supabase/ssr"

// Create a singleton Supabase client for the browser
export function getSupabaseClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
