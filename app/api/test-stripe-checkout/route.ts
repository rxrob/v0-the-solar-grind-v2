import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const { priceId, customerEmail } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: absoluteUrl("/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: absoluteUrl("/pricing"),
      customer_email: customerEmail,
      metadata: {
        test_checkout: "true",
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      success: true,
    })
  } catch (error) {
    console.error("Test checkout error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create checkout session",
        success: false,
      },
      { status: 500 },
    )
  }
}
