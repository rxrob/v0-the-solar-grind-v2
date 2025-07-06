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

    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object

        // Update user subscription status
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
            console.error("Error updating user subscription:", error)
          }
        }
        break

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = event.data.object

        const status = subscription.status === "active" ? "active" : "inactive"

        const { error } = await supabase
          .from("users")
          .update({
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", subscription.customer as string)

        if (error) {
          console.error("Error updating subscription status:", error)
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
