import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client function
export function getSupabaseBrowserClient() {
  return supabase
}

// Default export
export default supabase
