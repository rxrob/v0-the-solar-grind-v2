import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET() {
  try {
    // Test Stripe connection by retrieving account info
    const account = await stripe.accounts.retrieve()

    return NextResponse.json({
      service: "Stripe",
      status: "operational",
      details: {
        connected: true,
        accountId: account.id,
        country: account.country,
        currency: account.default_currency,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Stripe status check error:", error)

    return NextResponse.json(
      {
        service: "Stripe",
        status: "error",
        details: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
