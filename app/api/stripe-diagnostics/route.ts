import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 === STRIPE DIAGNOSTICS START ===")

    const result: any = {
      success: true,
      environment: {},
      recommendations: [],
    }

    // Check ALL possible environment variable variations
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY
    const hasPublishableKey = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const hasPublishableKeyWrongName = !!process.env.STRIPE_PUBLISHABLE_KEY
    const isTestKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") || false
    const isLiveKey = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") || false

    // Check webhook secret variations
    const hasWebhookSecret = !!process.env.STRIPE_WEBHOOK_SECRET
    const hasWebhookSecretAlt = !!process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET

    result.environment = {
      hasSecretKey,
      hasPublishableKey,
      hasPublishableKeyWrongName,
      isTestKey,
      isLiveKey,
      hasWebhookSecret,
      hasWebhookSecretAlt,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 12) + "..." || "Not found",
      publishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 12) + "..." || "Not found",
      publishableKeyWrongPrefix: process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 12) + "..." || "Not found",
    }

    console.log("🔑 Environment check:")
    console.log("   - STRIPE_SECRET_KEY present:", hasSecretKey)
    console.log("   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY present:", hasPublishableKey)
    console.log("   - STRIPE_PUBLISHABLE_KEY present (wrong name):", hasPublishableKeyWrongName)
    console.log("   - Is test key:", isTestKey)
    console.log("   - Is live key:", isLiveKey)
    console.log("   - STRIPE_WEBHOOK_SECRET present:", hasWebhookSecret)

    // Environment variable recommendations
    if (!hasSecretKey) {
      result.recommendations.push({
        type: "environment",
        severity: "high",
        message: "Missing STRIPE_SECRET_KEY environment variable",
        action: "Add your Stripe secret key (sk_live_... or sk_test_...) as STRIPE_SECRET_KEY",
      })
    }

    if (!hasPublishableKey && !hasPublishableKeyWrongName) {
      result.recommendations.push({
        type: "environment",
        severity: "high",
        message: "Missing Stripe publishable key environment variable",
        action: "Add your Stripe publishable key (pk_live_... or pk_test_...) as NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      })
    } else if (!hasPublishableKey && hasPublishableKeyWrongName) {
      result.recommendations.push({
        type: "environment",
        severity: "high",
        message:
          "Stripe publishable key has wrong name - found STRIPE_PUBLISHABLE_KEY but need NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        action: "Rename STRIPE_PUBLISHABLE_KEY to NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables",
        details: `Current value: ${process.env.STRIPE_PUBLISHABLE_KEY?.substring(0, 20)}...`,
      })
    }

    if (!hasWebhookSecret && !hasWebhookSecretAlt) {
      result.recommendations.push({
        type: "environment",
        severity: "medium",
        message: "Missing webhook secret (optional but recommended for production)",
        action: "Add STRIPE_WEBHOOK_SECRET from your Stripe webhook endpoint",
      })
    }

    // Key matching check
    if (hasSecretKey && hasPublishableKey) {
      const secretIsTest = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")
      const publishableIsTest = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_")

      if (secretIsTest !== publishableIsTest) {
        result.recommendations.push({
          type: "environment",
          severity: "high",
          message: "Secret key and publishable key don't match (one is test, one is live)",
          action: "Ensure both keys are from the same Stripe environment (both test or both live)",
        })
      }
    }

    if (!hasSecretKey) {
      return NextResponse.json(result)
    }

    // Test Stripe connection
    console.log("🔗 Testing Stripe connection...")
    const account = await stripe.accounts.retrieve()
    console.log("✅ Stripe connection successful")
    console.log("   - Account ID:", account.id)
    console.log("   - Country:", account.country)
    console.log("   - Default Currency:", account.default_currency)
    console.log("   - Charges Enabled:", account.charges_enabled)
    console.log("   - Payouts Enabled:", account.payouts_enabled)

    result.account = {
      id: account.id,
      country: account.country,
      defaultCurrency: account.default_currency,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
    }

    // Check specific price IDs
    const priceIds = [
      "price_1RdGtXD80D06ku9UWRTdDUHh", // Single report
      "price_1RdGemD80D06ku9UO6X1lR35", // Professional plan
    ]

    const priceResults = []

    for (const priceId of priceIds) {
      try {
        console.log(`🔍 Checking price: ${priceId}`)
        const price = await stripe.prices.retrieve(priceId, {
          expand: ["product"],
        })
        console.log(`✅ Price ${priceId} found:`)
        console.log("   - Amount:", price.unit_amount, "cents")
        console.log("   - Currency:", price.currency)
        console.log("   - Type:", price.type)
        console.log("   - Active:", price.active)
        console.log("   - Live Mode:", price.livemode)

        const product = price.product as any
        console.log("   - Product Name:", product.name)
        console.log("   - Product Active:", product.active)

        priceResults.push({
          priceId,
          exists: true,
          price: {
            id: price.id,
            amount: price.unit_amount,
            currency: price.currency,
            type: price.type,
            active: price.active,
            livemode: price.livemode,
            product: {
              id: product.id,
              name: product.name,
              active: product.active,
            },
            recurring: price.recurring
              ? {
                  interval: price.recurring.interval,
                  interval_count: price.recurring.interval_count,
                }
              : null,
          },
        })

        // Add recommendations for inactive prices/products
        if (!price.active) {
          result.recommendations.push({
            type: "price",
            severity: "high",
            message: `Price ${priceId} exists but is inactive`,
            action: "Activate this price in your Stripe dashboard",
          })
        }

        if (!product.active) {
          result.recommendations.push({
            type: "product",
            severity: "high",
            message: `Product for price ${priceId} is inactive`,
            action: "Activate the associated product in your Stripe dashboard",
          })
        }
      } catch (error) {
        console.error(`❌ Price ${priceId} not found:`, error)
        priceResults.push({
          priceId,
          exists: false,
          error: error instanceof Error ? error.message : "Unknown error",
        })

        result.recommendations.push({
          type: "price",
          severity: "high",
          message: `Price ${priceId} does not exist in your Stripe account`,
          action: `Create a price with ID ${priceId} or update your code to use an existing price`,
        })
      }
    }

    result.priceCheck = priceResults

    // List all available prices
    console.log("📋 Listing all available prices...")
    const allPrices = await stripe.prices.list({ limit: 20, expand: ["data.product"] })
    console.log(`Found ${allPrices.data.length} prices:`)

    const availablePrices = []
    for (const price of allPrices.data) {
      const product = price.product as any
      availablePrices.push({
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        type: price.type,
        active: price.active,
        livemode: price.livemode,
        product: {
          id: product.id,
          name: product.name,
          active: product.active,
        },
        recurring: price.recurring
          ? {
              interval: price.recurring.interval,
              interval_count: price.recurring.interval_count,
            }
          : null,
      })
    }

    result.availablePrices = availablePrices

    // Test creating a checkout session
    let testSessionResult = null
    const workingPrices = availablePrices.filter((p) => p.active && p.product.active)

    if (workingPrices.length > 0) {
      const testPrice = workingPrices[0]
      try {
        console.log(`🧪 Testing checkout session creation with price: ${testPrice.id}`)
        const testSession = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{ price: testPrice.id, quantity: 1 }],
          mode: testPrice.type === "recurring" ? "subscription" : "payment",
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/cancel`,
          metadata: {
            test: "true",
            diagnostics: "true",
          },
        })

        console.log("✅ Test checkout session created successfully")
        testSessionResult = {
          success: true,
          sessionId: testSession.id,
          url: testSession.url,
          priceUsed: testPrice.id,
          priceAmount: testPrice.amount,
          priceCurrency: testPrice.currency,
        }
      } catch (error) {
        console.error("❌ Test checkout session failed:", error)
        testSessionResult = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          priceUsed: testPrice.id,
        }
      }
    }

    result.testSession = testSessionResult

    // Final recommendations
    if (isLiveKey) {
      result.recommendations.push({
        type: "environment",
        severity: "warning",
        message: "You are using live Stripe keys - real payments will be processed",
        action: "Switch to test keys for development, or ensure you want to process real payments",
      })
    }

    console.log("✅ === STRIPE DIAGNOSTICS COMPLETE ===")
    return NextResponse.json(result)
  } catch (error) {
    console.error("💥 Stripe diagnostics failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        recommendations: [
          {
            type: "error",
            severity: "high",
            message: "Failed to connect to Stripe",
            action: "Check your STRIPE_SECRET_KEY is correct and has proper permissions",
          },
        ],
      },
      { status: 500 },
    )
  }
}
