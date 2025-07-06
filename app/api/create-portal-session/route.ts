import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get user details
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("customer_id")
      .eq("id", userId)
      .single()

    if (userError || !user || !user.customer_id) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.customer_id,
      return_url: absoluteUrl("/dashboard"),
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Portal session creation error:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
