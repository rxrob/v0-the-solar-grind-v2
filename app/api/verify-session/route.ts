import { NextResponse } from "next/server"
import Stripe from "stripe"

export const dynamic = "force-dynamic"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product", "subscription", "payment_intent"],
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const lineItem = session.line_items?.data[0]
    if (!lineItem || !lineItem.price || !lineItem.price.product) {
      return NextResponse.json({ error: "Could not determine purchased item" }, { status: 400 })
    }

    const product = lineItem.price.product as Stripe.Product
    const price = lineItem.price as Stripe.Price

    const purchaseType = product.metadata.purchase_type || (price.recurring ? "subscription" : "one-time")

    const planDetails = {
      type: purchaseType,
      features: product.metadata.features?.split(", ") || [],
      trial_days: price.recurring?.trial_period_days || 0,
    }

    const paymentFlow = {
      mode: session.mode,
      is_subscription: session.mode === "subscription",
      is_one_time: session.mode === "payment",
      has_trial: (price.recurring?.trial_period_days || 0) > 0,
    }

    const responseData: any = {
      plan: product.name,
      amount: lineItem.amount_total ? `$${(lineItem.amount_total / 100).toFixed(2)}` : "N/A",
      interval: price.recurring ? price.recurring.interval : "One-time",
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      customer_name: session.customer_details?.name,
      subscription_id: session.subscription ? (session.subscription as Stripe.Subscription).id : null,
      session_id: session.id,
      purchase_type: purchaseType,
      created: new Date(session.created * 1000).toISOString(),
      plan_details: planDetails,
      test_mode: session.livemode === false,
      payment_flow: paymentFlow,
    }

    if (session.subscription) {
      const sub = session.subscription as Stripe.Subscription
      responseData.subscription = {
        id: sub.id,
        status: sub.status,
        trial_start: sub.trial_start,
        trial_end: sub.trial_end,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
      }
    }

    if (session.payment_intent) {
      const pi = session.payment_intent as Stripe.PaymentIntent
      responseData.payment = {
        id: pi.id,
        status: pi.status,
        amount: pi.amount,
        currency: pi.currency,
        created: pi.created,
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to verify session", details: errorMessage }, { status: 500 })
  }
}
