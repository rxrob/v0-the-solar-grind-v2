import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET() {
  try {
    // Test Stripe connection
    const account = await stripe.accounts.retrieve()

    const diagnostics = {
      stripe_connected: true,
      account_id: account.id,
      account_type: account.type,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      country: account.country,
      default_currency: account.default_currency,
      api_version: "2025-06-30.basil",
      environment: process.env.NODE_ENV,
      webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
      publishable_key_configured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secret_key_configured: !!process.env.STRIPE_SECRET_KEY,
    }

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error("Stripe diagnostics error:", error)
    return NextResponse.json(
      {
        stripe_connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        api_version: "2025-06-30.basil",
        environment: process.env.NODE_ENV,
        webhook_secret_configured: !!process.env.STRIPE_WEBHOOK_SECRET,
        publishable_key_configured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        secret_key_configured: !!process.env.STRIPE_SECRET_KEY,
      },
      { status: 500 },
    )
  }
}
