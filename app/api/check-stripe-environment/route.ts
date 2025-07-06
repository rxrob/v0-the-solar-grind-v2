import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    // Check if Stripe keys are configured
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY
    const secretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!publishableKey || !secretKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Stripe keys not configured",
          details: {
            publishableKey: !!publishableKey,
            secretKey: !!secretKey,
            webhookSecret: !!webhookSecret,
          },
        },
        { status: 500 },
      )
    }

    // Initialize Stripe with the correct API version
    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-06-30.basil",
    })

    // Test the connection
    const account = await stripe.accounts.retrieve()

    return NextResponse.json({
      success: true,
      data: {
        accountId: account.id,
        country: account.country,
        defaultCurrency: account.default_currency,
        detailsSubmitted: account.details_submitted,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
      },
      environment: {
        publishableKey: publishableKey.substring(0, 12) + "...",
        secretKey: secretKey.substring(0, 12) + "...",
        webhookSecret: !!webhookSecret,
      },
    })
  } catch (error) {
    console.error("Stripe environment check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
