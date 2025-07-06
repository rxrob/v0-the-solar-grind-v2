import { createClient as createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

// Create server-side Supabase client
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables for server client")
  }

  return createServerClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Create server-side client with cookies for auth
export function createSupabaseServerClientWithAuth() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookies().get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookies().set({ name, value, ...options })
        } catch (error) {
          // Handle cookie setting errors in server components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookies().set({ name, value: "", ...options })
        } catch (error) {
          // Handle cookie removal errors in server components
        }
      },
    },
  })
}

// Test server connection
export async function testServerConnection() {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return {
        success: false,
        error: error.message,
        details: "Failed to query users table",
      }
    }

    return {
      success: true,
      message: "Server connection successful",
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: "Server connection failed",
    }
  }
}

// Get user by ID (server-side)
export async function getUserById(userId: string) {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Update user subscription (server-side)
export async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    subscription_type?: string
    subscription_status?: string
    stripe_customer_id?: string
    stripe_subscription_id?: string
  },
) {
  try {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from("users")
      .update({
        ...subscriptionData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Legacy exports for backward compatibility
export { createSupabaseServerClient as createServerClient }
export { createSupabaseServerClient as createServiceSupabaseClient }

// Type exports
export type { Database }

// Create client with cookies for auth
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

export const createServerSupabaseClient = createClient
