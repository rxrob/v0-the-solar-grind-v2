import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Environment validation
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceKey: supabaseServiceKey,
    isClientConfigured: !!(supabaseUrl && supabaseAnonKey),
    isServerConfigured: !!(supabaseUrl && supabaseServiceKey),
  }
}

// Check if Supabase is available
export function isSupabaseAvailable(): boolean {
  const config = getSupabaseConfig()
  return config.isClientConfigured
}

// Create client-side Supabase client
export function createClient() {
  const config = getSupabaseConfig()

  if (!config.isClientConfigured) {
    console.warn("Supabase client configuration missing. Some features may not work.")
    return null
  }

  return createSupabaseClient(config.url!, config.anonKey!, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

// Create server-side Supabase client with service role
export function createServerSupabaseClient() {
  const config = getSupabaseConfig()

  if (!config.isServerConfigured) {
    throw new Error("Supabase server configuration missing. Check SUPABASE_SERVICE_ROLE_KEY.")
  }

  return createSupabaseClient(config.url!, config.serviceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export the createClient function from supabase-js for compatibility
export { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Default client instance - this is the missing export
export const supabase = createClient()

// Server-side utilities
export async function getServerSession() {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error getting server session:", error)
      return null
    }

    return session
  } catch (error) {
    console.error("Failed to get server session:", error)
    return null
  }
}

export async function getServerUser() {
  try {
    const supabase = createServerSupabaseClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error("Error getting server user:", error)
      return null
    }

    return user
  } catch (error) {
    console.error("Failed to get server user:", error)
    return null
  }
}

// Database utilities
export async function getUserProfile(userId: string) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error getting user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Failed to get user profile:", error)
    return null
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("users").update(updates).eq("id", userId).select().single()

    if (error) {
      console.error("Error updating user profile:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Failed to update user profile:", error)
    return null
  }
}

// Configuration check utilities
export function getSupabaseStatus() {
  const config = getSupabaseConfig()

  return {
    configured: config.isClientConfigured && config.isServerConfigured,
    clientConfigured: config.isClientConfigured,
    serverConfigured: config.isServerConfigured,
    url: config.url ? "Set" : "Missing",
    anonKey: config.anonKey ? "Set" : "Missing",
    serviceKey: config.serviceKey ? "Set" : "Missing",
  }
}
