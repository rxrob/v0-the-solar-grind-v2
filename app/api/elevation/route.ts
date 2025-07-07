import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json(
      {
        success: false,
        error: "Latitude and longitude parameters are required",
        details: { lat, lng },
      },
      { status: 400 },
    )
  }

  // Validate coordinate ranges
  const latitude = Number.parseFloat(lat)
  const longitude = Number.parseFloat(lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid coordinate format",
        details: { lat, lng },
      },
      { status: 400 },
    )
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json(
      {
        success: false,
        error: "Coordinates out of valid range",
        details: { lat: latitude, lng: longitude, valid_range: "lat: -90 to 90, lng: -180 to 180" },
      },
      { status: 400 },
    )
  }

  try {
    const apiKey = process.env.GOOGLE_ELEVATION_API_KEY
    if (!apiKey) {
      console.error("Google Elevation API key not configured")
      return NextResponse.json(
        {
          success: false,
          error: "Google Elevation API key not configured",
          details: { service: "Google Elevation API" },
        },
        { status: 500 },
      )
    }

    const elevationUrl = `https://maps.googleapis.com/maps/api/elevation/json?locations=${latitude},${longitude}&key=${apiKey}`

    console.log(`🏔️ Fetching elevation for coordinates: ${latitude}, ${longitude}`)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(elevationUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Solar-App-Elevation/1.0",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error("Google Elevation API HTTP error:", response.status, response.statusText)
      return NextResponse.json(
        {
          success: false,
          error: `Google Elevation API HTTP error: ${response.status}`,
          details: { status: response.status, statusText: response.statusText },
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    if (data.status !== "OK") {
      console.error("Google Elevation API error:", data.status, data.error_message)
      return NextResponse.json(
        {
          success: false,
          error: data.error_message || `Google Elevation API error: ${data.status}`,
          details: { api_status: data.status, coordinates: { lat: latitude, lng: longitude } },
        },
        { status: data.status === "INVALID_REQUEST" ? 400 : 500 },
      )
    }

    if (!data.results || data.results.length === 0) {
      console.warn("No elevation data found for coordinates:", latitude, longitude)
      return NextResponse.json(
        {
          success: false,
          error: "No elevation data found for the specified coordinates",
          details: { coordinates: { lat: latitude, lng: longitude } },
        },
        { status: 404 },
      )
    }

    const elevation = data.results[0].elevation
    const resolution = data.results[0].resolution

    console.log(`✅ Elevation retrieved: ${elevation}m (resolution: ${resolution}m)`)

    return NextResponse.json({
      success: true,
      results: [
        {
          elevation: Math.round(elevation * 100) / 100, // Round to 2 decimal places
          elevation_feet: Math.round(elevation * 3.28084 * 100) / 100,
          resolution: resolution,
          location: {
            lat: latitude,
            lng: longitude,
          },
        },
      ],
      metadata: {
        source: "Google Elevation API",
        timestamp: new Date().toISOString(),
        units: {
          elevation: "meters",
          elevation_feet: "feet",
          resolution: "meters",
        },
      },
    })
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Google Elevation API timeout")
      return NextResponse.json(
        {
          success: false,
          error: "Request timeout - Google Elevation API took too long to respond",
          details: { timeout: "10 seconds" },
        },
        { status: 408 },
      )
    }

    console.error("Elevation API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch elevation data",
        details: {
          error_type: error.constructor.name,
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
