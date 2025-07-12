import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Define a function to create a Supabase client for client-side operations
export const createClient = () =>
  createBrowserClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
