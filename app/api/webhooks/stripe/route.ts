import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { createSupabaseServiceClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const sig = headersList.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    console.log("🔔 Received Stripe webhook:", event.type)

    const supabase = createSupabaseServiceClient()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("✅ Checkout session completed:", session.id)

        if (session.mode === "subscription") {
          // Handle subscription purchase
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string

          // Update user subscription status
          const { error } = await supabase
            .from("users")
            .update({
              subscription_type: "pro",
              subscription_status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId)

          if (error) {
            console.error("❌ Error updating user subscription:", error)
          } else {
            console.log("✅ User subscription updated to Pro")
          }
        } else if (session.mode === "payment") {
          // Handle single report purchase
          const customerId = session.customer as string
          const metadata = session.metadata

          if (metadata?.type === "single_report") {
            const { error } = await supabase
              .from("users")
              .update({
                single_reports_purchased: supabase.raw("single_reports_purchased + 1"),
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_customer_id", customerId)

            if (error) {
              console.error("❌ Error updating single report credits:", error)
            } else {
              console.log("✅ Single report credit added")
            }
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("🔄 Subscription updated:", subscription.id)

        const customerId = subscription.customer as string
        const status = subscription.status

        const { error } = await supabase
          .from("users")
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        if (error) {
          console.error("❌ Error updating subscription status:", error)
        } else {
          console.log("✅ Subscription status updated:", status)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("❌ Subscription cancelled:", subscription.id)

        const customerId = subscription.customer as string

        const { error } = await supabase
          .from("users")
          .update({
            subscription_type: "free",
            subscription_status: "cancelled",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        if (error) {
          console.error("❌ Error updating cancelled subscription:", error)
        } else {
          console.log("✅ Subscription cancelled and user downgraded to free")
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("💰 Payment succeeded:", invoice.id)

        if (invoice.subscription) {
          const customerId = invoice.customer as string

          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId)

          if (error) {
            console.error("❌ Error updating payment success:", error)
          } else {
            console.log("✅ Subscription payment confirmed")
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("❌ Payment failed:", invoice.id)

        if (invoice.subscription) {
          const customerId = invoice.customer as string

          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", customerId)

          if (error) {
            console.error("❌ Error updating payment failure:", error)
          } else {
            console.log("✅ Subscription marked as past due")
          }
        }
        break
      }

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
