import { createClient as createSupabaseClientBase } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { cookies } from "next/headers"

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

// REQUIRED EXPORT: isSupabaseAvailable
export function isSupabaseAvailable(): boolean {
  const config = getSupabaseConfig()
  return config.isClientConfigured
}

// REQUIRED EXPORT: createClient
export function createClient() {
  const config = getSupabaseConfig()

  if (!config.isClientConfigured) {
    console.warn("Supabase not configured")
    return null
  }

  return createSupabaseClientBase<Database>(config.url!, config.anonKey!)
}

// REQUIRED EXPORT: createSupabaseClient
export function createSupabaseClient(url: string, key: string) {
  return createSupabaseClientBase<Database>(url, key)
}

// REQUIRED EXPORT: createServerSupabaseClient
export async function createServerSupabaseClient() {
  const config = getSupabaseConfig()

  if (!config.isClientConfigured) {
    return null
  }

  const cookieStore = await cookies()

  return createSupabaseClientBase<Database>(config.url!, config.anonKey!, {
    auth: {
      getSession: async () => {
        const sessionCookie = cookieStore.get("supabase-auth-token")
        return sessionCookie ? JSON.parse(sessionCookie.value) : null
      },
      setSession: async (session) => {
        if (session) {
          cookieStore.set("supabase-auth-token", JSON.stringify(session))
        } else {
          cookieStore.delete("supabase-auth-token")
        }
      },
    },
  })
}

// Single client instance for the entire app
export const supabaseClient = (() => {
  const config = getSupabaseConfig()

  if (!config.isClientConfigured) {
    console.warn("Supabase not configured - client will be null")
    return null
  }

  return createSupabaseClientBase<Database>(config.url!, config.anonKey!)
})()

// Function to get the client (for consistency with other patterns)
export function getSupabaseClient() {
  return supabaseClient
}

// REQUIRED EXPORT: supabaseAdmin
export const supabaseAdmin = (() => {
  const config = getSupabaseConfig()

  if (!config.isServerConfigured) {
    console.warn("Supabase server not configured - admin client will be null")
    return null
  }

  return createSupabaseClientBase<Database>(config.url!, config.serviceKey!)
})()

// Auth utilities
export async function signIn(email: string, password: string) {
  const client = getSupabaseClient()
  if (!client) throw new Error("Supabase not configured")

  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, fullName?: string) {
  const client = getSupabaseClient()
  if (!client) throw new Error("Supabase not configured")

  const { data, error } = await client.auth.signUp({
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
  const client = getSupabaseClient()
  if (!client) throw new Error("Supabase not configured")

  const { error } = await client.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const client = getSupabaseClient()
  if (!client) return null

  const {
    data: { user },
    error,
  } = await client.auth.getUser()
  if (error) {
    console.error("Error getting current user:", error)
    return null
  }

  return user
}

export async function getSession() {
  const client = getSupabaseClient()
  if (!client) return null

  const {
    data: { session },
    error,
  } = await client.auth.getSession()
  if (error) {
    console.error("Error getting session:", error)
    return null
  }

  return session
}

export async function resetPassword(email: string) {
  const client = getSupabaseClient()
  if (!client) throw new Error("Supabase not configured")

  const { data, error } = await client.auth.resetPasswordForEmail(email)
  if (error) throw error
  return data
}

export async function updatePassword(password: string) {
  const client = getSupabaseClient()
  if (!client) throw new Error("Supabase not configured")

  const { data, error } = await client.auth.updateUser({ password })
  if (error) throw error
  return data
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

// REQUIRED EXPORT: updateUserProfile
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
export type SupabaseClient = typeof supabaseClient
export type User = Database["public"]["Tables"]["users"]["Row"]
export type UserProject = Database["public"]["Tables"]["user_projects"]["Row"]
export type SolarCalculation = Database["public"]["Tables"]["solar_calculations"]["Row"]

// Main supabase export
export const supabase = (() => {
  const config = getSupabaseConfig()

  if (!config.isClientConfigured) {
    return null
  }

  return createSupabaseClientBase<Database>(config.url!, config.anonKey!)
})()

export default supabase
