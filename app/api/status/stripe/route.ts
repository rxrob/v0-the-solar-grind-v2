import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function GET() {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const proMonthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
    const singleReportPriceId = process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID

    // Check environment variables
    const envCheck = {
      secretKey: {
        exists: typeof stripeSecretKey === "string" && stripeSecretKey.length > 0,
        valid: typeof stripeSecretKey === "string" && stripeSecretKey.startsWith("sk_"),
        value: stripeSecretKey ? `${stripeSecretKey.substring(0, 20)}...` : "Not set",
      },
      publishableKey: {
        exists: typeof stripePublishableKey === "string" && stripePublishableKey.length > 0,
        valid: typeof stripePublishableKey === "string" && stripePublishableKey.startsWith("pk_"),
        value: stripePublishableKey ? `${stripePublishableKey.substring(0, 20)}...` : "Not set",
      },
      webhookSecret: {
        exists: typeof stripeWebhookSecret === "string" && stripeWebhookSecret.length > 0,
        valid: typeof stripeWebhookSecret === "string" && stripeWebhookSecret.startsWith("whsec_"),
        value: stripeWebhookSecret ? `${stripeWebhookSecret.substring(0, 20)}...` : "Not set",
      },
      proMonthlyPriceId: {
        exists: typeof proMonthlyPriceId === "string" && proMonthlyPriceId.length > 0,
        valid: typeof proMonthlyPriceId === "string" && proMonthlyPriceId.startsWith("price_"),
        value: proMonthlyPriceId ? `${proMonthlyPriceId.substring(0, 20)}...` : "Not set",
      },
      singleReportPriceId: {
        exists: typeof singleReportPriceId === "string" && singleReportPriceId.length > 0,
        valid: typeof singleReportPriceId === "string" && singleReportPriceId.startsWith("price_"),
        value: singleReportPriceId ? `${singleReportPriceId.substring(0, 20)}...` : "Not set",
      },
    }

    // Test Stripe connection
    let connectionTest = null
    let priceValidation = null

    if (envCheck.secretKey.valid) {
      try {
        const account = await stripe.accounts.retrieve()
        connectionTest = {
          success: true,
          account: {
            id: account.id,
            country: account.country,
            default_currency: account.default_currency,
          },
          timestamp: new Date().toISOString(),
        }

        // Test price retrieval
        if (envCheck.proMonthlyPriceId.valid && envCheck.singleReportPriceId.valid) {
          try {
            const [proPrice, singlePrice] = await Promise.all([
              stripe.prices.retrieve(proMonthlyPriceId!),
              stripe.prices.retrieve(singleReportPriceId!),
            ])

            priceValidation = {
              success: true,
              prices: {
                pro: {
                  id: proPrice.id,
                  amount: proPrice.unit_amount,
                  currency: proPrice.currency,
                  type: proPrice.type,
                },
                single: {
                  id: singlePrice.id,
                  amount: singlePrice.unit_amount,
                  currency: singlePrice.currency,
                  type: singlePrice.type,
                },
              },
            }
          } catch (error) {
            priceValidation = {
              success: false,
              error: error instanceof Error ? error.message : "Price validation failed",
            }
          }
        }
      } catch (error) {
        connectionTest = {
          success: false,
          error: error instanceof Error ? error.message : "Connection failed",
          timestamp: new Date().toISOString(),
        }
      }
    }

    return NextResponse.json({
      status: "success",
      environment: envCheck,
      connection: connectionTest,
      prices: priceValidation,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
