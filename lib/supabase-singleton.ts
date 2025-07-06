import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Global singleton instance - this ensures only ONE client exists across the entire app
let globalSupabaseClient: ReturnType<typeof createClientComponentClient<Database>> | null = null

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

// THE ONLY function that creates a Supabase client - SINGLETON PATTERN
export function getSupabaseClient() {
  const config = getSupabaseConfig()

  if (!config.isConfigured) {
    console.warn("Supabase not configured - cannot create client")
    return null
  }

  // Return existing client if already created (SINGLETON)
  if (globalSupabaseClient) {
    return globalSupabaseClient
  }

  // Create new client only if none exists
  try {
    globalSupabaseClient = createClientComponentClient<Database>()
    console.log("✅ Created single Supabase client instance")
    return globalSupabaseClient
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return null
  }
}

// Reset function for testing/development
export function resetSupabaseClient() {
  globalSupabaseClient = null
  console.log("🔄 Reset Supabase client instance")
}

// Check if client exists
export function hasSupabaseClient(): boolean {
  return globalSupabaseClient !== null
}

// Configuration utilities
export function getSupabaseStatus() {
  const config = getSupabaseConfig()

  return {
    configured: config.isConfigured,
    url: config.url ? "Set" : "Missing",
    anonKey: config.anonKey ? "Set" : "Missing",
    clientExists: hasSupabaseClient(),
  }
}

// Check if Supabase is available
export function isSupabaseAvailable(): boolean {
  const config = getSupabaseConfig()
  return config.isConfigured
}

// Export types
export type SupabaseClient = ReturnType<typeof getSupabaseClient>
