import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET() {
  try {
    // Test basic Stripe connection
    const account = await stripe.accounts.retrieve()

    return NextResponse.json({
      status: "operational",
      service: "Stripe",
      details: {
        account_id: account.id,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        api_version: "2025-06-30.basil",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Stripe status check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        service: "Stripe",
        error: error instanceof Error ? error.message : "Unknown error",
        api_version: "2025-06-30.basil",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
