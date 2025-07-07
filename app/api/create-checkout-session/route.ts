import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST(req: Request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productType } = await req.json()

    let sessionConfig: Stripe.Checkout.SessionCreateParams

    if (productType === "single-report") {
      sessionConfig = {
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price: process.env.STRIPE_SINGLE_REPORT_PRICE_ID!,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
        metadata: {
          user_id: user.id,
          product_type: "single-report",
        },
      }
    } else {
      // Pro subscription
      sessionConfig = {
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
        metadata: {
          user_id: user.id,
          product_type: "pro-subscription",
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout session error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
