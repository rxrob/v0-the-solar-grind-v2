"use server"

import { createClient } from "@/lib/supabase-server"

interface UsageResult {
  success: boolean
  error?: string
  data?: {
    calculationsUsed: number
    calculationLimit: number
    subscriptionType: string
    canCalculate: boolean
    remaining: number
  }
}

export async function trackUsage(userId: string, calculationType: string): Promise<UsageResult> {
  try {
    const supabase = await createClient()

    // Get current user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("calculations_used, monthly_calculation_limit, subscription_type, subscription_status")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error getting user data:", userError)
      return {
        success: false,
        error: "Failed to get user data",
      }
    }

    const currentUsed = userData.calculations_used || 0
    const limit = userData.monthly_calculation_limit || 3
    const subscriptionType = userData.subscription_type || "free"

    // Check if user can perform calculation
    if (subscriptionType === "free" && currentUsed >= limit) {
      return {
        success: false,
        error: "Monthly calculation limit reached. Upgrade to Pro for unlimited calculations.",
        data: {
          calculationsUsed: currentUsed,
          calculationLimit: limit,
          subscriptionType,
          canCalculate: false,
          remaining: 0,
        },
      }
    }

    // Increment usage count
    const newUsedCount = currentUsed + 1
    const { error: updateError } = await supabase
      .from("users")
      .update({
        calculations_used: newUsedCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error updating usage count:", updateError)
      return {
        success: false,
        error: "Failed to update usage count",
      }
    }

    // Log the usage
    await supabase.from("usage_logs").insert({
      user_id: userId,
      action_type: "calculation",
      calculation_type: calculationType,
      created_at: new Date().toISOString(),
    })

    const remaining = subscriptionType === "pro" ? -1 : Math.max(0, limit - newUsedCount)

    return {
      success: true,
      data: {
        calculationsUsed: newUsedCount,
        calculationLimit: limit,
        subscriptionType,
        canCalculate: subscriptionType === "pro" || newUsedCount < limit,
        remaining,
      },
    }
  } catch (error) {
    console.error("Usage tracking error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to track usage",
    }
  }
}

export async function getUserUsage(userId: string): Promise<UsageResult> {
  try {
    const supabase = await createClient()

    const { data: userData, error } = await supabase
      .from("users")
      .select("calculations_used, monthly_calculation_limit, subscription_type, subscription_status")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error getting user usage:", error)
      return {
        success: false,
        error: "Failed to get usage data",
      }
    }

    const calculationsUsed = userData.calculations_used || 0
    const calculationLimit = userData.monthly_calculation_limit || 3
    const subscriptionType = userData.subscription_type || "free"

    const remaining = subscriptionType === "pro" ? -1 : Math.max(0, calculationLimit - calculationsUsed)
    const canCalculate = subscriptionType === "pro" || calculationsUsed < calculationLimit

    return {
      success: true,
      data: {
        calculationsUsed,
        calculationLimit,
        subscriptionType,
        canCalculate,
        remaining,
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

export async function resetMonthlyUsage(): Promise<{ success: boolean; error?: string; resetCount?: number }> {
  try {
    const supabase = await createClient()

    // Reset calculations_used to 0 for all users
    const { error } = await supabase
      .from("users")
      .update({
        calculations_used: 0,
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000") // Update all real users

    if (error) {
      console.error("Error resetting monthly usage:", error)
      return {
        success: false,
        error: "Failed to reset monthly usage",
      }
    }

    // Log the reset action
    await supabase.from("usage_logs").insert({
      user_id: "system",
      action_type: "monthly_reset",
      calculation_type: "system",
      created_at: new Date().toISOString(),
    })

    return {
      success: true,
      resetCount: 1, // Fixed the TypeScript error by removing data.length
    }
  } catch (error) {
    console.error("Reset monthly usage error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset monthly usage",
    }
  }
}

export async function upgradeUserToPro(
  userId: string,
  stripeCustomerId?: string,
): Promise<{ success: boolean; error?: string }> {
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
      return {
        success: false,
        error: "Failed to upgrade user to pro",
      }
    }

    // Log the upgrade
    await supabase.from("usage_logs").insert({
      user_id: userId,
      action_type: "upgrade",
      calculation_type: "pro_upgrade",
      created_at: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Upgrade user to pro error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upgrade user",
    }
  }
}

export async function downgradeUserToFree(userId: string): Promise<{ success: boolean; error?: string }> {
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
      return {
        success: false,
        error: "Failed to downgrade user to free",
      }
    }

    // Log the downgrade
    await supabase.from("usage_logs").insert({
      user_id: userId,
      action_type: "downgrade",
      calculation_type: "free_downgrade",
      created_at: new Date().toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error("Downgrade user to free error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to downgrade user",
    }
  }
}
