import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

export const createSupabaseServerClient = () =>
  createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies,
  })

export const createSupabaseAdminClient = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Test server connection function
export const testServerConnection = async () => {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("Server connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Server connection test error:", error)
    return { success: false, error: "Connection failed" }
  }
}

// Alias for compatibility
export const createClient = createSupabaseServerClient
