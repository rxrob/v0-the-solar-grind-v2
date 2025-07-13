import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return only the API key from server-side environment
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    return NextResponse.json({
      apiKey,
      libraries: ["places", "geometry", "drawing"],
    })
  } catch (error) {
    console.error("Maps config error:", error)
    return NextResponse.json({ error: "Failed to get maps configuration" }, { status: 500 })
  }
}
