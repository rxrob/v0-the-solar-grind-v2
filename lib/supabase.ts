import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// This is the single source of truth for the client-side Supabase client.
// All other browser-side files will import this instance.
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
