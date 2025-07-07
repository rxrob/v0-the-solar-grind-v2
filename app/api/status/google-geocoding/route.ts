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

    const response = await fetch(url, {
      headers: {
        "User-Agent": "MySolarAI-StatusCheck/1.0",
      },
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      console.error("Google Geocoding API error:", response.status, response.statusText)
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
          error: response.statusText,
        },
        timestamp: new Date().toISOString(),
        http_status: response.status,
      })
    }

    const data = await response.json()

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
          error_message: data.error_message || "Unknown API error",
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
        first_result: data.results?.[0]?.formatted_address || "No address found",
      },
      timestamp: new Date().toISOString(),
      http_status: 200,
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error("Google Geocoding status check error:", error)

    return NextResponse.json({
      name: "Google Geocoding API",
      category: "Google Services",
      endpoint: "/api/status/google-geocoding",
      critical: false,
      status: "error",
      message: `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      response_time: responseTime,
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      timestamp: new Date().toISOString(),
      http_status: 500,
    })
  }
}
