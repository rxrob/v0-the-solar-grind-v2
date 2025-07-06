import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { updateUserByEmail, getUserByEmail } from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
})

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
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
    }

    console.log("✅ Webhook received:", event.type)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        console.log("💳 Checkout session completed:", session.id)

        // Handle both subscription and one-time payments
        if (session.mode === "subscription") {
          await handleSubscriptionCreated(session)
        } else if (session.mode === "payment") {
          await handleOneTimePayment(session)
        }
        break
      }

      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("🔄 Subscription created:", subscription.id)
        await handleSubscriptionUpdate(subscription, "created")
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("🔄 Subscription updated:", subscription.id)
        await handleSubscriptionUpdate(subscription, "updated")
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        console.log("❌ Subscription deleted:", subscription.id)
        await handleSubscriptionCanceled(subscription)
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("💰 Invoice payment succeeded:", invoice.id)
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        console.log("❌ Invoice payment failed:", invoice.id)
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        console.log(`🤷‍♂️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("❌ Webhook handler error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  try {
    const customerEmail = session.customer_email
    const customerId = session.customer as string

    if (!customerEmail) {
      console.error("❌ No customer email in session")
      return
    }

    // Update user subscription status
    const user = await updateUserByEmail(customerEmail, {
      subscription_type: "pro",
      stripe_customer_id: customerId,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })

    if (user) {
      console.log("✅ User upgraded to Pro:", customerEmail)
    } else {
      console.error("❌ Failed to update user subscription:", customerEmail)
    }
  } catch (error) {
    console.error("❌ Error handling subscription created:", error)
  }
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  try {
    const customerEmail = session.customer_email
    const customerId = session.customer as string

    if (!customerEmail) {
      console.error("❌ No customer email in session")
      return
    }

    // Check if this is a single report purchase
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
    const isSingleReport = lineItems.data.some((item) => item.price?.id === process.env.STRIPE_SINGLE_REPORT_PRICE_ID)

    if (isSingleReport) {
      // Increment single report credits
      const user = await getUserByEmail(customerEmail)
      if (user) {
        const currentCredits = user.single_report_credits || 0
        await updateUserByEmail(customerEmail, {
          single_report_credits: currentCredits + 1,
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        console.log("✅ Single report credit added for:", customerEmail)
      }
    }
  } catch (error) {
    console.error("❌ Error handling one-time payment:", error)
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, action: "created" | "updated") {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)

    if (!customer || customer.deleted) {
      console.error("❌ Customer not found or deleted")
      return
    }

    const customerEmail = customer.email
    if (!customerEmail) {
      console.error("❌ No email for customer")
      return
    }

    const isActive = subscription.status === "active"
    const subscriptionType = isActive ? "pro" : "free"

    await updateUserByEmail(customerEmail, {
      subscription_type: subscriptionType,
      subscription_status: subscription.status,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      updated_at: new Date().toISOString(),
    })

    console.log(`✅ Subscription ${action} for ${customerEmail}: ${subscription.status}`)
  } catch (error) {
    console.error(`❌ Error handling subscription ${action}:`, error)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)

    if (!customer || customer.deleted) {
      console.error("❌ Customer not found or deleted")
      return
    }

    const customerEmail = customer.email
    if (!customerEmail) {
      console.error("❌ No email for customer")
      return
    }

    await updateUserByEmail(customerEmail, {
      subscription_type: "free",
      subscription_status: "canceled",
      updated_at: new Date().toISOString(),
    })

    console.log("✅ Subscription canceled for:", customerEmail)
  } catch (error) {
    console.error("❌ Error handling subscription canceled:", error)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!invoice.customer) return

    const customer = await stripe.customers.retrieve(invoice.customer as string)

    if (!customer || customer.deleted) {
      console.error("❌ Customer not found or deleted")
      return
    }

    const customerEmail = customer.email
    if (!customerEmail) {
      console.error("❌ No email for customer")
      return
    }

    // Ensure subscription is active
    await updateUserByEmail(customerEmail, {
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })

    console.log("✅ Invoice payment succeeded for:", customerEmail)
  } catch (error) {
    console.error("❌ Error handling invoice payment succeeded:", error)
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.customer) return

    const customer = await stripe.customers.retrieve(invoice.customer as string)

    if (!customer || customer.deleted) {
      console.error("❌ Customer not found or deleted")
      return
    }

    const customerEmail = customer.email
    if (!customerEmail) {
      console.error("❌ No email for customer")
      return
    }

    // Mark subscription as past due
    await updateUserByEmail(customerEmail, {
      subscription_status: "past_due",
      updated_at: new Date().toISOString(),
    })

    console.log("❌ Invoice payment failed for:", customerEmail)
  } catch (error) {
    console.error("❌ Error handling invoice payment failed:", error)
  }
}
