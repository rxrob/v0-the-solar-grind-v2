import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        configured: false,
        error: "Google Maps API key not configured",
      })
    }

    return NextResponse.json({
      configured: true,
      apiKey: apiKey,
    })
  } catch (error) {
    console.error("Error checking Google Maps config:", error)
    return NextResponse.json({
      configured: false,
      error: "Failed to check Google Maps configuration",
    })
  }
}
