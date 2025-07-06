import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Export createClient for compatibility
export { createClient }

// Test database connection
export async function testDatabaseConnection() {
  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("Database connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Database connection successful" }
  } catch (error) {
    console.error("Database connection test error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get server-side user session
export async function getServerSession() {
  try {
    const supabase = await createServerClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Get session error:", error)
      return null
    }

    return session
  } catch (error) {
    console.error("Get session error:", error)
    return null
  }
}

// Get server-side user
export async function getServerUser() {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Get user error:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Get user error:", error)
    return null
  }
}
