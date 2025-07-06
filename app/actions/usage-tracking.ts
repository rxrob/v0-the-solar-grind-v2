"use server"

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface UsageTrackingResult {
  success: boolean
  error?: string
  data?: any
}

export async function trackCalculationUsage(calculationType: "basic" | "advanced"): Promise<UsageTrackingResult> {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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
      .select("calculations_used, subscription_type, subscription_status")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching user data:", fetchError)
      return {
        success: false,
        error: "Error fetching user data",
      }
    }

    // Check usage limits
    const currentUsage = userData?.calculations_used || 0
    const isProUser = userData?.subscription_type === "pro" && userData?.subscription_status === "active"

    if (!isProUser && calculationType === "advanced") {
      return {
        success: false,
        error: "Pro subscription required for advanced calculations",
      }
    }

    if (!isProUser && currentUsage >= 5) {
      // Free users limited to 5 calculations
      return {
        success: false,
        error: "Free usage limit reached. Upgrade to Pro for unlimited calculations.",
      }
    }

    // Increment usage counter
    const { error: updateError } = await supabase
      .from("users")
      .update({
        calculations_used: currentUsage + 1,
        last_calculation_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating usage:", updateError)
      return {
        success: false,
        error: "Error updating usage counter",
      }
    }

    return {
      success: true,
      data: {
        calculationsUsed: currentUsage + 1,
        isProUser,
        remainingCalculations: isProUser ? "unlimited" : Math.max(0, 5 - (currentUsage + 1)),
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
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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

    // Get user usage data
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("calculations_used, subscription_type, subscription_status, last_calculation_at, created_at")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching user usage stats:", fetchError)
      return {
        success: false,
        error: "Error fetching usage statistics",
      }
    }

    // Get calculation history count
    const { count: totalCalculations, error: countError } = await supabase
      .from("solar_calculations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (countError) {
      console.error("Error counting calculations:", countError)
    }

    const isProUser = userData?.subscription_type === "pro" && userData?.subscription_status === "active"
    const calculationsUsed = userData?.calculations_used || 0
    const remainingCalculations = isProUser ? "unlimited" : Math.max(0, 5 - calculationsUsed)

    return {
      success: true,
      data: {
        calculationsUsed,
        totalCalculations: totalCalculations || 0,
        remainingCalculations,
        isProUser,
        subscriptionType: userData?.subscription_type || "free",
        subscriptionStatus: userData?.subscription_status || "inactive",
        lastCalculationAt: userData?.last_calculation_at,
        memberSince: userData?.created_at,
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

export async function resetMonthlyUsage(): Promise<UsageTrackingResult> {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // This would typically be called by a cron job or scheduled function
    // Reset calculations_used for all free users at the beginning of each month
    const { error } = await supabase
      .from("users")
      .update({
        calculations_used: 0,
        usage_reset_at: new Date().toISOString(),
      })
      .eq("subscription_type", "free")

    if (error) {
      console.error("Error resetting monthly usage:", error)
      return {
        success: false,
        error: "Error resetting monthly usage",
      }
    }

    return {
      success: true,
      data: {
        message: "Monthly usage reset successfully",
      },
    }
  } catch (error) {
    console.error("Error resetting monthly usage:", error)
    return {
      success: false,
      error: "An error occurred while resetting monthly usage",
    }
  }
}

export async function trackReportGeneration(reportType: "basic" | "advanced" | "single"): Promise<UsageTrackingResult> {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

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
      .select("reports_generated, subscription_type, subscription_status")
      .eq("id", user.id)
      .single()

    if (fetchError) {
      console.error("Error fetching user data:", fetchError)
      return {
        success: false,
        error: "Error fetching user data",
      }
    }

    const isProUser = userData?.subscription_type === "pro" && userData?.subscription_status === "active"
    const currentReports = userData?.reports_generated || 0

    // Check if user can generate reports
    if (reportType === "advanced" && !isProUser) {
      return {
        success: false,
        error: "Pro subscription required for advanced reports",
      }
    }

    if (reportType === "basic" && !isProUser && currentReports >= 2) {
      return {
        success: false,
        error: "Free users limited to 2 basic reports per month",
      }
    }

    // Increment report counter
    const { error: updateError } = await supabase
      .from("users")
      .update({
        reports_generated: currentReports + 1,
        last_report_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating report usage:", updateError)
      return {
        success: false,
        error: "Error updating report counter",
      }
    }

    return {
      success: true,
      data: {
        reportsGenerated: currentReports + 1,
        isProUser,
        reportType,
      },
    }
  } catch (error) {
    console.error("Report tracking error:", error)
    return {
      success: false,
      error: "An error occurred while tracking report generation",
    }
  }
}
