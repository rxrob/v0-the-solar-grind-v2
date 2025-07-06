import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
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

// Test database connection
export async function testDatabaseConnection() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("Database connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Database connection test error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Export createClient as an alias for compatibility
export const createClient = createServerClient
