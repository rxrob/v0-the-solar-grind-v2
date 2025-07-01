import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Missing address parameter" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Geocoding API key not configured" }, { status: 500 })
    }

    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`

    console.log(`🗺️ Geocoding address: ${address}`)

    const response = await fetch(geocodingUrl)
    const data = await response.json()

    if (!response.ok) {
      console.error("Google Geocoding API error:", response.status, data)
      return NextResponse.json({ error: `Geocoding API error: ${response.status}` }, { status: response.status })
    }

    if (data.status !== "OK") {
      console.error("Geocoding failed:", data.status, data.error_message)
      return NextResponse.json({ error: `Geocoding failed: ${data.status}` }, { status: 400 })
    }

    const result = data.results[0]
    if (!result) {
      return NextResponse.json({ error: "No results found for address" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      address: result.formatted_address,
      coordinates: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      placeId: result.place_id,
      components: result.address_components,
    })
  } catch (error) {
    console.error("Geocoding API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
