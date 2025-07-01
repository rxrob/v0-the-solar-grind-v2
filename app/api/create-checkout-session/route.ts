import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

// Price ID mapping
const PRICE_IDS = {
  SINGLE_REPORT: "price_1RdGtXD80D06ku9UWRTdDUHh",
  SUBSCRIPTION: "price_1RdGemD80D06ku9UO6X1lR35",
}

export async function POST(request: NextRequest) {
  console.log("[SERVER] 🚀 === CREATE CHECKOUT SESSION START ===")

  try {
    const body = await request.json()
    console.log("[SERVER] 📋 Request Body:", JSON.stringify(body, null, 2))

    let purchaseType: string
    let priceId: string
    let email: string | undefined
    let userId: string | undefined

    // Support both old format (priceId) and new format (purchaseType)
    if (body.priceId) {
      console.log("[SERVER] 📦 Using old format (priceId):")
      priceId = body.priceId
      console.log(`[SERVER]    - Price ID: ${priceId}`)

      // Determine purchase type from price ID
      if (priceId === PRICE_IDS.SINGLE_REPORT) {
        purchaseType = "single_report"
      } else if (priceId === PRICE_IDS.SUBSCRIPTION) {
        purchaseType = "subscription"
      } else {
        console.error("[SERVER] ❌ Invalid price ID:", priceId)
        return NextResponse.json({ error: "Invalid price ID" }, { status: 400 })
      }

      console.log(`[SERVER]    - Determined Purchase Type: ${purchaseType}`)
      email = body.email
      userId = body.userId
    } else if (body.purchaseType) {
      console.log("[SERVER] 📦 Using new format (purchaseType):")
      purchaseType = body.purchaseType
      email = body.email
      userId = body.userId

      console.log(`[SERVER]    - Purchase Type: ${purchaseType}`)
      console.log(`[SERVER]    - Email: ${email}`)
      console.log(`[SERVER]    - User ID: ${userId}`)

      // Get price ID from purchase type
      if (purchaseType === "single_report") {
        priceId = PRICE_IDS.SINGLE_REPORT
      } else if (purchaseType === "subscription") {
        priceId = PRICE_IDS.SUBSCRIPTION
      } else {
        console.error("[SERVER] ❌ Invalid purchase type:", purchaseType)
        return NextResponse.json({ error: "Invalid purchase type" }, { status: 400 })
      }

      console.log(`[SERVER]    - Mapped to Price ID: ${priceId}`)
    } else {
      console.error("[SERVER] ❌ Missing purchase type or price ID")
      return NextResponse.json({ error: "Missing purchase type" }, { status: 400 })
    }

    // Validate Stripe configuration
    console.log("[SERVER] 🔑 Stripe Key Configuration:")
    const isTestKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
    const isLiveKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
    console.log(`[SERVER]    - Using Test Key: ${isTestKey ? "✅ YES" : "❌ NO"}`)
    console.log(`[SERVER]    - Using Live Key: ${isLiveKey ? "✅ YES" : "❌ NO"}`)

    if (!isTestKey && !isLiveKey) {
      console.error("[SERVER] ❌ Invalid Stripe secret key format")
      return NextResponse.json({ error: "Invalid Stripe configuration" }, { status: 500 })
    }

    // Validate price with Stripe
    console.log("[SERVER] 🔍 Validating price ID with Stripe...")
    let price: Stripe.Price
    try {
      price = await stripe.prices.retrieve(priceId)
      console.log("[SERVER] ✅ Price validation successful:")
      console.log(`[SERVER]    - ID: ${price.id}`)
      console.log(`[SERVER]    - Amount: ${price.unit_amount} cents`)
      console.log(`[SERVER]    - Currency: ${price.currency}`)
      console.log(`[SERVER]    - Type: ${price.type}`)
      console.log(`[SERVER]    - Active: ${price.active}`)

      if (!price.active) {
        console.error("[SERVER] ❌ Price is not active")
        return NextResponse.json({ error: "Price is not active" }, { status: 400 })
      }
    } catch (error) {
      console.error("[SERVER] ❌ Price validation failed:", error)
      return NextResponse.json({ error: "Invalid price ID" }, { status: 400 })
    }

    // Determine session mode and configuration
    const mode = price.type === "recurring" ? "subscription" : "payment"
    console.log("[SERVER] ⚙️ Session Configuration:")
    console.log(`[SERVER]    - Mode: ${mode}`)
    console.log(`[SERVER]    - Purchase Type: ${purchaseType}`)
    console.log(`[SERVER]    - Amount: ${price.unit_amount} cents`)
    console.log(`[SERVER]    - Currency: ${price.currency}`)

    // Base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mysolarai.com"

    // Create session configuration
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      mode: mode as "payment" | "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&type=${purchaseType}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      customer_creation: "always",
      billing_address_collection: "required",
      metadata: {
        priceId,
        purchaseType,
        amount: price.unit_amount?.toString() || "0",
        currency: price.currency,
        ...(userId && { userId }),
      },
    }

    // Add email if provided
    if (email) {
      sessionConfig.customer_email = email
      console.log(`[SERVER] 📧 Customer email set: ${email}`)
    }

    // Add subscription-specific configuration
    if (mode === "subscription") {
      sessionConfig.subscription_data = {
        metadata: {
          purchaseType,
          ...(userId && { userId }),
        },
      }
    } else {
      // Add payment-specific configuration
      sessionConfig.payment_intent_data = {
        metadata: {
          purchaseType,
          ...(userId && { userId }),
        },
      }
      console.log("[SERVER] ✅ Added payment intent data")
    }

    // Add automatic tax
    sessionConfig.automatic_tax = { enabled: true }

    // Add invoice creation for subscriptions
    if (mode === "subscription") {
      sessionConfig.invoice_creation = { enabled: true }
    }

    console.log("[SERVER] 📋 Final session configuration:")
    console.log(`[SERVER]    - Mode: ${sessionConfig.mode}`)
    console.log(`[SERVER]    - Success URL: ${sessionConfig.success_url}`)
    console.log(`[SERVER]    - Cancel URL: ${sessionConfig.cancel_url}`)
    console.log(`[SERVER]    - Customer Email: ${sessionConfig.customer_email || "undefined"}`)
    console.log(`[SERVER]    - Metadata: ${JSON.stringify(sessionConfig.metadata, null, 2)}`)

    // Create the checkout session
    console.log("[SERVER] 🔄 Creating Stripe checkout session...")
    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log("[SERVER] 🎉 SESSION CREATED SUCCESSFULLY!")
    console.log("[SERVER] 📊 Session Details:")
    console.log(`[SERVER]    - Session ID: ${session.id}`)
    console.log(`[SERVER]    - Checkout URL: ${session.url}`)
    console.log(`[SERVER]    - Mode: ${session.mode}`)
    console.log(`[SERVER]    - Amount Total: ${session.amount_total} cents`)
    console.log(`[SERVER]    - Currency: ${session.currency}`)
    console.log(`[SERVER]    - Status: ${session.status}`)
    console.log(`[SERVER]    - Live Mode: ${session.livemode ? "LIVE" : "TEST"}`)
    console.log("[SERVER] ✅ === CREATE CHECKOUT SESSION COMPLETE ===")

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("[SERVER] ❌ === CREATE CHECKOUT SESSION ERROR ===")
    console.error("[SERVER] Error:", error)

    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
