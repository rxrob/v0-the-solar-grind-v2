import { NextResponse } from "next/server"

export async function GET() {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const secretKey = process.env.STRIPE_SECRET_KEY
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const proMonthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
    const singleReportPriceId = process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID

    const status = {
      configured: !!(publishableKey && secretKey),
      publishableKey: publishableKey ? "Set" : "Missing",
      secretKey: secretKey ? "Set" : "Missing",
      webhookSecret: webhookSecret ? "Set" : "Missing",
      proMonthlyPriceId: proMonthlyPriceId ? "Set" : "Missing",
      singleReportPriceId: singleReportPriceId ? "Set" : "Missing",
      lastChecked: new Date().toISOString(),
    }

    // Test API key if available
    if (secretKey) {
      try {
        const testResponse = await fetch("https://api.stripe.com/v1/customers?limit=1", {
          headers: {
            Authorization: `Bearer ${secretKey}`,
          },
        })

        status.apiTest = {
          success: testResponse.ok,
          status: testResponse.status,
          error: testResponse.ok ? null : "API key test failed",
        }
      } catch (error) {
        status.apiTest = {
          success: false,
          error: "Failed to test API key",
        }
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking Stripe status:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to check Stripe status",
        lastChecked: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
