"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface UsageTrackingResult {
  success: boolean
  error?: string
  calculationsUsed?: number
  calculationsRemaining?: number
  canUseFeature?: boolean
}

export async function trackCalculationUsage(userId: string, calculationType: string): Promise<UsageTrackingResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Get current user data
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      return { success: false, error: userError.message }
    }

    if (!userData) {
      return { success: false, error: "User not found" }
    }

    // Check if user can use this feature
    const isPro = userData.subscription_type === "pro" && userData.subscription_status === "active"
    const hasTrialAccess = !userData.pro_trial_used && calculationType === "advanced"
    const hasCalculationsLeft = userData.calculations_used < userData.monthly_calculation_limit

    if (!isPro && !hasTrialAccess && !hasCalculationsLeft) {
      return {
        success: false,
        error: "Calculation limit reached",
        calculationsUsed: userData.calculations_used,
        calculationsRemaining: userData.monthly_calculation_limit - userData.calculations_used,
        canUseFeature: false,
      }
    }

    // Update usage tracking
    const updates: any = {}

    if (!isPro) {
      if (calculationType === "advanced" && !userData.pro_trial_used) {
        updates.pro_trial_used = true
      } else {
        updates.calculations_used = userData.calculations_used + 1
      }
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString()

      const { error: updateError } = await supabase.from("users").update(updates).eq("id", userId)

      if (updateError) {
        return { success: false, error: updateError.message }
      }
    }

    return {
      success: true,
      calculationsUsed: updates.calculations_used || userData.calculations_used,
      calculationsRemaining:
        userData.monthly_calculation_limit - (updates.calculations_used || userData.calculations_used),
      canUseFeature: true,
    }
  } catch (error) {
    console.error("Error tracking usage:", error)
    return { success: false, error: "Failed to track usage" }
  }
}

export async function getUserUsageStats(userId: string): Promise<UsageTrackingResult & { userData?: any }> {
  try {
    const cookieStore = await cookies()
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

    const { data: userData, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (!userData) {
      return { success: false, error: "User not found" }
    }

    return {
      success: true,
      calculationsUsed: userData.calculations_used,
      calculationsRemaining: userData.monthly_calculation_limit - userData.calculations_used,
      canUseFeature:
        userData.subscription_type === "pro" || userData.calculations_used < userData.monthly_calculation_limit,
      userData,
    }
  } catch (error) {
    console.error("Error getting usage stats:", error)
    return { success: false, error: "Failed to get usage stats" }
  }
}

export async function resetMonthlyUsage(userId: string): Promise<UsageTrackingResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    const { error } = await supabase
      .from("users")
      .update({
        calculations_used: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, calculationsUsed: 0 }
  } catch (error) {
    console.error("Error resetting usage:", error)
    return { success: false, error: "Failed to reset usage" }
  }
}

export async function upgradeToProTrial(userId: string): Promise<UsageTrackingResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    // Check if user has already used trial
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("pro_trial_used")
      .eq("id", userId)
      .single()

    if (userError) {
      return { success: false, error: userError.message }
    }

    if (userData?.pro_trial_used) {
      return { success: false, error: "Pro trial already used" }
    }

    const { error } = await supabase
      .from("users")
      .update({
        subscription_type: "pro",
        subscription_status: "trial",
        pro_trial_used: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, canUseFeature: true }
  } catch (error) {
    console.error("Error upgrading to pro trial:", error)
    return { success: false, error: "Failed to upgrade to pro trial" }
  }
}
