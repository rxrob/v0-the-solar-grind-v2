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
      .select("subscription_type")
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
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    const { data: usage, error: usageError } = await supabase
      .from("user_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .single()

    const freeLimit = 5 // 5 calculations per month for free users

    if (usageError && usageError.code === "PGRST116") {
      // No usage record for this month, create one
      const { error: createError } = await supabase.from("user_usage").insert({
        user_id: userId,
        month: currentMonth,
        calculations_used: 0,
        last_reset: new Date().toISOString(),
      })

      if (createError) {
        console.error("Error creating usage record:", createError)
        return {
          canCalculate: false,
          remainingCalculations: 0,
          message: "Error checking usage limits",
        }
      }

      return {
        canCalculate: true,
        remainingCalculations: freeLimit,
        message: `${freeLimit} calculations remaining this month`,
      }
    }

    if (usageError) {
      console.error("Error checking usage:", usageError)
      return {
        canCalculate: false,
        remainingCalculations: 0,
        message: "Error checking usage limits",
      }
    }

    const remaining = freeLimit - (usage?.calculations_used || 0)

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
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    // Get current usage
    const { data: usage, error: getError } = await supabase
      .from("user_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .single()

    if (getError && getError.code === "PGRST116") {
      // Create new usage record
      const { error: createError } = await supabase.from("user_usage").insert({
        user_id: userId,
        month: currentMonth,
        calculations_used: 1,
        last_calculation: new Date().toISOString(),
        last_reset: new Date().toISOString(),
      })

      if (createError) {
        console.error("Error creating usage record:", createError)
        return { success: false, error: createError.message }
      }
    } else if (getError) {
      console.error("Error getting usage record:", getError)
      return { success: false, error: getError.message }
    } else {
      // Update existing usage record
      const { error: updateError } = await supabase
        .from("user_usage")
        .update({
          calculations_used: (usage.calculations_used || 0) + 1,
          last_calculation: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("month", currentMonth)

      if (updateError) {
        console.error("Error updating usage record:", updateError)
        return { success: false, error: updateError.message }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Track usage error:", error)
    return { success: false, error: "Failed to track usage" }
  }
}

export async function getUserUsage(userId: string) {
  try {
    const supabase = await createClient()
    const currentMonth = new Date().toISOString().slice(0, 7)

    const { data: usage, error } = await supabase
      .from("user_usage")
      .select("*")
      .eq("user_id", userId)
      .eq("month", currentMonth)
      .single()

    if (error && error.code === "PGRST116") {
      // No usage record for this month
      return {
        success: true,
        data: {
          calculations_used: 0,
          month: currentMonth,
          last_calculation: null,
          last_reset: new Date().toISOString(),
        },
      }
    }

    if (error) {
      console.error("Error getting user usage:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data: usage }
  } catch (error) {
    console.error("Get user usage error:", error)
    return { success: false, error: "Failed to get usage data" }
  }
}

export async function resetMonthlyUsage() {
  try {
    const supabase = await createClient()
    const currentMonth = new Date().toISOString().slice(0, 7)

    // Reset all usage records for the current month
    const { error } = await supabase
      .from("user_usage")
      .update({
        calculations_used: 0,
        last_reset: new Date().toISOString(),
      })
      .eq("month", currentMonth)

    if (error) {
      console.error("Reset monthly usage error:", error)
      return { success: false, error: error.message }
    }

    return { success: true, message: "Monthly usage reset successfully" }
  } catch (error) {
    console.error("Reset monthly usage error:", error)
    return { success: false, error: "Failed to reset monthly usage" }
  }
}
