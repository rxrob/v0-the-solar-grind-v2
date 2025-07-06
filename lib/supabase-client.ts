import { createClientSupabaseClient } from "./supabase"

// Singleton pattern for client-side Supabase client
let supabaseClient: ReturnType<typeof createClientSupabaseClient> | null = null

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseClient can only be called on the client side")
  }

  if (!supabaseClient) {
    supabaseClient = createClientSupabaseClient()
  }

  return supabaseClient
}

// Export the singleton instance - REQUIRED EXPORT
export const supabase = getSupabaseClient()

// Check if Supabase is available
export function isSupabaseAvailable(): boolean {
  try {
    return !!getSupabaseClient()
  } catch {
    return false
  }
}

// Get client status
export function getClientStatus() {
  try {
    const client = getSupabaseClient()
    return {
      configured: true,
      client: "Initialized",
      ready: true,
    }
  } catch (error: any) {
    return {
      configured: false,
      client: "Not initialized",
      ready: false,
      error: error.message,
    }
  }
}

// Default export
export default getSupabaseClient

// Legacy exports for backward compatibility
export { getSupabaseClient as createClient }
export { getSupabaseClient as createSupabaseClient }
