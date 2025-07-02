import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log("[WEBHOOK] 🎣 === STRIPE WEBHOOK RECEIVED ===")

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.error("[WEBHOOK] ❌ No Stripe signature found")
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    if (!webhookSecret) {
      console.error("[WEBHOOK] ❌ No webhook secret configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log(`[WEBHOOK] ✅ Verified event: ${event.type}`)
    } catch (err: any) {
      console.error(`[WEBHOOK] ❌ Webhook signature verification failed: ${err.message}`)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createServerSupabaseClient()

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[WEBHOOK] 💳 Checkout completed: ${session.id}`)
        console.log(`[WEBHOOK]    - Customer: ${session.customer}`)
        console.log(`[WEBHOOK]    - Amount: ${session.amount_total} ${session.currency}`)
        console.log(`[WEBHOOK]    - Mode: ${session.mode}`)

        // Extract metadata
        const metadata = session.metadata || {}
        const purchaseType = metadata.purchaseType || "unknown"
        const environment = metadata.environment || "unknown"
        const userId = metadata.userId

        console.log(`[WEBHOOK]    - Purchase Type: ${purchaseType}`)
        console.log(`[WEBHOOK]    - Environment: ${environment}`)
        console.log(`[WEBHOOK]    - User ID: ${userId || "none"}`)

        // Log the purchase
        try {
          const { error: insertError } = await supabase.from("purchases").insert({
            stripe_session_id: session.id,
            stripe_customer_id: session.customer as string,
            purchase_type: purchaseType,
            amount: session.amount_total || 0,
            currency: session.currency || "usd",
            status: "completed",
            environment: environment,
            user_id: userId || null,
            metadata: metadata,
          })

          if (insertError) {
            console.error("[WEBHOOK] ❌ Failed to log purchase:", insertError)
          } else {
            console.log("[WEBHOOK] ✅ Purchase logged successfully")
          }
        } catch (error) {
          console.error("[WEBHOOK] ❌ Error logging purchase:", error)
        }

        // Handle subscription setup
        if (session.mode === "subscription" && session.subscription) {
          console.log(`[WEBHOOK] 🔄 Setting up subscription: ${session.subscription}`)

          try {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
            console.log(`[WEBHOOK]    - Subscription Status: ${subscription.status}`)
            console.log(`[WEBHOOK]    - Current Period End: ${new Date(subscription.current_period_end * 1000)}`)

            // Update user subscription status
            if (userId) {
              const { error: updateError } = await supabase
                .from("users")
                .update({
                  subscription_status: subscription.status,
                  subscription_id: subscription.id,
                  stripe_customer_id: session.customer as string,
                  subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", userId)

              if (updateError) {
                console.error("[WEBHOOK] ❌ Failed to update user subscription:", updateError)
              } else {
                console.log("[WEBHOOK] ✅ User subscription updated")
              }
            }
          } catch (error) {
            console.error("[WEBHOOK] ❌ Error handling subscription:", error)
          }
        }

        break
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[WEBHOOK] 🆕 Subscription created: ${subscription.id}`)
        console.log(`[WEBHOOK]    - Customer: ${subscription.customer}`)
        console.log(`[WEBHOOK]    - Status: ${subscription.status}`)

        // Update user subscription status
        try {
          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: subscription.status,
              subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_customer_id", subscription.customer)

          if (error) {
            console.error("[WEBHOOK] ❌ Failed to update subscription:", error)
          } else {
            console.log("[WEBHOOK] ✅ Subscription status updated")
          }
        } catch (error) {
          console.error("[WEBHOOK] ❌ Error updating subscription:", error)
        }

        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[WEBHOOK] 🔄 Subscription updated: ${subscription.id}`)
        console.log(`[WEBHOOK]    - Status: ${subscription.status}`)

        try {
          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: subscription.status,
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("subscription_id", subscription.id)

          if (error) {
            console.error("[WEBHOOK] ❌ Failed to update subscription:", error)
          } else {
            console.log("[WEBHOOK] ✅ Subscription updated")
          }
        } catch (error) {
          console.error("[WEBHOOK] ❌ Error updating subscription:", error)
        }

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`[WEBHOOK] ❌ Subscription cancelled: ${subscription.id}`)

        try {
          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: "cancelled",
              subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("subscription_id", subscription.id)

          if (error) {
            console.error("[WEBHOOK] ❌ Failed to cancel subscription:", error)
          } else {
            console.log("[WEBHOOK] ✅ Subscription cancelled")
          }
        } catch (error) {
          console.error("[WEBHOOK] ❌ Error cancelling subscription:", error)
        }

        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[WEBHOOK] 💰 Payment succeeded: ${invoice.id}`)
        console.log(`[WEBHOOK]    - Amount: ${invoice.amount_paid} ${invoice.currency}`)

        // Log successful payment
        try {
          const { error } = await supabase.from("payments").insert({
            stripe_invoice_id: invoice.id,
            stripe_customer_id: invoice.customer as string,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "succeeded",
            created_at: new Date().toISOString(),
          })

          if (error) {
            console.error("[WEBHOOK] ❌ Failed to log payment:", error)
          } else {
            console.log("[WEBHOOK] ✅ Payment logged")
          }
        } catch (error) {
          console.error("[WEBHOOK] ❌ Error logging payment:", error)
        }

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log(`[WEBHOOK] ❌ Payment failed: ${invoice.id}`)

        // Update subscription status if payment failed
        if (invoice.subscription) {
          try {
            const { error } = await supabase
              .from("users")
              .update({
                subscription_status: "past_due",
                updated_at: new Date().toISOString(),
              })
              .eq("subscription_id", invoice.subscription)

            if (error) {
              console.error("[WEBHOOK] ❌ Failed to update failed payment status:", error)
            } else {
              console.log("[WEBHOOK] ✅ Updated subscription to past_due")
            }
          } catch (error) {
            console.error("[WEBHOOK] ❌ Error updating failed payment:", error)
          }
        }

        break
      }

      default:
        console.log(`[WEBHOOK] ℹ️ Unhandled event type: ${event.type}`)
    }

    console.log("[WEBHOOK] ✅ === WEBHOOK PROCESSED SUCCESSFULLY ===")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[WEBHOOK] ❌ === WEBHOOK ERROR ===")
    console.error("[WEBHOOK] Error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
