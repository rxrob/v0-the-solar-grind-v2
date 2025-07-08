import { headers } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const sig = headersList.get("stripe-signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  console.log("✅ Stripe webhook received:", event.type, "ID:", event.id)

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const status = subscription.status

        console.log(`📝 Processing subscription ${event.type} for customer: ${customerId}`)

        // Find user by Stripe customer ID
        const { data: user, error: userError } = await supabaseAdmin
          .from("users")
          .select("id, email, subscription_type")
          .eq("stripe_customer_id", customerId)
          .single()

        if (userError || !user) {
          console.error("❌ User not found for customer:", customerId, userError)

          // Log the event anyway for debugging
          await supabaseAdmin.from("stripe_events").insert({
            event_id: event.id,
            event_type: event.type,
            processed_at: new Date().toISOString(),
            data: event.data.object,
            error: `User not found for customer: ${customerId}`,
          })

          break
        }

        // Update user subscription status
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            subscription_type: "pro",
            subscription_status: status,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("❌ Failed to update user subscription:", updateError)
        } else {
          console.log(`✅ Updated subscription for user: ${user.email} to status: ${status}`)
        }

        // Log successful upgrade
        await supabaseAdmin.from("audit_logs").insert({
          user_id: user.id,
          action: `subscription_${event.type.split(".").pop()}`,
          details: {
            subscription_id: subscription.id,
            status: status,
            customer_id: customerId,
          },
          timestamp: new Date().toISOString(),
        })

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log(`📝 Processing subscription cancellation for customer: ${customerId}`)

        // Find user and downgrade to free
        const { data: user, error: userError } = await supabaseAdmin
          .from("users")
          .select("id, email")
          .eq("stripe_customer_id", customerId)
          .single()

        if (userError || !user) {
          console.error("❌ User not found for customer:", customerId)
          break
        }

        // Downgrade to free tier
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            subscription_type: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("❌ Failed to downgrade user:", updateError)
        } else {
          console.log("✅ Downgraded user to free:", user.email)
        }

        // Log cancellation
        await supabaseAdmin.from("audit_logs").insert({
          user_id: user.id,
          action: "subscription_canceled",
          details: {
            subscription_id: subscription.id,
            customer_id: customerId,
            canceled_at: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        })

        break
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const metadata = session.metadata

        console.log(`📝 Processing checkout completion for customer: ${customerId}`)

        // Handle single report purchases
        if (session.mode === "payment" && metadata?.type === "single_report") {
          const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .select("id, email, single_reports_purchased")
            .eq("stripe_customer_id", customerId)
            .single()

          if (userError || !user) {
            console.error("❌ User not found for single report purchase:", customerId)
            break
          }

          // Increment single reports purchased
          const { error: updateError } = await supabaseAdmin
            .from("users")
            .update({
              single_reports_purchased: (user.single_reports_purchased || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)

          if (updateError) {
            console.error("❌ Failed to update single reports:", updateError)
          } else {
            console.log("✅ Added single report credit for user:", user.email)
          }

          // Log purchase
          await supabaseAdmin.from("audit_logs").insert({
            user_id: user.id,
            action: "single_report_purchased",
            details: {
              session_id: session.id,
              amount: session.amount_total,
              customer_id: customerId,
            },
            timestamp: new Date().toISOString(),
          })
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        console.log(`💰 Payment succeeded for customer: ${customerId}`)

        if (invoice.subscription) {
          // Update subscription status to active
          const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .select("id, email")
            .eq("stripe_customer_id", customerId)
            .single()

          if (user && !userError) {
            await supabaseAdmin
              .from("users")
              .update({
                subscription_status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id)

            console.log("✅ Subscription payment confirmed for:", user.email)
          }
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        console.log("❌ Payment failed for customer:", customerId)

        if (invoice.subscription) {
          // Update subscription status to past_due
          const { data: user, error: userError } = await supabaseAdmin
            .from("users")
            .select("id, email")
            .eq("stripe_customer_id", customerId)
            .single()

          if (user && !userError) {
            await supabaseAdmin
              .from("users")
              .update({
                subscription_status: "past_due",
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id)

            console.log("⚠️ Subscription marked as past due for:", user.email)

            // Log payment failure
            await supabaseAdmin.from("audit_logs").insert({
              user_id: user.id,
              action: "payment_failed",
              details: {
                invoice_id: invoice.id,
                amount: invoice.amount_due,
                customer_id: customerId,
              },
              timestamp: new Date().toISOString(),
            })
          }
        }
        break
      }

      default:
        console.log("ℹ️ Unhandled event type:", event.type)
    }

    // Log all events for audit purposes
    try {
      await supabaseAdmin.from("stripe_events").insert({
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
        data: event.data.object,
        status: "processed",
      })
    } catch (logError) {
      console.error("❌ Failed to log Stripe event:", logError)
      // Don't fail the webhook for logging errors
    }

    return NextResponse.json({ received: true, processed: true })
  } catch (error) {
    console.error("❌ Error processing webhook:", error)

    // Log the error
    try {
      await supabaseAdmin.from("stripe_events").insert({
        event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
        data: event.data.object,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } catch (logError) {
      console.error("❌ Failed to log error:", logError)
    }

    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
