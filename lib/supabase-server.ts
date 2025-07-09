import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )
}

export const createSupabaseServiceClient = () => {
  // Note: This client is for server-side operations with admin privileges.
  // It does not rely on user cookies.
  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  })
}

export async function testServerConnection() {
  const supabase = createClient()
  try {
    // We perform a simple query to a known table.
    // This tests the connection, credentials, and basic RLS setup.
    const { error } = await supabase.from("user_projects").select("id").limit(1)

    if (error) {
      // If we get an error, it could be due to RLS, which still means the connection is alive.
      return {
        success: true,
        canQuery: false,
        error: `Query failed (this may be due to RLS): ${error.message}`,
      }
    }

    // If no error, the connection is good and we can query data.
    return { success: true, canQuery: true, error: null }
  } catch (e: any) {
    // This will catch network errors or fundamental configuration problems.
    return { success: false, canQuery: false, error: e.message }
  }
}

// Aliases for consistency and backward compatibility
export const createSupabaseServerClient = createClient
export const createServerSupabaseClient = createClient
