import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )
}

export async function testServerConnection() {
  try {
    const supabase = await createSupabaseServerClient()

    // Test the connection by trying to get the current user
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Server connection test error:", error)
      return { success: false, error: error.message }
    }

    // Test database connection
    const { data, error: dbError } = await supabase.from("users").select("count").limit(1)

    if (dbError) {
      console.error("Database connection test error:", dbError)
      return { success: false, error: dbError.message }
    }

    return {
      success: true,
      user,
      message: "Server connection successful",
    }
  } catch (error) {
    console.error("Server connection test failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
