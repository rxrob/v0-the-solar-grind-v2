import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Server-side client with cookies
export function createClient() {
  const cookieStore = cookies()

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch {
          // The `remove` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Alternative name for compatibility
export function createSupabaseServerClient() {
  return createClient()
}

// Service role client for admin operations
export function createSupabaseServiceClient() {
  if (!supabaseServiceKey) {
    throw new Error("Missing Supabase service role key")
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Helper function to handle database errors
export function handleDatabaseError(error: any) {
  console.error("Database error:", error)

  if (error.code === "23505") {
    // Unique constraint violation
    if (error.constraint?.includes("email")) {
      return "An account with this email already exists"
    }
    return "This record already exists"
  }

  if (error.code === "PGRST116") {
    return "Record not found"
  }

  return error.message || "Database operation failed"
}

// Helper function to safely get user profile
export async function getUserProfile(userId: string) {
  const client = createSupabaseServiceClient()

  try {
    const { data, error } = await client.from("users").select("*").eq("id", userId).single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return { data, error }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return { data: null, error }
  }
}

// Helper function to safely create or update user profile
export async function upsertUserProfile(userData: any) {
  const client = createSupabaseServiceClient()

  try {
    const { data, error } = await client
      .from("users")
      .upsert(userData, {
        onConflict: "id",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    console.error("Error upserting user profile:", error)
    return { data: null, error }
  }
}
