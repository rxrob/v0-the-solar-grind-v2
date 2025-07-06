import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!secretKey) {
      return NextResponse.json({
        success: false,
        error: "STRIPE_SECRET_KEY is not configured",
        details: {
          secretKey: false,
          publishableKey: !!publishableKey,
          webhookSecret: !!webhookSecret,
        },
      })
    }

    if (!publishableKey) {
      return NextResponse.json({
        success: false,
        error: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured",
        details: {
          secretKey: true,
          publishableKey: false,
          webhookSecret: !!webhookSecret,
        },
      })
    }

    // Test Stripe connection
    const stripe = new Stripe(secretKey)

    try {
      const account = await stripe.accounts.retrieve()

      return NextResponse.json({
        success: true,
        message: "Stripe environment is properly configured",
        details: {
          secretKey: true,
          publishableKey: true,
          webhookSecret: !!webhookSecret,
          accountId: account.id,
          country: account.country,
          currency: account.default_currency,
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        },
      })
    } catch (stripeError: any) {
      return NextResponse.json({
        success: false,
        error: "Failed to connect to Stripe",
        details: {
          secretKey: true,
          publishableKey: true,
          webhookSecret: !!webhookSecret,
          stripeError: stripeError.message,
        },
      })
    }
  } catch (error: any) {
    console.error("Stripe environment check error:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to check Stripe environment",
      details: {
        error: error.message,
      },
    })
  }
}
