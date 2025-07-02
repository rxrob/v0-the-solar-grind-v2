import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("📝 Checkout request body:", body)

    // Accept both purchaseType and priceType for backward compatibility
    const { purchaseType, priceType, userId, userEmail } = body
    const finalPurchaseType = purchaseType || priceType

    if (!finalPurchaseType) {
      console.error("❌ Missing priceType or purchaseType")
      return NextResponse.json({ error: "Missing priceType", received: body }, { status: 400 })
    }

    console.log("🛒 Processing checkout for:", finalPurchaseType)

    // Check if we're in test mode
    const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
    console.log("🔧 Stripe mode:", isTestMode ? "TEST" : "LIVE")

    // Define pricing based on environment
    const pricing = {
      "single-report": {
        name: isTestMode ? "Single Solar Report (Test)" : "Single Solar Report",
        amount: isTestMode ? 100 : 499, // $1.00 test, $4.99 live
        currency: "usd",
        mode: "payment" as const,
      },
      "pro-subscription": {
        name: isTestMode ? "Pro Subscription (Test)" : "Pro Subscription",
        amount: isTestMode ? 500 : 2999, // $5.00 test, $29.99 live
        currency: "usd",
        mode: "subscription" as const,
        interval: "month" as const,
      },
    }

    const priceConfig = pricing[finalPurchaseType as keyof typeof pricing]
    if (!priceConfig) {
      return NextResponse.json({ error: "Invalid purchase type", validTypes: Object.keys(pricing) }, { status: 400 })
    }

    console.log("💰 Price config:", priceConfig)

    // Create or find product
    console.log("🔍 Looking for existing product...")
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    })

    let product = products.data.find((p) => p.name === priceConfig.name)

    if (!product) {
      console.log("➕ Creating new product...")
      product = await stripe.products.create({
        name: priceConfig.name,
        description: `${priceConfig.name} - Solar analysis and reporting`,
        metadata: {
          type: finalPurchaseType,
          environment: isTestMode ? "test" : "live",
        },
      })
      console.log("✅ Product created:", product.id, product.name)
    } else {
      console.log("✅ Found existing product:", product.id, product.name)
    }

    // Create or find price
    console.log("🔍 Looking for existing price...")
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    })

    let price = prices.data.find(
      (p) =>
        p.unit_amount === priceConfig.amount &&
        p.currency === priceConfig.currency &&
        (priceConfig.mode === "subscription" ? p.recurring?.interval === priceConfig.interval : !p.recurring),
    )

    if (!price) {
      console.log("➕ Creating new price...")
      const priceData: Stripe.PriceCreateParams = {
        product: product.id,
        unit_amount: priceConfig.amount,
        currency: priceConfig.currency,
        metadata: {
          type: finalPurchaseType,
          environment: isTestMode ? "test" : "live",
        },
      }

      if (priceConfig.mode === "subscription") {
        priceData.recurring = {
          interval: priceConfig.interval,
        }
      }

      price = await stripe.prices.create(priceData)
      console.log("✅ Price created:", price.id, `$${(priceConfig.amount / 100).toFixed(2)}`)
    } else {
      console.log("✅ Found existing price:", price.id, `$${(priceConfig.amount / 100).toFixed(2)}`)
    }

    // Create checkout session
    console.log("🛒 Creating checkout session...")

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      mode: priceConfig.mode,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
      metadata: {
        purchaseType: finalPurchaseType,
        userId: userId || "anonymous",
        environment: isTestMode ? "test" : "live",
      },
    }

    // Mode-specific configuration
    if (priceConfig.mode === "payment") {
      // Payment mode configuration
      sessionConfig.customer_creation = "always"
      sessionConfig.invoice_creation = {
        enabled: true,
      }
    } else if (priceConfig.mode === "subscription") {
      // Subscription mode configuration
      sessionConfig.subscription_data = {
        metadata: {
          purchaseType: finalPurchaseType,
          userId: userId || "anonymous",
        },
      }

      // Add trial period
      const trialDays = isTestMode ? 7 : 1
      console.log(`🎁 Added ${trialDays}-day trial for ${isTestMode ? "test" : "live"} mode`)
      sessionConfig.subscription_data.trial_period_days = trialDays
    }

    // Add customer email if provided
    if (userEmail) {
      sessionConfig.customer_email = userEmail
    }

    console.log("🔧 Session config:", {
      mode: sessionConfig.mode,
      priceId: price.id,
      amount: `$${(priceConfig.amount / 100).toFixed(2)}`,
      trial: sessionConfig.subscription_data?.trial_period_days || "none",
    })

    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log("✅ Checkout session created:", session.id)
    console.log("🔗 Checkout URL:", session.url)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      priceId: price.id,
      productId: product.id,
      amount: priceConfig.amount,
      currency: priceConfig.currency,
      mode: priceConfig.mode,
    })
  } catch (error: any) {
    console.error("❌ Error creating checkout session:", error.message)
    console.error("🔴 Stripe error details:", error.message)

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error.message,
        type: error.type || "unknown_error",
      },
      { status: 500 },
    )
  }
}
