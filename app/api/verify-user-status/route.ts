import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("user_id")

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const supabase = createClient()

    const { data: user, error } = await supabase
      .from("users")
      .select("subscription_tier, subscription_status")
      .eq("id", userId)
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        subscriptionTier: user.subscription_tier,
        subscriptionStatus: user.subscription_status,
        isPro: user.subscription_tier === "pro" && user.subscription_status === "active",
      },
    })
  } catch (error) {
    console.error("User status verification error:", error)
    return NextResponse.json({ error: "Failed to verify user status" }, { status: 500 })
  }
}
