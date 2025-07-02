import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json()

    console.log("🔍 === STRIPE VALIDATION START ===")
    console.log("📋 Validating Price ID:", priceId)

    // Validate environment
    const isTestKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
    const isLiveKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")

    console.log("🔑 Environment Check:")
    console.log("   - Test Key:", isTestKey ? "✅" : "❌")
    console.log("   - Live Key:", isLiveKey ? "✅" : "❌")

    // Test price retrieval
    let priceData
    let priceError = null
    try {
      priceData = await stripe.prices.retrieve(priceId)
      console.log("✅ Price Retrieved Successfully:")
      console.log("   - ID:", priceData.id)
      console.log("   - Active:", priceData.active)
      console.log("   - Amount:", priceData.unit_amount)
      console.log("   - Currency:", priceData.currency)
      console.log("   - Type:", priceData.type)
      console.log("   - Live Mode:", priceData.livemode)
    } catch (error) {
      priceError = error
      console.error("❌ Price Retrieval Failed:", error)
    }

    // Test product retrieval
    let productData
    let productError = null
    if (priceData) {
      try {
        productData = await stripe.products.retrieve(priceData.product as string)
        console.log("✅ Product Retrieved Successfully:")
        console.log("   - ID:", productData.id)
        console.log("   - Name:", productData.name)
        console.log("   - Active:", productData.active)
        console.log("   - Live Mode:", productData.livemode)
      } catch (error) {
        productError = error
        console.error("❌ Product Retrieval Failed:", error)
      }
    }

    // Test session creation
    let sessionData
    let sessionError = null
    if (priceData && priceData.active && productData && productData.active) {
      try {
        const mode = priceData.type === "recurring" ? "subscription" : "payment"
        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
          payment_method_types: ["card"],
          line_items: [{ price: priceId, quantity: 1 }],
          mode: mode,
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
          metadata: {
            validation_test: "true",
            price_id: priceId,
            timestamp: new Date().toISOString(),
          },
        }

        if (mode === "subscription") {
          sessionConfig.subscription_data = {
            trial_period_days: 7,
          }
        }

        sessionData = await stripe.checkout.sessions.create(sessionConfig)
        console.log("✅ Validation Session Created:")
        console.log("   - Session ID:", sessionData.id)
        console.log("   - URL:", sessionData.url)
        console.log("   - Mode:", sessionData.mode)
        console.log("   - Status:", sessionData.status)
      } catch (error) {
        sessionError = error
        console.error("❌ Session Creation Failed:", error)
      }
    }

    console.log("🔍 === STRIPE VALIDATION COMPLETE ===")

    return NextResponse.json({
      success: true,
      environment: {
        isTest: isTestKey,
        isLive: isLiveKey,
        keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 8),
      },
      price: {
        exists: !!priceData,
        active: priceData?.active || false,
        amount: priceData?.unit_amount,
        currency: priceData?.currency,
        type: priceData?.type,
        livemode: priceData?.livemode,
        error: priceError ? (priceError as Error).message : null,
      },
      product: {
        exists: !!productData,
        active: productData?.active || false,
        name: productData?.name,
        livemode: productData?.livemode,
        error: productError ? (productError as Error).message : null,
      },
      session: {
        created: !!sessionData,
        url: sessionData?.url,
        sessionId: sessionData?.id,
        mode: sessionData?.mode,
        status: sessionData?.status,
        error: sessionError ? (sessionError as Error).message : null,
      },
      recommendations: {
        priceIssues: !priceData
          ? ["Price does not exist in your Stripe account"]
          : !priceData.active
            ? ["Price exists but is inactive - activate it in Stripe dashboard"]
            : [],
        productIssues: !productData
          ? ["Product does not exist"]
          : !productData.active
            ? ["Product exists but is inactive - activate it in Stripe dashboard"]
            : [],
        sessionIssues: !sessionData ? ["Cannot create checkout session due to price/product issues"] : [],
      },
    })
  } catch (error) {
    console.error("💥 Validation API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
