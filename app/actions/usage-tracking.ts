"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface UsageTrackingResult {
  success: boolean
  error?: string
  data?: {
    calculationsUsed: number
    calculationsRemaining: number
    subscriptionType: string
    subscriptionStatus: string
  }
}

export async function trackCalculationUsage(): Promise<UsageTrackingResult> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

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

    // Get current user data
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("calculations_used, monthly_calculation_limit, subscription_type, subscription_status")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching user data:", fetchError)
      return {
        success: false,
        error: "Failed to fetch user data",
      }
    }

    const calculationsUsed = userData?.calculations_used || 0
    const monthlyLimit = userData?.monthly_calculation_limit || 3
    const subscriptionType = userData?.subscription_type || "free"
    const subscriptionStatus = userData?.subscription_status || "inactive"

    // Check if user has reached their limit
    if (calculationsUsed >= monthlyLimit && subscriptionType === "free") {
      return {
        success: false,
        error: "Monthly calculation limit reached. Upgrade to Pro for unlimited calculations.",
      }
    }

    // Increment usage count
    const { error: updateError } = await supabase
      .from("users")
      .update({
        calculations_used: calculationsUsed + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating usage count:", updateError)
      return {
        success: false,
        error: "Failed to update usage count",
      }
    }

    return {
      success: true,
      data: {
        calculationsUsed: calculationsUsed + 1,
        calculationsRemaining: Math.max(0, monthlyLimit - (calculationsUsed + 1)),
        subscriptionType,
        subscriptionStatus,
      },
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
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

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

    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("calculations_used, monthly_calculation_limit, subscription_type, subscription_status")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching user stats:", fetchError)
      return {
        success: false,
        error: "Failed to fetch user stats",
      }
    }

    const calculationsUsed = userData?.calculations_used || 0
    const monthlyLimit = userData?.monthly_calculation_limit || 3
    const subscriptionType = userData?.subscription_type || "free"
    const subscriptionStatus = userData?.subscription_status || "inactive"

    return {
      success: true,
      data: {
        calculationsUsed,
        calculationsRemaining: Math.max(0, monthlyLimit - calculationsUsed),
        subscriptionType,
        subscriptionStatus,
      },
    }
  } catch (error) {
    console.error("Error fetching usage stats:", error)
    return {
      success: false,
      error: "An error occurred while fetching usage stats",
    }
  }
}

export async function resetMonthlyUsage(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    // This would typically be called by a cron job or scheduled function
    // Reset all users' monthly calculation usage
    const { error } = await supabase
      .from("users")
      .update({
        calculations_used: 0,
        updated_at: new Date().toISOString(),
      })
      .neq("id", "00000000-0000-0000-0000-000000000000") // Update all users

    if (error) {
      console.error("Error resetting monthly usage:", error)
      return {
        success: false,
        error: "Failed to reset monthly usage",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error in resetMonthlyUsage:", error)
    return {
      success: false,
      error: "An error occurred while resetting monthly usage",
    }
  }
}

export async function checkCalculationLimit(): Promise<{
  success: boolean
  canCalculate: boolean
  error?: string
  data?: {
    calculationsUsed: number
    calculationsRemaining: number
    subscriptionType: string
  }
}> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        canCalculate: false,
        error: "User not authenticated",
      }
    }

    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("calculations_used, monthly_calculation_limit, subscription_type, subscription_status")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      console.error("Error checking calculation limit:", fetchError)
      return {
        success: false,
        canCalculate: false,
        error: "Failed to check calculation limit",
      }
    }

    const calculationsUsed = userData?.calculations_used || 0
    const monthlyLimit = userData?.monthly_calculation_limit || 3
    const subscriptionType = userData?.subscription_type || "free"
    const subscriptionStatus = userData?.subscription_status || "inactive"

    // Pro users have unlimited calculations
    const canCalculate =
      subscriptionType === "pro" && subscriptionStatus === "active" ? true : calculationsUsed < monthlyLimit

    return {
      success: true,
      canCalculate,
      data: {
        calculationsUsed,
        calculationsRemaining: Math.max(0, monthlyLimit - calculationsUsed),
        subscriptionType,
      },
    }
  } catch (error) {
    console.error("Error checking calculation limit:", error)
    return {
      success: false,
      canCalculate: false,
      error: "An error occurred while checking calculation limit",
    }
  }
}
