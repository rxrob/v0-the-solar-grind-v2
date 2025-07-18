"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// This ensures the Supabase client is created only once in the browser
const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export default supabase
