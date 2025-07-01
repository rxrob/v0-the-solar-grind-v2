import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()

  try {
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        name: "Google Geocoding API",
        category: "Google Services",
        endpoint: "/api/status/google-geocoding",
        critical: false,
        status: "error",
        message: "Google Geocoding API key not configured",
        response_time: Date.now() - startTime,
        details: {
          error: "GOOGLE_GEOCODING_API_KEY environment variable not set",
        },
        timestamp: new Date().toISOString(),
        http_status: 500,
      })
    }

    // Test reverse geocoding with known coordinates (Google HQ)
    const lat = 37.4224764
    const lng = -122.0842499
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()
    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return NextResponse.json({
        name: "Google Geocoding API",
        category: "Google Services",
        endpoint: "/api/status/google-geocoding",
        critical: false,
        status: "error",
        message: `API request failed: ${response.status}`,
        response_time: responseTime,
        details: {
          http_status: response.status,
          error: data.error_message || "Unknown error",
        },
        timestamp: new Date().toISOString(),
        http_status: response.status,
      })
    }

    if (data.status !== "OK") {
      return NextResponse.json({
        name: "Google Geocoding API",
        category: "Google Services",
        endpoint: "/api/status/google-geocoding",
        critical: false,
        status: "error",
        message: `Reverse geocoding failed: ${data.status}`,
        response_time: responseTime,
        details: {
          api_status: data.status,
          error_message: data.error_message,
        },
        timestamp: new Date().toISOString(),
        http_status: 400,
      })
    }

    return NextResponse.json({
      name: "Google Geocoding API",
      category: "Google Services",
      endpoint: "/api/status/google-geocoding",
      critical: false,
      status: "healthy",
      message: "Reverse geocoding working correctly",
      response_time: responseTime,
      details: {
        test_coordinates: `${lat}, ${lng}`,
        results_count: data.results?.length || 0,
        api_status: data.status,
      },
      timestamp: new Date().toISOString(),
      http_status: 200,
    })
  } catch (error) {
    return NextResponse.json({
      name: "Google Geocoding API",
      category: "Google Services",
      endpoint: "/api/status/google-geocoding",
      critical: false,
      status: "error",
      message: `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      response_time: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
      http_status: 500,
    })
  }
}
