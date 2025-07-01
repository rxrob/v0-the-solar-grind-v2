import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get("input")

    if (!input) {
      return NextResponse.json({ error: "Missing input parameter" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=address&key=${apiKey}`

    console.log(`🔍 Places autocomplete: ${input}`)

    const response = await fetch(placesUrl)
    const data = await response.json()

    if (!response.ok) {
      console.error("Google Places API error:", response.status, data)
      return NextResponse.json({ error: `Places API error: ${response.status}` }, { status: response.status })
    }

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Places autocomplete failed:", data.status, data.error_message)
      return NextResponse.json({ error: `Places autocomplete failed: ${data.status}` }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      predictions: data.predictions || [],
      status: data.status,
    })
  } catch (error) {
    console.error("Places API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
