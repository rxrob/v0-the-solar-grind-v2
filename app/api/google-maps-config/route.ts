import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only return configuration status, not actual API keys
    const isConfigured = !!process.env.GOOGLE_MAPS_API_KEY

    return NextResponse.json({
      configured: isConfigured,
      status: isConfigured ? "ready" : "not_configured",
    })
  } catch (error) {
    console.error("Error checking Google Maps config:", error)
    return NextResponse.json({ error: "Failed to check configuration" }, { status: 500 })
  }
}
