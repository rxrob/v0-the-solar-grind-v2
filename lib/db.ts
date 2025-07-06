import { createServiceSupabaseClient } from "@/lib/supabase"

// Server-side database client using service role
export const db = createServiceSupabaseClient()

// Database helper functions
export async function getUserById(userId: string) {
  const { data, error } = await db.from("users").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user:", error)
    return null
  }

  return data
}

export async function updateUserSubscription(userId: string, subscriptionData: any) {
  const { data, error } = await db
    .from("users")
    .update({
      subscription_status: subscriptionData.status,
      subscription_id: subscriptionData.id,
      customer_id: subscriptionData.customer,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single()

  if (error) {
    console.error("Error updating user subscription:", error)
    return null
  }

  return data
}

export async function createUser(userData: any) {
  const { data, error } = await db
    .from("users")
    .insert({
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating user:", error)
    return null
  }

  return data
}

export async function getUserProjects(userId: string) {
  const { data, error } = await db
    .from("user_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user projects:", error)
    return []
  }

  return data || []
}

export async function createProject(projectData: any) {
  const { data, error } = await db
    .from("user_projects")
    .insert({
      ...projectData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating project:", error)
    return null
  }

  return data
}

export async function saveSolarCalculation(calculationData: any) {
  const { data, error } = await db
    .from("solar_calculations")
    .insert({
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
}

export async function getUserCalculations(userId: string) {
  const { data, error } = await db
    .from("solar_calculations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching user calculations:", error)
    return []
  }

  return data || []
}

export async function incrementUsageCount(userId: string, usageType: string) {
  const { data, error } = await db.rpc("increment_usage_count", {
    user_id: userId,
    usage_type: usageType,
  })

  if (error) {
    console.error("Error incrementing usage count:", error)
    return false
  }

  return true
}

export async function getUserUsage(userId: string) {
  const { data, error } = await db
    .from("users")
    .select("calculations_used, reports_generated")
    .eq("id", userId)
    .single()

  if (error) {
    console.error("Error fetching user usage:", error)
    return { calculations_used: 0, reports_generated: 0 }
  }

  return data || { calculations_used: 0, reports_generated: 0 }
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    const { data, error } = await db.from("users").select("count").limit(1)
    return { success: !error, error: error?.message }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed",
    }
  }
}
