import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const db = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// User operations
export async function createUser(userData: {
  id: string
  email: string
  full_name?: string
  subscription_type?: string
  stripe_customer_id?: string
}) {
  try {
    const { data, error } = await db.from("users").insert(userData).select().single()

    if (error) {
      console.error("Error creating user:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error }
  }
}

export async function getUserById(id: string) {
  try {
    const { data, error } = await db.from("users").select("*").eq("id", id).single()

    if (error) {
      console.error("Error getting user by ID:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting user by ID:", error)
    return { success: false, error }
  }
}

export async function getUserByEmail(email: string) {
  try {
    const { data, error } = await db.from("users").select("*").eq("email", email).single()

    if (error) {
      console.error("Error getting user by email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting user by email:", error)
    return { success: false, error }
  }
}

export async function updateUser(
  id: string,
  updates: Partial<{
    full_name: string
    subscription_type: string
    stripe_customer_id: string
    stripe_subscription_id: string
    subscription_status: string
    trial_ends_at: string
    current_period_end: string
    single_reports_purchased: number
    calculations_used: number
    calculations_limit: number
  }>,
) {
  try {
    const { data, error } = await db.from("users").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating user:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error updating user:", error)
    return { success: false, error }
  }
}

export async function updateUserByEmail(
  email: string,
  updates: Partial<{
    subscription_type: string
    stripe_customer_id: string
    stripe_subscription_id: string
    subscription_status: string
    trial_ends_at: string
    current_period_end: string
    single_reports_purchased: number
    calculations_used: number
    calculations_limit: number
  }>,
) {
  try {
    const { data, error } = await db.from("users").update(updates).eq("email", email).select().single()

    if (error) {
      console.error("Error updating user by email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error updating user by email:", error)
    return { success: false, error }
  }
}

// Project operations
export async function createProject(projectData: {
  user_id: string
  name: string
  address: string
  latitude?: number
  longitude?: number
  system_size?: number
  panel_count?: number
  estimated_annual_production?: number
  estimated_savings?: number
}) {
  try {
    const { data, error } = await db.from("user_projects").insert(projectData).select().single()

    if (error) {
      console.error("Error creating project:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating project:", error)
    return { success: false, error }
  }
}

export async function getUserProjects(userId: string) {
  try {
    const { data, error } = await db
      .from("user_projects")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting user projects:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting user projects:", error)
    return { success: false, error }
  }
}

export async function updateProject(
  id: string,
  updates: Partial<{
    name: string
    address: string
    latitude: number
    longitude: number
    system_size: number
    panel_count: number
    estimated_annual_production: number
    estimated_savings: number
  }>,
) {
  try {
    const { data, error } = await db.from("user_projects").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating project:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error updating project:", error)
    return { success: false, error }
  }
}

export async function deleteProject(id: string) {
  try {
    const { error } = await db.from("user_projects").delete().eq("id", id)

    if (error) {
      console.error("Error deleting project:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting project:", error)
    return { success: false, error }
  }
}

// Solar calculation operations
export async function createSolarCalculation(calculationData: {
  user_id: string
  project_id?: string
  address: string
  system_size: number
  panel_count: number
  estimated_annual_production: number
  estimated_savings: number
  calculation_type: string
  input_data: any
  result_data: any
}) {
  try {
    const { data, error } = await db.from("solar_calculations").insert(calculationData).select().single()

    if (error) {
      console.error("Error creating solar calculation:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating solar calculation:", error)
    return { success: false, error }
  }
}

export async function getUserCalculations(userId: string) {
  try {
    const { data, error } = await db
      .from("solar_calculations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting user calculations:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting user calculations:", error)
    return { success: false, error }
  }
}

// Usage tracking
export async function incrementUserCalculations(userId: string) {
  try {
    const { data, error } = await db.rpc("increment_user_calculations", { user_id: userId })

    if (error) {
      console.error("Error incrementing user calculations:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error incrementing user calculations:", error)
    return { success: false, error }
  }
}

export async function getUserUsageStats(userId: string) {
  try {
    const { data, error } = await db
      .from("users")
      .select("calculations_used, calculations_limit, subscription_type, single_reports_purchased")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error getting user usage stats:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting user usage stats:", error)
    return { success: false, error }
  }
}

// Admin operations
export async function getAllUsers() {
  try {
    const { data, error } = await db.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting all users:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting all users:", error)
    return { success: false, error }
  }
}

export async function getSystemStats() {
  try {
    const [usersResult, projectsResult, calculationsResult] = await Promise.all([
      db.from("users").select("id", { count: "exact" }),
      db.from("user_projects").select("id", { count: "exact" }),
      db.from("solar_calculations").select("id", { count: "exact" }),
    ])

    return {
      success: true,
      data: {
        totalUsers: usersResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalCalculations: calculationsResult.count || 0,
      },
    }
  } catch (error) {
    console.error("Error getting system stats:", error)
    return { success: false, error }
  }
}
