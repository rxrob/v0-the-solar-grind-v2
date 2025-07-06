import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  try {
    // Check if Stripe keys are configured
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const secretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!publishableKey || !secretKey) {
      return NextResponse.json({
        success: false,
        error: "Stripe keys not configured",
        details: {
          publishableKey: !!publishableKey,
          secretKey: !!secretKey,
          webhookSecret: !!webhookSecret,
        },
      })
    }

    // Initialize Stripe with correct API version
    const stripe = new Stripe(secretKey, {
      apiVersion: "2023-10-16",
    })

    // Test the connection
    try {
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
        },
      })
    } catch (stripeError: any) {
      return NextResponse.json({
        success: false,
        error: "Stripe API connection failed",
        details: {
          publishableKey: !!publishableKey,
          secretKey: !!secretKey,
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
      details: error.message,
    })
  }
}
