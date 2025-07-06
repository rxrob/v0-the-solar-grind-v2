import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceSupabaseClient } from "@/lib/supabase"
import type Stripe from "stripe"

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = createServiceSupabaseClient()

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by customer ID
        const { data: user } = await supabase.from("users").select("id").eq("customer_id", customerId).single()

        if (user) {
          await supabase
            .from("users")
            .update({
              subscription_status: subscription.status,
              subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by customer ID
        const { data: user } = await supabase.from("users").select("id").eq("customer_id", customerId).single()

        if (user) {
          await supabase
            .from("users")
            .update({
              subscription_status: "canceled",
              subscription_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
        }
        break
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId && session.mode === "payment") {
          // Handle one-time payment (single report purchase)
          await supabase
            .from("users")
            .update({
              single_reports_purchased: supabase.raw("single_reports_purchased + 1"),
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
