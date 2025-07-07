import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createSupabaseServiceClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()

    // Get user's Stripe customer ID
    const { data: user, error } = await supabase
      .from("users")
      .select("stripe_customer_id, subscription_type")
      .eq("id", userId)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!user.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 })
    }

    if (user.subscription_type !== "pro") {
      return NextResponse.json({ error: "Only Pro users can access billing portal" }, { status: 403 })
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("❌ Billing portal error:", error)
    return NextResponse.json({ error: "Failed to create billing portal session" }, { status: 500 })
  }
}
