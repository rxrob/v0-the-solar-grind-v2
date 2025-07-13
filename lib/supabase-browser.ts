// lib/supabase-browser.ts
import { createBrowserClient } from "@supabase/ssr"

// This is your client-side Supabase instance.
// It's a singleton, created once and exported.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
