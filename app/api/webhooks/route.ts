import { headers } from "next/headers"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

import { stripe } from "@/lib/stripe"
import { createSupabaseServiceClient } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string
  const supabase = createSupabaseServiceClient()

  let event: Stripe.Event

  try {
    event = stripe.events.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    if (!session?.metadata?.userId) {
      return new NextResponse("User ID not in session metadata", { status: 400 })
    }

    await supabase
      .from("users")
      .update({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        stripe_price_id: subscription.items.data[0].price.id,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000),
      })
      .eq("id", session.metadata.userId)
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

    await supabase
      .from("users")
      .update({
        stripe_price_id: subscription.items.data[0].price.id,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000),
      })
      .eq("stripe_subscription_id", subscription.id)
  }

  return new NextResponse(null, { status: 200 })
}
