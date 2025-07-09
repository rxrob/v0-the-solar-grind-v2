import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export const dynamic = "force-dynamic"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function GET(request: NextRequest) {
  console.log("🔍 === VERIFY SESSION START ===")

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      console.log("❌ No session ID provided")
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    console.log("📋 Verifying session:", sessionId)

    // Retrieve the session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price", "customer", "payment_intent", "subscription"],
    })

    console.log("✅ Session retrieved successfully:")
    console.log("   - Session ID:", session.id)
    console.log("   - Status:", session.status)
    console.log("   - Payment Status:", session.payment_status)
    console.log("   - Mode:", session.mode)
    console.log("   - Customer Email:", session.customer_details?.email)
    console.log("   - Amount Total:", session.amount_total)
    console.log("   - Currency:", session.currency)

    // Determine purchase type from metadata or line items
    let purchaseType = session.metadata?.purchaseType

    if (!purchaseType && session.line_items?.data[0]) {
      const lineItem = session.line_items.data[0]
      const priceId = lineItem.price?.id

      if (priceId === "price_1RdGtXD80D06ku9UWRTdDUHh") {
        purchaseType = "single_report"
      } else if (priceId === "price_1RdGemD80D06ku9UO6X1lR35") {
        purchaseType = "subscription"
      }
    }

    console.log("📦 Purchase Details:")
    console.log("   - Purchase Type:", purchaseType)
    console.log("   - Line Items:", session.line_items?.data.length || 0)

    if (session.line_items?.data[0]) {
      const lineItem = session.line_items.data[0]
      console.log("   - Product Name:", lineItem.description)
      console.log("   - Price ID:", lineItem.price?.id)
      console.log("   - Amount:", lineItem.amount_total)
    }

    // Check if payment was successful
    const isSuccessful = session.payment_status === "paid"
    console.log("💳 Payment Status:", isSuccessful ? "✅ PAID" : "❌ NOT PAID")

    const responseData = {
      sessionId: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      mode: session.mode,
      purchaseType: purchaseType,
      customerEmail: session.customer_details?.email,
      customerName: session.customer_details?.name,
      amountTotal: session.amount_total,
      currency: session.currency,
      isSuccessful: isSuccessful,
      createdAt: new Date(session.created * 1000).toISOString(),
      lineItems:
        session.line_items?.data.map((item) => ({
          description: item.description,
          priceId: item.price?.id,
          amount: item.amount_total,
          quantity: item.quantity,
        })) || [],
    }

    console.log("📤 Response Data:", JSON.stringify(responseData, null, 2))
    console.log("✅ === VERIFY SESSION COMPLETE ===")

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("❌ === VERIFY SESSION ERROR ===")
    console.error("Error:", error)

    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 })
  }
}
