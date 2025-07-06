"use server"

import { createClient } from "@/lib/supabase-server"

export async function trackUsage(userId: string, action: string) {
  try {
    const supabase = await createClient()

    // Get current user's subscription status
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_status, monthly_calculations_used")
      .eq("id", userId)
      .single()

    if (userError) {
      console.error("Error fetching user data:", userError)
      return { success: false, error: userError.message }
    }

    // Check usage limits for free users
    if (userData.subscription_status === "free" && action === "calculation") {
      const currentUsage = userData.monthly_calculations_used || 0
      const freeLimit = 5

      if (currentUsage >= freeLimit) {
        return {
          success: false,
          error: "Monthly calculation limit reached. Upgrade to Pro for unlimited calculations.",
          limitReached: true,
        }
      }

      // Increment usage count
      const { error: updateError } = await supabase
        .from("users")
        .update({
          monthly_calculations_used: currentUsage + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("Error updating usage:", updateError)
        return { success: false, error: updateError.message }
      }
    }

    // Log the usage
    const { error: logError } = await supabase.from("usage_logs").insert({
      user_id: userId,
      action,
      timestamp: new Date().toISOString(),
    })

    if (logError) {
      console.error("Error logging usage:", logError)
      // Don't fail the request if logging fails
    }

    return { success: true }
  } catch (error) {
    console.error("Usage tracking error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Usage tracking failed",
    }
  }
}

export async function getUserUsageStats(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("users")
      .select("subscription_status, monthly_calculations_used, subscription_type")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching usage stats:", error)
      return { success: false, error: error.message }
    }

    const freeLimit = 5
    const remainingCalculations =
      data.subscription_status === "free" ? Math.max(0, freeLimit - (data.monthly_calculations_used || 0)) : -1 // Unlimited for pro users

    return {
      success: true,
      data: {
        subscriptionStatus: data.subscription_status,
        subscriptionType: data.subscription_type,
        monthlyCalculationsUsed: data.monthly_calculations_used || 0,
        remainingCalculations,
        isUnlimited: data.subscription_status !== "free",
      },
    }
  } catch (error) {
    console.error("Get usage stats error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch usage stats",
    }
  }
}

export async function resetMonthlyUsage() {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("users")
      .update({
        monthly_calculations_used: 0,
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000") // Update all real users

    if (error) {
      console.error("Error resetting monthly usage:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Reset monthly usage error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset usage",
    }
  }
}
