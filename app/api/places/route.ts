import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get("input")

    if (!input) {
      return NextResponse.json({ error: "Missing input parameter" }, { status: 400 })
    }

    if (input.length < 2) {
      return NextResponse.json({ error: "Input must be at least 2 characters" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const placesUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input,
    )}&types=address&key=${apiKey}`

    console.log(`🔍 Places autocomplete: ${input}`)

    const response = await fetch(placesUrl, {
      headers: {
        "User-Agent": "MySolarAI/1.0",
      },
    })

    if (!response.ok) {
      console.error("Google Places API error:", response.status, response.statusText)
      return NextResponse.json({ error: `Places API error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Places autocomplete failed:", data.status, data.error_message)
      return NextResponse.json(
        {
          error: `Places autocomplete failed: ${data.status}`,
          details: data.error_message || "Unknown API error",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      predictions: data.predictions || [],
      status: data.status,
      count: data.predictions?.length || 0,
    })
  } catch (error) {
    console.error("Places API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch place suggestions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
