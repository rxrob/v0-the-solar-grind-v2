"use server"

import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface UsageTrackingResult {
  success: boolean
  error?: string
  data?: any
}

export async function trackUsage(action: string, details?: Record<string, any>): Promise<UsageTrackingResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createPagesServerClient({ cookies: () => cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    // Track the usage
    const { error } = await supabase.from("usage_tracking").insert({
      user_id: user.id,
      action,
      details: details || {},
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error tracking usage:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Usage tracking error:", error)
    return {
      success: false,
      error: "An error occurred while tracking usage",
    }
  }
}

export async function getUserUsageStats(): Promise<UsageTrackingResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createPagesServerClient({ cookies: () => cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    // Get usage statistics
    const { data, error } = await supabase
      .from("usage_tracking")
      .select("action, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching usage stats:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    // Process the data to get counts by action
    const actionCounts = data.reduce((acc: Record<string, number>, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1
      return acc
    }, {})

    return {
      success: true,
      data: {
        totalActions: data.length,
        actionCounts,
        recentActions: data.slice(0, 10),
      },
    }
  } catch (error) {
    console.error("Error fetching usage stats:", error)
    return {
      success: false,
      error: "An error occurred while fetching usage statistics",
    }
  }
}

export async function checkUsageLimit(
  action: string,
  limit: number,
  timeframe: "day" | "week" | "month" = "month",
): Promise<UsageTrackingResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createPagesServerClient({ cookies: () => cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    // Calculate the date range based on timeframe
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case "week":
        const dayOfWeek = now.getDay()
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000)
        startDate.setHours(0, 0, 0, 0)
        break
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    // Count usage for the specified action and timeframe
    const { data, error } = await supabase
      .from("usage_tracking")
      .select("id")
      .eq("user_id", user.id)
      .eq("action", action)
      .gte("created_at", startDate.toISOString())

    if (error) {
      console.error("Error checking usage limit:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    const currentUsage = data.length
    const hasExceededLimit = currentUsage >= limit

    return {
      success: true,
      data: {
        currentUsage,
        limit,
        hasExceededLimit,
        remainingUsage: Math.max(0, limit - currentUsage),
        timeframe,
        startDate: startDate.toISOString(),
      },
    }
  } catch (error) {
    console.error("Error checking usage limit:", error)
    return {
      success: false,
      error: "An error occurred while checking usage limit",
    }
  }
}

export async function resetUserUsage(action?: string): Promise<UsageTrackingResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createPagesServerClient({ cookies: () => cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    // Build the delete query
    let query = supabase.from("usage_tracking").delete().eq("user_id", user.id)

    if (action) {
      query = query.eq("action", action)
    }

    const { error } = await query

    if (error) {
      console.error("Error resetting usage:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: {
        message: action ? `Usage for action '${action}' has been reset` : "All usage data has been reset",
      },
    }
  } catch (error) {
    console.error("Error resetting usage:", error)
    return {
      success: false,
      error: "An error occurred while resetting usage",
    }
  }
}
