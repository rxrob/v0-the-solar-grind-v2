import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if Supabase is available
export const isSupabaseAvailable = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Mock client for when Supabase is not available
const createMockClient = () => {
  console.log("🔄 Using mock Supabase client (Supabase not configured)")

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: "Mock client - authentication not available" },
      }),
      signUp: async () => ({
        data: { user: null, session: null },
        error: { message: "Mock client - authentication not available" },
      }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({
        data: { user: null },
        error: { message: "Mock client - user updates not available" },
      }),
      onAuthStateChange: (callback: any) => {
        // Immediately call with no session to simulate unauthenticated state
        setTimeout(() => callback("INITIAL_SESSION", null), 0)
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: { message: "Mock client - database operations not available" } }),
      update: () => ({ data: null, error: { message: "Mock client - database operations not available" } }),
      delete: () => ({ data: null, error: { message: "Mock client - database operations not available" } }),
      upsert: () => ({ data: null, error: { message: "Mock client - database operations not available" } }),
    }),
  }
}

// Singleton client instance
let supabaseClientInstance: any = null

// Create client function
export const createClient = () => {
  if (supabaseClientInstance) {
    return supabaseClientInstance
  }

  if (!isSupabaseAvailable()) {
    supabaseClientInstance = createMockClient()
    return supabaseClientInstance
  }

  try {
    supabaseClientInstance = createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!)
    console.log("✅ Supabase client initialized successfully")
    return supabaseClientInstance
  } catch (error) {
    console.error("❌ Error creating Supabase client:", error)
    supabaseClientInstance = createMockClient()
    return supabaseClientInstance
  }
}

// Create server client function
export const createServerSupabaseClient = () => {
  if (!isSupabaseAvailable() || !supabaseServiceRoleKey) {
    console.log("🔄 Using mock server client (Supabase not fully configured)")
    return createMockClient()
  }

  try {
    return createSupabaseClient<Database>(supabaseUrl!, supabaseServiceRoleKey!)
  } catch (error) {
    console.error("❌ Error creating server Supabase client:", error)
    return createMockClient()
  }
}

// Export singleton instance
const supabase = createClient()
export { supabase }
export default supabase
