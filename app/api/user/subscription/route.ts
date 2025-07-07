import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      subscriptionType: user.subscription_type,
      subscriptionStatus: user.subscription_status,
      singleReportsPurchased: user.single_reports_purchased,
      singleReportsUsed: user.single_reports_used,
      remainingReports: user.single_reports_purchased - user.single_reports_used,
      canUseAdvancedFeatures:
        user.subscription_type === "pro" || user.single_reports_purchased - user.single_reports_used > 0,
    })
  } catch (error) {
    console.error("❌ Subscription status error:", error)
    return NextResponse.json({ error: "Failed to get subscription status" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, action } = await req.json()

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    if (action === "use_report") {
      // Increment single reports used
      const { error } = await supabase
        .from("users")
        .update({
          single_reports_used: supabase.raw("single_reports_used + 1"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) {
        console.error("❌ Error updating report usage:", error)
        return NextResponse.json({ error: "Failed to update report usage" }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: "Report usage updated" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("❌ Subscription update error:", error)
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 })
  }
}
