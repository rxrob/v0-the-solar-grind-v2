import { createServerSupabaseClient, createAdminSupabaseClient } from "./supabase"

// Server-side Supabase client
export function getServerSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("getServerSupabaseClient can only be called on the server")
  }

  return createServerSupabaseClient()
}

// Admin Supabase client (server-only)
export function getAdminSupabaseClient() {
  if (typeof window !== "undefined") {
    throw new Error("getAdminSupabaseClient can only be called on the server")
  }

  return createAdminSupabaseClient()
}

// Legacy exports
export { createServerSupabaseClient, createAdminSupabaseClient }
export { getServerSupabaseClient as createClient }
export { getServerSupabaseClient as createSupabaseServerClient }
