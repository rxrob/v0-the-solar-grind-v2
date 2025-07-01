import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log("🎯 === WEBHOOK RECEIVED ===")

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    console.log("📋 Webhook Details:")
    console.log("   - Body length:", body.length)
    console.log("   - Signature present:", !!signature)
    console.log("   - Webhook secret configured:", !!webhookSecret)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log("✅ Webhook signature verified")
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
    }

    console.log("🔔 Event Type:", event.type)
    console.log("🆔 Event ID:", event.id)

    const supabase = createClient()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("💳 Checkout Session Completed:")
        console.log("   - Session ID:", session.id)
        console.log("   - Customer Email:", session.customer_details?.email)
        console.log("   - Amount Total:", session.amount_total)
        console.log("   - Payment Status:", session.payment_status)
        console.log("   - Mode:", session.mode)

        if (session.payment_status === "paid") {
          const customerEmail = session.customer_details?.email
          const metadata = session.metadata || {}

          console.log("📦 Session Metadata:", metadata)

          if (customerEmail) {
            try {
              // Handle single report purchase
              if (metadata.purchaseType === "single_report" || session.mode === "payment") {
                console.log("📄 Processing single report purchase...")

                // Update user's single report access
                const { error: updateError } = await supabase.from("users").upsert(
                  {
                    email: customerEmail,
                    name: session.customer_details?.name || customerEmail,
                    account_type: "free",
                    subscription_status: "active",
                    subscription_plan: "free",
                    stripe_customer_id: session.customer as string,
                    updated_at: new Date().toISOString(),
                  },
                  {
                    onConflict: "email",
                    ignoreDuplicates: false,
                  },
                )

                if (updateError) {
                  console.error("❌ Error updating user for single report:", updateError)
                } else {
                  console.log("✅ User updated for single report purchase")
                }

                // Track the single report purchase
                const { error: trackError } = await supabase.from("usage_tracking").insert({
                  user_email: customerEmail,
                  calculation_type: "single_report_purchase",
                  created_at: new Date().toISOString(),
                })

                if (trackError) {
                  console.error("❌ Error tracking single report purchase:", trackError)
                } else {
                  console.log("✅ Single report purchase tracked")
                }
              }

              // Handle subscription
              if (session.mode === "subscription") {
                console.log("🔄 Processing subscription...")

                const { error: subError } = await supabase.from("users").upsert(
                  {
                    email: customerEmail,
                    name: session.customer_details?.name || customerEmail,
                    account_type: "pro",
                    subscription_status: "active",
                    subscription_plan: "pro",
                    stripe_customer_id: session.customer as string,
                    stripe_subscription_id: session.subscription as string,
                    monthly_calculation_limit: 100,
                    updated_at: new Date().toISOString(),
                  },
                  {
                    onConflict: "email",
                    ignoreDuplicates: false,
                  },
                )

                if (subError) {
                  console.error("❌ Error updating user for subscription:", subError)
                } else {
                  console.log("✅ User upgraded to pro subscription")
                }
              }
            } catch (dbError) {
              console.error("❌ Database operation failed:", dbError)
            }
          } else {
            console.warn("⚠️ No customer email found in session")
          }
        } else {
          console.log("⏳ Payment not completed yet, status:", session.payment_status)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("🔄 Subscription Updated:")
        console.log("   - Subscription ID:", subscription.id)
        console.log("   - Status:", subscription.status)
        console.log("   - Customer:", subscription.customer)

        try {
          // Get customer email
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          const customerEmail = (customer as Stripe.Customer).email

          if (customerEmail) {
            const { error } = await supabase
              .from("users")
              .update({
                subscription_status: subscription.status === "active" ? "active" : "inactive",
                account_type: subscription.status === "active" ? "pro" : "free",
                monthly_calculation_limit: subscription.status === "active" ? 100 : 10,
                updated_at: new Date().toISOString(),
              })
              .eq("email", customerEmail)

            if (error) {
              console.error("❌ Error updating subscription status:", error)
            } else {
              console.log("✅ Subscription status updated")
            }
          }
        } catch (error) {
          console.error("❌ Error processing subscription update:", error)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("❌ Subscription Cancelled:")
        console.log("   - Subscription ID:", subscription.id)
        console.log("   - Customer:", subscription.customer)

        try {
          // Get customer email
          const customer = await stripe.customers.retrieve(subscription.customer as string)
          const customerEmail = (customer as Stripe.Customer).email

          if (customerEmail) {
            const { error } = await supabase
              .from("users")
              .update({
                subscription_status: "cancelled",
                account_type: "free",
                monthly_calculation_limit: 10,
                updated_at: new Date().toISOString(),
              })
              .eq("email", customerEmail)

            if (error) {
              console.error("❌ Error cancelling subscription:", error)
            } else {
              console.log("✅ Subscription cancelled in database")
            }
          }
        } catch (error) {
          console.error("❌ Error processing subscription cancellation:", error)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("💰 Invoice Payment Succeeded:")
        console.log("   - Invoice ID:", invoice.id)
        console.log("   - Customer:", invoice.customer)
        console.log("   - Amount Paid:", invoice.amount_paid)

        // Additional processing for successful payments can be added here
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("💸 Invoice Payment Failed:")
        console.log("   - Invoice ID:", invoice.id)
        console.log("   - Customer:", invoice.customer)

        try {
          // Get customer email and update status
          const customer = await stripe.customers.retrieve(invoice.customer as string)
          const customerEmail = (customer as Stripe.Customer).email

          if (customerEmail) {
            const { error } = await supabase
              .from("users")
              .update({
                subscription_status: "past_due",
                updated_at: new Date().toISOString(),
              })
              .eq("email", customerEmail)

            if (error) {
              console.error("❌ Error updating payment failed status:", error)
            } else {
              console.log("✅ Payment failed status updated")
            }
          }
        } catch (error) {
          console.error("❌ Error processing payment failure:", error)
        }
        break
      }

      default:
        console.log(`🤷 Unhandled event type: ${event.type}`)
    }

    console.log("✅ === WEBHOOK PROCESSED SUCCESSFULLY ===")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ === WEBHOOK ERROR ===")
    console.error("Error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
