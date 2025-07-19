import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// This client uses the SERVICE_ROLE_KEY for admin-level access.
// It should ONLY be used on the server in secure environments.
const createAdminSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are not set for admin client.")
  }
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Exporting both names to satisfy all legacy imports from the error logs.
export const createAdminClient = createAdminSupabaseClient
export const createSupabaseServiceClient = createAdminSupabaseClient
