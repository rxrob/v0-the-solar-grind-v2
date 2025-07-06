import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = (await headers()).get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)

    console.log("Webhook event:", event.type)

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object
        console.log("Checkout session completed:", session.id)

        // Handle successful payment
        if (session.customer_email) {
          const { error } = await supabase
            .from("users")
            .update({
              subscription_status: "active",
              stripe_customer_id: session.customer as string,
              updated_at: new Date().toISOString(),
            })
            .eq("email", session.customer_email)

          if (error) {
            console.error("Error updating user:", error)
          } else {
            console.log("User subscription updated successfully")
          }
        }
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object
        console.log("Subscription event:", subscription.id, subscription.status)

        const { error: subError } = await supabase
          .from("users")
          .update({
            subscription_status: subscription.status === "active" ? "active" : "inactive",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", subscription.customer as string)

        if (subError) {
          console.error("Error updating subscription:", subError)
        }
        break

      case "customer.subscription.deleted":
        const deletedSub = event.data.object
        console.log("Subscription deleted:", deletedSub.id)

        const { error: delError } = await supabase
          .from("users")
          .update({
            subscription_status: "inactive",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", deletedSub.customer as string)

        if (delError) {
          console.error("Error updating deleted subscription:", delError)
        }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}
