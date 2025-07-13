import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// IMPORTANT: This client uses the SERVICE_ROLE_KEY and should only be used in secure server-side environments.
// Never expose this key or client to the browser.
export const createSupabaseAdminClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.")
  }

  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
