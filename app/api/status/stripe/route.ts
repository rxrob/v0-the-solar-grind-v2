import { NextResponse } from "next/server"
import Stripe from "stripe"

export async function GET() {
  const startTime = Date.now()

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY

    if (!secretKey || !publishableKey) {
      return NextResponse.json({
        name: "Stripe Payments",
        category: "Payments",
        endpoint: "/api/status/stripe",
        critical: true,
        status: "error",
        message: "Stripe API keys not configured",
        response_time: Date.now() - startTime,
        details: {
          secret_key_configured: !!secretKey,
          publishable_key_configured: !!publishableKey,
          error: "STRIPE_SECRET_KEY or STRIPE_PUBLISHABLE_KEY not set",
        },
        timestamp: new Date().toISOString(),
        http_status: 500,
      })
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    })

    // Test by retrieving account information
    const account = await stripe.accounts.retrieve()
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      name: "Stripe Payments",
      category: "Payments",
      endpoint: "/api/status/stripe",
      critical: true,
      status: "healthy",
      message: "Stripe API connection successful",
      response_time: responseTime,
      details: {
        account_id: account.id,
        country: account.country,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        business_type: account.business_type,
      },
      timestamp: new Date().toISOString(),
      http_status: 200,
    })
  } catch (error) {
    const responseTime = Date.now() - startTime

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({
        name: "Stripe Payments",
        category: "Payments",
        endpoint: "/api/status/stripe",
        critical: true,
        status: "error",
        message: `Stripe API error: ${error.message}`,
        response_time: responseTime,
        details: {
          error_type: error.type,
          error_code: error.code,
          error_message: error.message,
        },
        timestamp: new Date().toISOString(),
        http_status: error.statusCode || 500,
      })
    }

    return NextResponse.json({
      name: "Stripe Payments",
      category: "Payments",
      endpoint: "/api/status/stripe",
      critical: true,
      status: "error",
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      response_time: responseTime,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
      http_status: 500,
    })
  }
}
