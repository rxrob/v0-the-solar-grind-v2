import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat or lng parameters" }, { status: 400 })
  }

  try {
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Geocoding API key not configured" }, { status: 500 })
    }

    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`)

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json({ error: "No results found" }, { status: 404 })
    }

    const result = data.results[0]
    const addressComponents = result.address_components

    let city = ""
    let state = ""
    let country = ""

    for (const component of addressComponents) {
      if (component.types.includes("locality")) {
        city = component.long_name
      } else if (component.types.includes("administrative_area_level_1")) {
        state = component.short_name
      } else if (component.types.includes("country")) {
        country = component.short_name
      }
    }

    return NextResponse.json({
      city,
      state,
      country,
      formatted_address: result.formatted_address,
    })
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json({ error: "Failed to geocode location" }, { status: 500 })
  }
}
