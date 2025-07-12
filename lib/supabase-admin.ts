import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// This admin client is for server-side use ONLY.
// It uses the Supabase service role key and bypasses all RLS policies.
// NEVER expose this client or the service role key to the browser.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase URL or Service Role Key is missing from environment variables.")
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
