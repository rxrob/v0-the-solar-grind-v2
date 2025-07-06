import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import type { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createSupabaseServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: any) {
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

// Test connection function
export async function testSupabaseConnection() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables")
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test the connection by trying to fetch from auth.users
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      throw error
    }

    return {
      success: true,
      message: "Supabase connection successful",
      userCount: data.users.length,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

// Re-export createClient for compatibility
export { createClient }
