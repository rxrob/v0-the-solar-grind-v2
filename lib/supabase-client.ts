import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Environment validation
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
  }
}

// Check if Supabase is available
export function isSupabaseAvailable(): boolean {
  const config = getSupabaseConfig()
  return config.isConfigured
}

// Check if Supabase is configured
export const isSupabaseConfigured = isSupabaseAvailable()

// Create client function
export function createClientFunction() {
  const config = getSupabaseConfig()

  if (!config.isConfigured) {
    console.warn("Supabase not configured - using mock client")
    return null
  }

  return createClient<Database>(config.url!, config.anonKey!)
}

// Single instance for direct imports - REQUIRED EXPORT
export const supabase = createClientFunction()

// Get client instance
export function getSupabaseClient() {
  return createClientFunction()
}

// Safe version that returns null if not configured
export function createClientSafeFunction() {
  const config = getSupabaseConfig()

  if (!config.isConfigured) {
    return null
  }

  return createClient<Database>(config.url!, config.anonKey!)
}

// Hook for using Supabase
export const useSupabase = () => {
  const config = getSupabaseConfig()

  if (!config.isConfigured) {
    throw new Error("Supabase is not configured. Please check your environment variables.")
  }

  return createClient<Database>(config.url!, config.anonKey!)
}

// Mock authentication for when Supabase isn't available
export const mockAuth = {
  signUp: async (email: string, password: string, fullName: string) => {
    console.log("🎭 Mock signup:", { email, fullName })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      user: {
        id: `mock-${Date.now()}`,
        email,
        user_metadata: { full_name: fullName },
        email_confirmed_at: new Date().toISOString(),
      },
      message: "Mock registration successful",
    }
  },

  signIn: async (email: string, password: string) => {
    console.log("🎭 Mock signin:", { email })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      user: {
        id: `mock-${Date.now()}`,
        email,
        user_metadata: { full_name: "Mock User" },
        email_confirmed_at: new Date().toISOString(),
      },
      message: "Mock login successful",
    }
  },

  signOut: async () => {
    console.log("🎭 Mock signout")
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { success: true }
  },

  getCurrentUser: async () => {
    console.log("🎭 Mock get current user")
    return null // No user in mock mode
  },
}

// Configuration check utilities
export function getSupabaseStatus() {
  const config = getSupabaseConfig()

  return {
    configured: config.isConfigured,
    url: config.url ? "Set" : "Missing",
    anonKey: config.anonKey ? "Set" : "Missing",
  }
}

// Export types for use in other files
export type SupabaseClient = ReturnType<typeof createClientFunction>

export default supabase
