import { headers } from "next/headers"
import Stripe from "stripe"
import { createServiceSupabaseClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const headersList = await headers()
    const sig = headersList.get("stripe-signature") as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    console.log("✅ Received webhook event:", event.type)

    const supabase = createServiceSupabaseClient()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("💳 Processing checkout session:", session.id)

        const userEmail = session.customer_email
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        const metadata = session.metadata

        if (!userEmail) {
          console.error("❌ No customer email in session")
          break
        }

        // Find user by email
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id, subscription_type")
          .eq("email", userEmail)
          .maybeSingle()

        if (userError) {
          console.error("❌ Error finding user:", userError)
          break
        }

        if (!user) {
          console.error("❌ User not found for email:", userEmail)
          break
        }

        // Check if this is a Pro subscription or single report purchase
        if (subscriptionId) {
          // Pro subscription
          const { error: updateError } = await supabase
            .from("users")
            .update({
              subscription_type: "pro",
              subscription_status: "active",
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

          if (updateError) {
            console.error("❌ Error updating user subscription:", updateError)
          } else {
            console.log("✅ User upgraded to Pro:", user.id)
          }
        } else if (metadata?.product_type === "single_report") {
          // Single report purchase
          const reportsToAdd = Number.parseInt(metadata.quantity || "1", 10)

          // Use raw SQL to increment the counter
          const { error: updateError } = await supabase.rpc("increment_reports", {
            user_id: user.id,
            increment_amount: reportsToAdd,
          })

          if (updateError) {
            console.error("❌ Error adding report credits:", updateError)
            // Fallback to regular update
            const { data: currentUser } = await supabase
              .from("users")
              .select("single_reports_purchased")
              .eq("id", user.id)
              .single()

            if (currentUser) {
              await supabase
                .from("users")
                .update({
                  single_reports_purchased: (currentUser.single_reports_purchased || 0) + reportsToAdd,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", user.id)
            }
          } else {
            console.log(`✅ Added ${reportsToAdd} report credits to user:`, user.id)
          }
        }
        break
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("🔄 Subscription created:", subscription.id)

        const customerId = subscription.customer as string

        const { error } = await supabase
          .from("users")
          .update({
            subscription_type: "pro",
            subscription_status: "active",
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        if (error) {
          console.error("❌ Error updating subscription:", error)
        } else {
          console.log("✅ Subscription activated for customer:", customerId)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("🔄 Subscription updated:", subscription.id)

        const status =
          subscription.status === "active"
            ? "active"
            : subscription.status === "canceled"
              ? "canceled"
              : subscription.status === "past_due"
                ? "past_due"
                : "inactive"

        const { error } = await supabase
          .from("users")
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (error) {
          console.error("❌ Error updating subscription status:", error)
        } else {
          console.log("✅ Subscription status updated:", status)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("❌ Subscription canceled:", subscription.id)

        const { error } = await supabase
          .from("users")
          .update({
            subscription_type: "free",
            subscription_status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)

        if (error) {
          console.error("❌ Error canceling subscription:", error)
        } else {
          console.log("✅ Subscription canceled for:", subscription.id)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("💰 Payment succeeded for invoice:", invoice.id)

        if (invoice.subscription) {
          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: "active",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription)

          if (error) {
            console.error("❌ Error reactivating subscription:", error)
          } else {
            console.log("✅ Subscription reactivated after payment")
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("💸 Payment failed for invoice:", invoice.id)

        if (invoice.subscription) {
          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: "past_due",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_subscription_id", invoice.subscription)

          if (error) {
            console.error("❌ Error marking subscription past due:", error)
          } else {
            console.log("⚠️ Subscription marked as past due")
          }
        }
        break
      }

      default:
        console.log("ℹ️ Unhandled event type:", event.type)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("❌ Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
