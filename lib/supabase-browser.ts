import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Define a function that creates a Supabase client for the browser
export const createClient = () =>
  createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// Export a singleton instance for components that expect it
export const supabase = createClient()
