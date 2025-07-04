import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

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

  return createSupabaseClient<Database>(config.url!, config.anonKey!, {
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

  return createSupabaseClient<Database>(config.url!, config.serviceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export the createClient function from supabase-js for compatibility
export { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Default client instance - this is the required export
export const supabase = createClient()

// Admin client for server operations
export const supabaseAdmin = (() => {
  try {
    return createServerSupabaseClient()
  } catch {
    return null
  }
})()

// Auth utilities
export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, fullName?: string) {
  if (!supabase) throw new Error("Supabase not configured")

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) throw new Error("Supabase not configured")

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  if (!supabase) return null

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) {
    console.error("Error getting current user:", error)
    return null
  }

  return user
}

export async function getSession() {
  if (!supabase) return null

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) {
    console.error("Error getting session:", error)
    return null
  }

  return session
}

// Server-side utilities
export async function getServerSession() {
  try {
    if (!supabaseAdmin) return null

    const {
      data: { session },
      error,
    } = await supabaseAdmin.auth.getSession()
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
    if (!supabaseAdmin) return null

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser()
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
    if (!supabaseAdmin) return null

    const { data, error } = await supabaseAdmin.from("users").select("*").eq("id", userId).single()

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

export async function updateUserProfile(
  userId: string,
  updates: Partial<Database["public"]["Tables"]["users"]["Update"]>,
) {
  try {
    if (!supabaseAdmin) return null

    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

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

export async function getUserProjects(userId: string) {
  try {
    if (!supabaseAdmin) return []

    const { data, error } = await supabaseAdmin
      .from("user_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting user projects:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Failed to get user projects:", error)
    return []
  }
}

export async function createUserProject(
  userId: string,
  projectData: Omit<
    Database["public"]["Tables"]["user_projects"]["Insert"],
    "user_id" | "id" | "created_at" | "updated_at"
  >,
) {
  try {
    if (!supabaseAdmin) return null

    const { data, error } = await supabaseAdmin
      .from("user_projects")
      .insert({
        user_id: userId,
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user project:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Failed to create user project:", error)
    return null
  }
}

export async function getUserCalculations(userId: string) {
  try {
    if (!supabaseAdmin) return []

    const { data, error } = await supabaseAdmin
      .from("solar_calculations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting user calculations:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Failed to get user calculations:", error)
    return []
  }
}

export async function saveSolarCalculation(
  userId: string,
  calculationData: Omit<Database["public"]["Tables"]["solar_calculations"]["Insert"], "user_id" | "id" | "created_at">,
) {
  try {
    if (!supabaseAdmin) return null

    const { data, error } = await supabaseAdmin
      .from("solar_calculations")
      .insert({
        user_id: userId,
        ...calculationData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving solar calculation:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Failed to save solar calculation:", error)
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

// Export types for use in other files
export type SupabaseClient = NonNullable<ReturnType<typeof createClient>>
export type SupabaseServerClient = ReturnType<typeof createServerSupabaseClient>
export type User = Database["public"]["Tables"]["users"]["Row"]
export type UserProject = Database["public"]["Tables"]["user_projects"]["Row"]
export type SolarCalculation = Database["public"]["Tables"]["solar_calculations"]["Row"]
