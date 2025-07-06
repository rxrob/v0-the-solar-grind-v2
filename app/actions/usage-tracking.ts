"use server"

import { createClient } from "@/lib/supabase-server"

export async function checkUsageLimit(userId: string): Promise<{
  success: boolean
  error?: string
  data?: {
    used: number
    limit: number
    remaining: number
    canCalculate: boolean
  }
}> {
  try {
    const supabase = await createClient()

    // Get user subscription info
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("subscription_type, calculations_used, calculations_limit")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return { success: false, error: "User not found" }
    }

    // Pro users have unlimited calculations
    if (user.subscription_type === "pro") {
      return {
        success: true,
        data: {
          used: user.calculations_used || 0,
          limit: -1, // Unlimited
          remaining: -1,
          canCalculate: true,
        },
      }
    }

    // Check if free user has exceeded limit
    const used = user.calculations_used || 0
    const limit = user.calculations_limit || 5
    const remaining = Math.max(0, limit - used)
    const canCalculate = remaining > 0

    if (!canCalculate) {
      return {
        success: false,
        error: "Monthly calculation limit reached. Upgrade to Pro for unlimited calculations.",
        data: {
          used,
          limit,
          remaining: 0,
          canCalculate: false,
        },
      }
    }

    return {
      success: true,
      data: {
        used,
        limit,
        remaining,
        canCalculate: true,
      },
    }
  } catch (error) {
    console.error("Check usage limit error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check usage limit",
    }
  }
}

export async function trackUsage(
  userId: string,
  calculationType: "basic_calculation" | "advanced_calculation",
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const supabase = await createClient()

    // Get current user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("subscription_type, calculations_used")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return { success: false, error: "User not found" }
    }

    // Don't track usage for pro users (unlimited)
    if (user.subscription_type === "pro") {
      return { success: true }
    }

    // Increment usage count for free users
    const newUsageCount = (user.calculations_used || 0) + 1

    const { error: updateError } = await supabase
      .from("users")
      .update({
        calculations_used: newUsageCount,
        last_calculation_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating usage count:", updateError)
      return { success: false, error: "Failed to track usage" }
    }

    return { success: true }
  } catch (error) {
    console.error("Track usage error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to track usage",
    }
  }
}

export async function getUserUsage(userId: string): Promise<{
  success: boolean
  data?: {
    used: number
    limit: number
    remaining: number
    subscriptionType: string
    lastCalculation?: string
  }
  error?: string
}> {
  try {
    const supabase = await createClient()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("subscription_type, calculations_used, calculations_limit, last_calculation_at")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return { success: false, error: "User not found" }
    }

    const used = user.calculations_used || 0
    const limit = user.subscription_type === "pro" ? -1 : user.calculations_limit || 5
    const remaining = limit === -1 ? -1 : Math.max(0, limit - used)

    return {
      success: true,
      data: {
        used,
        limit,
        remaining,
        subscriptionType: user.subscription_type,
        lastCalculation: user.last_calculation_at,
      },
    }
  } catch (error) {
    console.error("Get user usage error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get usage data",
    }
  }
}

export async function resetMonthlyUsage(): Promise<{
  success: boolean
  error?: string
  resetCount?: number
}> {
  try {
    const supabase = await createClient()

    // Reset calculations_used for all free users
    const { data, error } = await supabase
      .from("users")
      .update({
        calculations_used: 0,
        usage_reset_at: new Date().toISOString(),
      })
      .eq("subscription_type", "free")
      .select("id")

    if (error) {
      console.error("Reset monthly usage error:", error)
      return { success: false, error: error.message }
    }

    const resetCount = Array.isArray(data) ? data.length : 0

    return {
      success: true,
      resetCount,
    }
  } catch (error) {
    console.error("Reset monthly usage error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset monthly usage",
    }
  }
}
