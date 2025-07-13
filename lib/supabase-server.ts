// lib/supabase-server.ts
import { type CookieOptions, createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// This is your server-side Supabase instance.
// It's a factory function that creates a new client for each server request.
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}
