import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Only send to Axiom if analytics are enabled
    if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "true" || !process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT) {
      return NextResponse.json({ success: true, message: "Analytics disabled" })
    }

    // Get client IP and user agent
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    // Prepare data for Axiom
    const axiomData = {
      ...body,
      ip,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
      source: "web",
    }

    // Send to Axiom
    const axiomResponse = await fetch(process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AXIOM_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([axiomData]),
    })

    if (!axiomResponse.ok) {
      console.error("Axiom ingest failed:", await axiomResponse.text())
      return NextResponse.json({ success: false, error: "Failed to send to Axiom" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
