"use server"

import { createClient } from "@/lib/supabase"

export async function trackUsage(userId: string, action: string, metadata?: any) {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("usage_logs").insert({
      user_id: userId,
      action,
      metadata,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Usage tracking error:", error)
    }
  } catch (error) {
    console.error("Usage tracking error:", error)
  }
}

export async function getUserUsage(userId: string, timeframe: "day" | "week" | "month" = "month") {
  try {
    const supabase = createClient()

    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
    }

    const { data, error } = await supabase
      .from("usage_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Get usage error:", error)
    return []
  }
}
