"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

/**
 * This is the singleton Supabase client for the browser.
 *
 * ES module caching ensures that the client is created only once per browser session.
 * All client-side components should import this single instance.
 */
const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export default supabase
