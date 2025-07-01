import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")!

    console.log("🔔 Webhook received:")
    console.log("   - Signature present:", !!signature)
    console.log("   - Body length:", body.length)
    console.log("   - Webhook secret configured:", !!webhookSecret)

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log("✅ Webhook signature verified")
      console.log("   - Event type:", event.type)
      console.log("   - Event ID:", event.id)
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = createClient()

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const email = session.metadata?.email || session.customer_email
        const purchaseType = session.metadata?.purchaseType

        console.log("💳 Checkout session completed:")
        console.log("   - Session ID:", session.id)
        console.log("   - User ID:", userId)
        console.log("   - Email:", email)
        console.log("   - Purchase Type:", purchaseType)
        console.log("   - Amount:", session.amount_total)
        console.log("   - Mode:", session.mode)
        console.log("   - Payment Status:", session.payment_status)

        if (purchaseType === "single_report") {
          console.log("🎯 Processing single report purchase...")

          if (email) {
            // Create or update user with single report access
            const { data: existingUser } = await supabase.from("users").select("*").eq("email", email).single()

            if (existingUser) {
              console.log("   - Updating existing user with single report access")
              await supabase
                .from("users")
                .update({
                  single_report_purchased: true,
                  single_report_session_id: session.id,
                  updated_at: new Date().toISOString(),
                })
                .eq("email", email)
            } else {
              console.log("   - Creating new user record for single report purchase")
              await supabase.from("users").insert({
                email: email,
                name: session.customer_details?.name || email,
                account_type: "single_report",
                subscription_status: "active",
                subscription_plan: "single_report",
                single_report_purchased: true,
                single_report_session_id: session.id,
                stripe_customer_id: session.customer as string,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
            }

            // Log the single report purchase
            await supabase.from("solar_calculations").insert({
              user_email: email,
              calculation_type: "single_report_purchase",
              session_id: session.id,
              amount_paid: session.amount_total ? session.amount_total / 100 : 4.99,
              created_at: new Date().toISOString(),
            })

            console.log("✅ Single report purchase processed successfully")
          }
        } else if (purchaseType === "subscription") {
          console.log("🎯 Processing subscription purchase...")

          if (userId && session.customer) {
            await supabase
              .from("users")
              .update({
                account_type: "pro",
                subscription_status: "active",
                subscription_plan: "professional",
                stripe_customer_id: session.customer,
                updated_at: new Date().toISOString(),
              })
              .eq("id", userId)

            console.log("✅ Subscription purchase processed successfully")
          }
        }
        break

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log("💰 Payment succeeded:")
        console.log("   - Payment Intent ID:", paymentIntent.id)
        console.log("   - Amount:", paymentIntent.amount)
        console.log("   - Currency:", paymentIntent.currency)
        break

      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        console.log("🔄 Subscription updated:")
        console.log("   - Subscription ID:", subscription.id)
        console.log("   - Customer ID:", customerId)
        console.log("   - Status:", subscription.status)

        const status =
          subscription.status === "active" ? "active" : subscription.status === "canceled" ? "cancelled" : "inactive"

        await supabase
          .from("users")
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        console.log("✅ Subscription status updated")
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription
        const deletedCustomerId = deletedSubscription.customer as string

        console.log("❌ Subscription deleted:")
        console.log("   - Subscription ID:", deletedSubscription.id)
        console.log("   - Customer ID:", deletedCustomerId)

        await supabase
          .from("users")
          .update({
            account_type: "free",
            subscription_status: "cancelled",
            subscription_plan: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", deletedCustomerId)

        console.log("✅ Subscription cancellation processed")
        break

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice
        console.log("📄 Invoice payment succeeded:")
        console.log("   - Invoice ID:", invoice.id)
        console.log("   - Customer ID:", invoice.customer)
        console.log("   - Amount:", invoice.amount_paid)
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        console.log("❌ Invoice payment failed:")
        console.log("   - Invoice ID:", failedInvoice.id)
        console.log("   - Customer ID:", failedInvoice.customer)
        console.log("   - Amount:", failedInvoice.amount_due)
        break

      default:
        console.log("ℹ️ Unhandled event type:", event.type)
    }

    console.log("✅ Webhook processed successfully")
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("💥 Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
