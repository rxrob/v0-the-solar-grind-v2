import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createServerSupabaseClient } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, mode = "subscription" } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    console.log("💳 Creating checkout session for user:", userId, "price:", priceId)

    // Get user from database
    const supabase = createServerSupabaseClient()
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError || !user) {
      console.error("❌ User not found:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let customerId = user.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      console.log("🔧 Creating new Stripe customer for:", user.email)

      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: userId,
        },
      })

      customerId = customer.id

      // Update user with Stripe customer ID
      const { error: updateError } = await supabase
        .from("users")
        .update({
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (updateError) {
        console.error("❌ Error updating user with customer ID:", updateError)
      } else {
        console.log("✅ User updated with Stripe customer ID")
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as "subscription" | "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        user_id: userId,
        price_id: priceId,
      },
      subscription_data:
        mode === "subscription"
          ? {
              metadata: {
                user_id: userId,
              },
            }
          : undefined,
    })

    console.log("✅ Checkout session created:", session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error("❌ Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
