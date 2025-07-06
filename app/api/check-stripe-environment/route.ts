import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const priceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID

    const diagnosis = {
      environment: {
        secretKey: {
          exists: !!secretKey,
          format: secretKey
            ? secretKey.startsWith("sk_test_")
              ? "TEST"
              : secretKey.startsWith("sk_live_")
                ? "LIVE"
                : "INVALID"
            : "MISSING",
          length: secretKey ? secretKey.length : 0,
        },
        publishableKey: {
          exists: !!publishableKey,
          format: publishableKey
            ? publishableKey.startsWith("pk_test_")
              ? "TEST"
              : publishableKey.startsWith("pk_live_")
                ? "LIVE"
                : "INVALID"
            : "MISSING",
          length: publishableKey ? publishableKey.length : 0,
        },
        webhookSecret: {
          exists: !!webhookSecret,
          format: webhookSecret ? (webhookSecret.startsWith("whsec_") ? "VALID" : "INVALID") : "MISSING",
        },
        priceId: {
          exists: !!priceId,
          format: priceId ? (priceId.startsWith("price_") ? "VALID" : "INVALID") : "MISSING",
        },
      },
      compatibility: {
        keysMatch: false,
        environment: "UNKNOWN",
      },
      connectionTest: null as any,
      recommendations: [] as string[],
    }

    // Check key compatibility
    if (secretKey && publishableKey) {
      const secretIsTest = secretKey.startsWith("sk_test_")
      const publishableIsTest = publishableKey.startsWith("pk_test_")

      diagnosis.compatibility.keysMatch = secretIsTest === publishableIsTest
      diagnosis.compatibility.environment = secretIsTest ? "TEST" : "LIVE"
    }

    // Test Stripe connection
    if (secretKey && secretKey.startsWith("sk_")) {
      try {
        const stripe = new Stripe(secretKey)

        const account = await stripe.accounts.retrieve()

        diagnosis.connectionTest = {
          success: true,
          accountId: account.id,
          country: account.country,
          currency: account.default_currency,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        }

        console.log("✅ Stripe connection test successful")
      } catch (error: any) {
        diagnosis.connectionTest = {
          success: false,
          error: error.message,
        }
        console.error("❌ Stripe connection test failed:", error)
      }
    }

    // Generate recommendations
    if (!diagnosis.environment.secretKey.exists) {
      diagnosis.recommendations.push("Set STRIPE_SECRET_KEY environment variable")
    } else if (diagnosis.environment.secretKey.format === "INVALID") {
      diagnosis.recommendations.push("STRIPE_SECRET_KEY should start with sk_test_ or sk_live_")
    }

    if (!diagnosis.environment.publishableKey.exists) {
      diagnosis.recommendations.push("Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable")
    } else if (diagnosis.environment.publishableKey.format === "INVALID") {
      diagnosis.recommendations.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should start with pk_test_ or pk_live_")
    }

    if (!diagnosis.compatibility.keysMatch) {
      diagnosis.recommendations.push(
        "Secret key and publishable key must be from the same environment (both test or both live)",
      )
    }

    if (!diagnosis.environment.webhookSecret.exists) {
      diagnosis.recommendations.push("Set STRIPE_WEBHOOK_SECRET for webhook handling (recommended)")
    }

    if (!diagnosis.environment.priceId.exists) {
      diagnosis.recommendations.push("Set STRIPE_PRO_MONTHLY_PRICE_ID for subscription pricing")
    }

    if (diagnosis.connectionTest && !diagnosis.connectionTest.success) {
      diagnosis.recommendations.push("Check that your Stripe account is active and API keys are correct")
    }

    return NextResponse.json({
      status: "diagnosis_complete",
      diagnosis,
      nextSteps:
        diagnosis.recommendations.length > 0 ? diagnosis.recommendations : ["Stripe configuration looks good!"],
    })
  } catch (error: any) {
    console.error("❌ Stripe diagnosis failed:", error)
    return NextResponse.json(
      {
        status: "diagnosis_failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
