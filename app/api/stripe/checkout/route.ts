import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createSupabaseServiceClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: NextRequest) {
  try {
    const { priceId, mode = "subscription", userId } = await req.json()

    if (!priceId || !userId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const supabase = await createSupabaseServiceClient()

    // Get user information
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("email, stripe_customer_id")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let customerId = user.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: userId,
        },
      })

      customerId = customer.id

      // Update user with Stripe customer ID
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", userId)
    }

    // Create checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        userId: userId,
      },
    }

    // Add specific configuration for single report purchases
    if (mode === "payment") {
      sessionConfig.metadata.type = "single_report"
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("❌ Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
