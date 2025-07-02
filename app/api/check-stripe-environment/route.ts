import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!secretKey) {
      return NextResponse.json({
        configured: false,
        error: "STRIPE_SECRET_KEY not configured",
      })
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    })

    // Detect environment
    const isTestMode = secretKey.startsWith("sk_test_")
    const expectedPublishablePrefix = isTestMode ? "pk_test_" : "pk_live_"

    console.log("🔧 Stripe Environment Check:")
    console.log("- Secret Key:", secretKey ? `${secretKey.substring(0, 12)}...` : "NOT SET")
    console.log("- Publishable Key:", publishableKey ? `${publishableKey.substring(0, 12)}...` : "NOT SET")
    console.log("- Webhook Secret:", webhookSecret ? "SET" : "NOT SET")
    console.log("- Environment:", isTestMode ? "TEST" : "LIVE")

    // Check key consistency
    const keyMismatch = publishableKey && !publishableKey.startsWith(expectedPublishablePrefix)

    // Test Stripe API connection
    let account = null
    let connectionError = null
    try {
      account = await stripe.accounts.retrieve()
      console.log("✅ Stripe API connection successful")
    } catch (error: any) {
      connectionError = error.message
      console.error("❌ Stripe API connection failed:", error.message)
    }

    // Get existing products for debugging
    let products = []
    try {
      const productList = await stripe.products.list({ limit: 10, active: true })
      products = productList.data.map((p) => ({
        id: p.id,
        name: p.name,
        created: new Date(p.created * 1000).toISOString(),
      }))
    } catch (error) {
      console.error("Error fetching products:", error)
    }

    // Get existing prices for debugging
    let prices = []
    try {
      const priceList = await stripe.prices.list({ limit: 10, active: true })
      prices = priceList.data.map((p) => ({
        id: p.id,
        amount: p.unit_amount,
        currency: p.currency,
        interval: p.recurring?.interval || "one-time",
        product: p.product,
      }))
    } catch (error) {
      console.error("Error fetching prices:", error)
    }

    return NextResponse.json({
      configured: true,
      environment: isTestMode ? "test" : "live",
      keys: {
        secretKey: secretKey ? `${secretKey.substring(0, 12)}...` : null,
        publishableKey: publishableKey ? `${publishableKey.substring(0, 12)}...` : null,
        webhookSecret: !!webhookSecret,
      },
      keyMismatch,
      expectedPublishablePrefix,
      connection: {
        success: !connectionError,
        error: connectionError,
        account: account
          ? {
              id: account.id,
              country: account.country,
              default_currency: account.default_currency,
              email: account.email,
            }
          : null,
      },
      products,
      prices,
      recommendations: [
        ...(!publishableKey ? ["Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to environment"] : []),
        ...(keyMismatch ? [`Publishable key should start with ${expectedPublishablePrefix}`] : []),
        ...(!webhookSecret ? ["Add STRIPE_WEBHOOK_SECRET for webhook handling"] : []),
        ...(connectionError ? ["Check Stripe API key validity"] : []),
      ],
    })
  } catch (error: any) {
    console.error("Environment check error:", error)
    return NextResponse.json(
      {
        configured: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
