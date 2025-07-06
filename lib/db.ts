import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}

if (!supabaseServiceKey) {
  throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY")
}

// Create a single supabase client for interacting with your database
export const db = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
