import { createClient } from "@supabase/supabase-js"
import { getClientConfig, getServerConfig } from "./env-validation"

// Type definitions
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          subscription_type: "free" | "pro"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_type?: "free" | "pro"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_type?: "free" | "pro"
          updated_at?: string
        }
      }
      user_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          address: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          address: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          address?: string
          updated_at?: string
        }
      }
      solar_calculations: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          calculation_data: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          calculation_data: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          calculation_data?: any
        }
      }
    }
  }
}

// Client-side Supabase client
export function createClientSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("createClientSupabaseClient can only be called on the client")
  }

  const config = getClientConfig()

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("Supabase configuration is missing")
  }

  return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Server-side Supabase client
export function createServerSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("createServerSupabaseClient can only be called on the server")
  }

  const config = getServerConfig()

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("Supabase configuration is missing")
  }

  return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Admin Supabase client (server-only)
export function createAdminSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("createAdminSupabaseClient can only be called on the server")
  }

  const config = getServerConfig()

  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error("Supabase admin configuration is missing")
  }

  return createClient<Database>(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

// Check if Supabase is available
export function isSupabaseAvailable(): boolean {
  try {
    if (typeof window !== "undefined") {
      const config = getClientConfig()
      return !!(config.supabaseUrl && config.supabaseAnonKey)
    } else {
      const config = getServerConfig()
      return !!(config.supabaseUrl && config.supabaseAnonKey)
    }
  } catch {
    return false
  }
}

// Get Supabase configuration status
export function getSupabaseConfig() {
  if (typeof window !== "undefined") {
    // Client-side
    const config = getClientConfig()
    return {
      isAvailable: !!(config.supabaseUrl && config.supabaseAnonKey),
      url: !!config.supabaseUrl,
      anonKey: !!config.supabaseAnonKey,
      serviceKey: false, // Never expose service key status on client
      connectionStatus: "client-ready",
    }
  } else {
    // Server-side
    const config = getServerConfig()
    return {
      isAvailable: !!(config.supabaseUrl && config.supabaseAnonKey),
      url: !!config.supabaseUrl,
      anonKey: !!config.supabaseAnonKey,
      serviceKey: !!config.supabaseServiceKey,
      connectionStatus: "server-ready",
    }
  }
}

// Test connection (server-only)
export async function testConnection() {
  if (typeof window !== "undefined") {
    throw new Error("testConnection can only be called on the server")
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return {
        success: false,
        error: error.message,
        canQuery: false,
      }
    }

    return {
      success: true,
      canQuery: true,
      message: "Connection successful",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
      canQuery: false,
    }
  }
}

// Authentication functions (client-side)
export async function signUp(email: string, password: string) {
  if (typeof window === "undefined") {
    throw new Error("signUp can only be called on the client")
  }

  // Input validation
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required")
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }

  const supabase = createClientSupabaseClient()
  return await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
  })
}

export async function signIn(email: string, password: string) {
  if (typeof window === "undefined") {
    throw new Error("signIn can only be called on the client")
  }

  // Input validation
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required")
  }
  if (!password) {
    throw new Error("Password is required")
  }

  const supabase = createClientSupabaseClient()
  return await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  })
}

export async function signOut() {
  if (typeof window === "undefined") {
    throw new Error("signOut can only be called on the client")
  }

  const supabase = createClientSupabaseClient()
  return await supabase.auth.signOut()
}

export async function getCurrentUser() {
  if (typeof window === "undefined") {
    throw new Error("getCurrentUser can only be called on the client")
  }

  const supabase = createClientSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function resetPassword(email: string) {
  if (typeof window === "undefined") {
    throw new Error("resetPassword can only be called on the client")
  }

  // Input validation
  if (!email || !email.includes("@")) {
    throw new Error("Valid email is required")
  }

  const supabase = createClientSupabaseClient()
  return await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim())
}

// Type exports
export type { Database }
