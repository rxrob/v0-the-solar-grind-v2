import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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

export function createSupabaseServerClient() {
  return createClient()
}

// Service client for admin operations
export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for service client")
  }

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No-op for service client
      },
    },
  })
}

// Test server connection
export async function testServerConnection() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      console.error("Server connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Server connection test error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.rpc("version")

    if (error) {
      console.error("Database connection test failed:", error)
      return { success: false, error: error.message }
    }

    return { success: true, version: data }
  } catch (error) {
    console.error("Database connection test error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
