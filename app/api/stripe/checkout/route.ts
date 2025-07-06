import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const { email, type, userId } = await req.json()

    if (!email || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const priceId =
      type === "pro"
        ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
        : process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID

    if (!priceId) {
      return NextResponse.json({ error: "Price ID not configured" }, { status: 500 })
    }

    const sessionParams: any = {
      payment_method_types: ["card"],
      mode: type === "pro" ? "subscription" : "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: absoluteUrl("/dashboard?success=true"),
      cancel_url: absoluteUrl("/dashboard?canceled=true"),
    }

    // Add metadata for single report purchases
    if (type === "single_report" && userId) {
      sessionParams.metadata = {
        user_id: userId,
        report_type: "single_report",
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout session error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
