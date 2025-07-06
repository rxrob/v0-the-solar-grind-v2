"use server"

import { createClient } from "@/lib/supabase-server"

interface UsageLimit {
  canCalculate: boolean
  remainingCalculations: number
  message: string
  resetDate?: string
}

export async function checkUsageLimit(userId: string): Promise<UsageLimit> {
  try {
    const supabase = await createClient()

    // Get user subscription type
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("subscription_type, calculations_used, monthly_calculation_limit")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return {
        canCalculate: false,
        remainingCalculations: 0,
        message: "User not found",
      }
    }

    // Pro users have unlimited calculations
    if (user.subscription_type === "pro") {
      return {
        canCalculate: true,
        remainingCalculations: -1, // -1 indicates unlimited
        message: "Unlimited calculations (Pro user)",
      }
    }

    // Free users have monthly limits
    const calculationsUsed = user.calculations_used || 0
    const monthlyLimit = user.monthly_calculation_limit || 3
    const remaining = monthlyLimit - calculationsUsed

    if (remaining <= 0) {
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1, 1)

      return {
        canCalculate: false,
        remainingCalculations: 0,
        message: `Monthly limit reached. Resets on ${nextMonth.toLocaleDateString()}`,
        resetDate: nextMonth.toISOString(),
      }
    }

    return {
      canCalculate: true,
      remainingCalculations: remaining,
      message: `${remaining} calculations remaining this month`,
    }
  } catch (error) {
    console.error("Check usage limit error:", error)
    return {
      canCalculate: false,
      remainingCalculations: 0,
      message: "Error checking usage limits",
    }
  }
}

export async function trackUsage(userId: string, calculationType: string) {
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
        updated_at: new Date().toISOString(),
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

export async function getUserUsage(userId: string) {
  try {
    const supabase = await createClient()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("subscription_type, calculations_used, monthly_calculation_limit, last_calculation_at")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return { success: false, error: "User not found" }
    }

    const used = user.calculations_used || 0
    const limit = user.subscription_type === "pro" ? -1 : user.monthly_calculation_limit || 3
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

export async function resetMonthlyUsage() {
  try {
    const supabase = await createClient()

    // Reset calculations_used for all free users
    const { data, error } = await supabase
      .from("users")
      .update({
        calculations_used: 0,
        usage_reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
      message: `Reset usage for ${resetCount} free users`,
    }
  } catch (error) {
    console.error("Reset monthly usage error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset monthly usage",
    }
  }
}

export async function upgradeUserToPro(userId: string, stripeCustomerId?: string) {
  try {
    const supabase = await createClient()

    const updates: any = {
      subscription_type: "pro",
      subscription_status: "active",
      monthly_calculation_limit: -1, // Unlimited
      updated_at: new Date().toISOString(),
    }

    if (stripeCustomerId) {
      updates.stripe_customer_id = stripeCustomerId
    }

    const { error } = await supabase.from("users").update(updates).eq("id", userId)

    if (error) {
      console.error("Error upgrading user to pro:", error)
      return { success: false, error: "Failed to upgrade user to pro" }
    }

    return { success: true, message: "User upgraded to Pro successfully" }
  } catch (error) {
    console.error("Upgrade user to pro error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upgrade user",
    }
  }
}

export async function downgradeUserToFree(userId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("users")
      .update({
        subscription_type: "free",
        subscription_status: "active",
        monthly_calculation_limit: 3,
        stripe_customer_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error downgrading user to free:", error)
      return { success: false, error: "Failed to downgrade user to free" }
    }

    return { success: true, message: "User downgraded to Free successfully" }
  } catch (error) {
    console.error("Downgrade user to free error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to downgrade user",
    }
  }
}
