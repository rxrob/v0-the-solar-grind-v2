import { createServerClient as createSupabaseServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createServerClient() {
  const cookieStore = cookies()

  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
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
    const supabase = createServerClient()
    const { data, error } = await supabase.from("users").select("count", { count: "exact", head: true })

    if (error) {
      console.error("Database connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Database connection successful" }
  } catch (error) {
    console.error("Database connection test error:", error)
    return { success: false, error: "Failed to connect to database" }
  }
}

// Re-export createClient for compatibility
export { createServerClient as createClient }
