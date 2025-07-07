import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for browser usage
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Named export for client creation
export const createSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Service client for server-side operations
export const createServiceSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Check if Supabase is available
export const isSupabaseAvailable = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    return !error
  } catch (error) {
    console.error("Supabase availability check failed:", error)
    return false
  }
}

// Default export
export default supabase
