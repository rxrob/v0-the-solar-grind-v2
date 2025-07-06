import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log(`🔔 Received webhook: ${event.type}`)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCreated(subscription)
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`🤷‍♀️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log("🛒 Processing checkout session completed:", session.id)

    const customerEmail = session.customer_email
    const customerId = session.customer as string
    const metadata = session.metadata || {}

    // Handle subscription checkout
    if (session.mode === "subscription") {
      if (customerEmail) {
        const { data: user, error } = await supabase.from("users").select("*").eq("email", customerEmail).single()

        if (error) {
          console.error("❌ Error finding user by email:", error)
          return
        }

        if (user) {
          const { error: updateError } = await supabase
            .from("users")
            .update({
              subscription_type: "pro",
              stripe_customer_id: customerId,
              subscription_status: "active",
            })
            .eq("id", user.id)

          if (updateError) {
            console.error("❌ Error updating user subscription:", updateError)
          } else {
            console.log(`✅ Upgraded user ${customerEmail} to PRO subscription`)
          }
        }
      }
    }

    // Handle single report purchase
    if (session.mode === "payment") {
      const userId = metadata.user_id
      const reportType = metadata.report_type || "single_report"

      if (userId) {
        const { data: user, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) {
          console.error("❌ Error finding user by ID:", error)
          return
        }

        if (user) {
          const currentReports = user.single_reports_purchased || 0
          const { error: updateError } = await supabase
            .from("users")
            .update({
              single_reports_purchased: currentReports + 1,
              stripe_customer_id: customerId,
            })
            .eq("id", userId)

          if (updateError) {
            console.error("❌ Error updating user single reports:", updateError)
          } else {
            console.log(`✅ Added single report to user ${userId}`)
          }
        }
      } else if (customerEmail) {
        // Fallback to email-based lookup for legacy purchases
        const { data: user, error } = await supabase.from("users").select("*").eq("email", customerEmail).single()

        if (error) {
          console.error("❌ Error finding user by email:", error)
          return
        }

        if (user) {
          const currentReports = user.single_reports_purchased || 0
          const { error: updateError } = await supabase
            .from("users")
            .update({
              single_reports_purchased: currentReports + 1,
              stripe_customer_id: customerId,
            })
            .eq("id", user.id)

          if (updateError) {
            console.error("❌ Error updating user single reports:", updateError)
          } else {
            console.log(`✅ Added single report to user ${customerEmail}`)
          }
        }
      }
    }
  } catch (error) {
    console.error("❌ Error handling checkout session completed:", error)
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log("📝 Processing subscription created:", subscription.id)

    const customerId = subscription.customer as string
    const customer = await stripe.customers.retrieve(customerId)

    if (customer.deleted) {
      console.error("❌ Customer was deleted")
      return
    }

    const customerEmail = customer.email

    if (customerEmail) {
      const { data: user, error } = await supabase.from("users").select("*").eq("email", customerEmail).single()

      if (error) {
        console.error("❌ Error finding user by email:", error)
        return
      }

      if (user) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            subscription_type: "pro",
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("❌ Error updating user subscription:", updateError)
        } else {
          console.log(`✅ Created subscription for user ${customerEmail}`)
        }
      }
    }
  } catch (error) {
    console.error("❌ Error handling subscription created:", error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log("🔄 Processing subscription updated:", subscription.id)

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("stripe_subscription_id", subscription.id)
      .single()

    if (error) {
      console.error("❌ Error finding user by subscription ID:", error)
      return
    }

    if (user) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("❌ Error updating user subscription:", updateError)
      } else {
        console.log(`✅ Updated subscription for user ${user.email}`)
      }
    }
  } catch (error) {
    console.error("❌ Error handling subscription updated:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log("🗑️ Processing subscription deleted:", subscription.id)

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("stripe_subscription_id", subscription.id)
      .single()

    if (error) {
      console.error("❌ Error finding user by subscription ID:", error)
      return
    }

    if (user) {
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_type: "free",
          subscription_status: "canceled",
          stripe_subscription_id: null,
          current_period_end: null,
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("❌ Error updating user subscription:", updateError)
      } else {
        console.log(`✅ Canceled subscription for user ${user.email}`)
      }
    }
  } catch (error) {
    console.error("❌ Error handling subscription deleted:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log("💰 Processing invoice payment succeeded:", invoice.id)

    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    if (subscriptionId) {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("stripe_subscription_id", subscriptionId)
        .single()

      if (error) {
        console.error("❌ Error finding user by subscription ID:", error)
        return
      }

      if (user) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            subscription_status: "active",
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("❌ Error updating user subscription status:", updateError)
        } else {
          console.log(`✅ Payment succeeded for user ${user.email}`)
        }
      }
    }
  } catch (error) {
    console.error("❌ Error handling invoice payment succeeded:", error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log("❌ Processing invoice payment failed:", invoice.id)

    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    if (subscriptionId) {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("stripe_subscription_id", subscriptionId)
        .single()

      if (error) {
        console.error("❌ Error finding user by subscription ID:", error)
        return
      }

      if (user) {
        const { error: updateError } = await supabase
          .from("users")
          .update({
            subscription_status: "past_due",
          })
          .eq("id", user.id)

        if (updateError) {
          console.error("❌ Error updating user subscription status:", updateError)
        } else {
          console.log(`⚠️ Payment failed for user ${user.email}`)
        }
      }
    }
  } catch (error) {
    console.error("❌ Error handling invoice payment failed:", error)
  }
}
