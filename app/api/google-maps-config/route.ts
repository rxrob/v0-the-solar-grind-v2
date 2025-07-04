import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API not configured" }, { status: 500 })
    }

    // Return configuration for Google Maps
    return NextResponse.json({
      apiKey,
      libraries: ["places", "geometry"],
      version: "weekly",
      region: "US",
      language: "en",
    })
  } catch (error) {
    console.error("Error getting Google Maps config:", error)
    return NextResponse.json({ error: "Failed to get Google Maps configuration" }, { status: 500 })
  }
}
