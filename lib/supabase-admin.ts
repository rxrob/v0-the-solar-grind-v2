import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// This admin client uses the SERVICE_ROLE_KEY for elevated privileges.
// IMPORTANT: This should only be used in a secure server-side environment.
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
