import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET() {
  try {
    const checks = {
      stripe_secret_key: !!process.env.STRIPE_SECRET_KEY,
      stripe_publishable_key: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripe_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
      stripe_pro_monthly_price_id: !!process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      stripe_single_report_price_id: !!process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID,
      api_version: "2025-06-30.basil",
    }

    // Test Stripe connection
    let stripe_connection_test = false
    let stripe_error = null

    try {
      await stripe.accounts.retrieve()
      stripe_connection_test = true
    } catch (error) {
      stripe_error = error instanceof Error ? error.message : "Unknown error"
    }

    return NextResponse.json({
      ...checks,
      stripe_connection_test,
      stripe_error,
      all_configured: Object.values(checks).every(Boolean) && stripe_connection_test,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to check environment",
        api_version: "2025-06-30.basil",
      },
      { status: 500 },
    )
  }
}
