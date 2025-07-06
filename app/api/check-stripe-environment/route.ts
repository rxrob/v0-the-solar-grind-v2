import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET(request: NextRequest) {
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

    // Test the connection by retrieving account information
    const account = await stripe.accounts.retrieve()

    return NextResponse.json({
      success: true,
      message: "Stripe environment configured correctly",
      details: {
        publishableKey: !!publishableKey,
        secretKey: !!secretKey,
        webhookSecret: !!webhookSecret,
        accountId: account.id,
        country: account.country,
        currency: account.default_currency,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
    })
  } catch (error) {
    console.error("Stripe environment check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to Stripe",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
