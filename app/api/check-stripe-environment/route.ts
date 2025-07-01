import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    console.log("🔍 === STRIPE ENVIRONMENT CHECK ===")

    // Check environment variables
    const secretKey = process.env.STRIPE_SECRET_KEY
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

    console.log("📋 Environment Variables:")
    console.log("   - Secret Key Present:", !!secretKey)
    console.log("   - Publishable Key Present:", !!publishableKey)

    if (!secretKey || !publishableKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Stripe keys",
        details: {
          hasSecretKey: !!secretKey,
          hasPublishableKey: !!publishableKey,
        },
      })
    }

    // Determine key types
    const secretKeyType = secretKey.includes("_test_") ? "test" : secretKey.includes("_live_") ? "live" : "unknown"
    const publishableKeyType = publishableKey.includes("_test_")
      ? "test"
      : publishableKey.includes("_live_")
        ? "live"
        : "unknown"

    console.log("🔑 Key Types:")
    console.log("   - Secret Key Type:", secretKeyType)
    console.log("   - Publishable Key Type:", publishableKeyType)
    console.log("   - Secret Key Prefix:", secretKey.substring(0, 12) + "...")
    console.log("   - Publishable Key Prefix:", publishableKey.substring(0, 12) + "...")

    // Check for mismatch
    const keyMismatch = secretKeyType !== publishableKeyType
    if (keyMismatch) {
      console.log("❌ KEY MISMATCH DETECTED!")
      console.log("   - Secret key is:", secretKeyType)
      console.log("   - Publishable key is:", publishableKeyType)
    }

    // Initialize Stripe and test connection
    const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" })

    let accountInfo = null
    let accountError = null

    try {
      accountInfo = await stripe.accounts.retrieve()
      console.log("✅ Stripe Account Retrieved:")
      console.log("   - Account ID:", accountInfo.id)
      console.log("   - Country:", accountInfo.country)
      console.log("   - Charges Enabled:", accountInfo.charges_enabled)
      console.log("   - Details Submitted:", accountInfo.details_submitted)
    } catch (error) {
      accountError = error instanceof Error ? error.message : "Unknown error"
      console.log("❌ Failed to retrieve account:", accountError)
    }

    // Test the specific price IDs
    const priceIds = [
      "price_1RdGtXD80D06ku9UWRTdDUHh", // Single Report
      "price_1RdGemD80D06ku9UO6X1lR35", // Professional
    ]

    const priceTests = []

    for (const priceId of priceIds) {
      try {
        console.log(`🔍 Testing price: ${priceId}`)
        const price = await stripe.prices.retrieve(priceId)
        console.log(`✅ Price ${priceId} found:`)
        console.log(`   - Active: ${price.active}`)
        console.log(`   - Amount: ${price.unit_amount}`)
        console.log(`   - Currency: ${price.currency}`)
        console.log(`   - Live Mode: ${price.livemode}`)

        priceTests.push({
          priceId,
          exists: true,
          active: price.active,
          amount: price.unit_amount,
          currency: price.currency,
          livemode: price.livemode,
          error: null,
        })
      } catch (error) {
        console.log(`❌ Price ${priceId} error:`, error)
        priceTests.push({
          priceId,
          exists: false,
          active: false,
          amount: null,
          currency: null,
          livemode: null,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    console.log("✅ === STRIPE ENVIRONMENT CHECK COMPLETE ===")

    return NextResponse.json({
      success: true,
      environment: {
        secretKeyType,
        publishableKeyType,
        keyMismatch,
        secretKeyPrefix: secretKey.substring(0, 12) + "...",
        publishableKeyPrefix: publishableKey.substring(0, 12) + "...",
      },
      account: accountInfo
        ? {
            id: accountInfo.id,
            country: accountInfo.country,
            chargesEnabled: accountInfo.charges_enabled,
            detailsSubmitted: accountInfo.details_submitted,
          }
        : null,
      accountError,
      priceTests,
      recommendations: {
        keyMismatch: keyMismatch
          ? [
              `Your secret key is ${secretKeyType} but publishable key is ${publishableKeyType}`,
              "Both keys must be the same type (both test or both live)",
              secretKeyType === "live" ? "Switch to test keys for development" : "Switch to live keys for production",
            ]
          : [],
        priceIssues: priceTests
          .filter((test) => !test.exists)
          .map((test) => `Price ${test.priceId} doesn't exist in your ${secretKeyType} Stripe account`),
        inactivePrices: priceTests
          .filter((test) => test.exists && !test.active)
          .map((test) => `Price ${test.priceId} exists but is inactive`),
      },
    })
  } catch (error) {
    console.error("💥 Environment check failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
