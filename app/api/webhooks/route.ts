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
        const { data: user } = await supabase.from("users").select("id").eq("stripe_customer_id", customerId).single()

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
        const { data: user } = await supabase.from("users").select("id").eq("stripe_customer_id", customerId).single()

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
        const email = session.metadata?.email
        const purchaseType = session.metadata?.purchaseType

        if (purchaseType === "single_report" && (userId || email)) {
          // Handle single report purchase
          if (userId) {
            await supabase
              .from("users")
              .update({
                single_reports_purchased: supabase.raw("COALESCE(single_reports_purchased, 0) + 1"),
                updated_at: new Date().toISOString(),
              })
              .eq("id", userId)
          } else if (email) {
            // Create or update user record for email-only purchases
            const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

            if (existingUser) {
              await supabase
                .from("users")
                .update({
                  single_reports_purchased: supabase.raw("COALESCE(single_reports_purchased, 0) + 1"),
                  updated_at: new Date().toISOString(),
                })
                .eq("email", email)
            } else {
              await supabase.from("users").insert({
                email,
                account_type: "single_report",
                single_reports_purchased: 1,
                stripe_customer_id: session.customer as string,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
            }
          }
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
