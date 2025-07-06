import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { priceId, mode = "subscription" } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    // Check if user already has a Stripe customer ID
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single()

    let customerId = userData?.stripe_customer_id

    // Create customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || userData?.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })

      customerId = customer.id

      // Update user with customer ID
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    const sessionConfig: any = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode,
      success_url: absoluteUrl("/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: absoluteUrl("/pricing"),
      customer: customerId,
      metadata: {
        user_id: user.id,
      },
    }

    // For one-time payments, add payment_intent_data
    if (mode === "payment") {
      sessionConfig.payment_intent_data = {
        metadata: {
          user_id: user.id,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
