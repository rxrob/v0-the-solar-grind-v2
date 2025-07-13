import { createSupabaseServiceClient } from "@/lib/supabase/admin"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"
import { NextResponse } from "next/server"

const billingUrl = absoluteUrl("/billing")

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServiceClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { data: userSubscription } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (userSubscription && userSubscription.stripe_customer_id) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripe_customer_id,
        return_url: billingUrl,
      })

      return new NextResponse(JSON.stringify({ url: stripeSession.url }))
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Solar Pro",
              description: "Unlimited solar calculations",
            },
            unit_amount: 2000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
      },
    })

    return new NextResponse(JSON.stringify({ url: stripeSession.url }))
  } catch (error) {
    console.log("[STRIPE_ERROR]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
