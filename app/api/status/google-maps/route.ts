import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        name: "Google Maps API",
        category: "Google Services",
        endpoint: "/api/status/google-maps",
        critical: true,
        status: "error",
        message: "Google Maps API key not configured",
        response_time: Date.now() - startTime,
        details: {
          error: "GOOGLE_MAPS_API_KEY environment variable not set",
        },
        timestamp: new Date().toISOString(),
        http_status: 500,
      })
    }

    // Test with Google HQ address
    const testAddress = "1600 Amphitheatre Parkway, Mountain View, CA"
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()
    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return NextResponse.json({
        name: "Google Maps API",
        category: "Google Services",
        endpoint: "/api/status/google-maps",
        critical: true,
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
        name: "Google Maps API",
        category: "Google Services",
        endpoint: "/api/status/google-maps",
        critical: true,
        status: "error",
        message: `Geocoding failed: ${data.status}`,
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
      name: "Google Maps API",
      category: "Google Services",
      endpoint: "/api/status/google-maps",
      critical: true,
      status: "healthy",
      message: "Geocoding API working correctly",
      response_time: responseTime,
      details: {
        test_address: testAddress,
        results_count: data.results?.length || 0,
        api_status: data.status,
      },
      timestamp: new Date().toISOString(),
      http_status: 200,
    })
  } catch (error) {
    return NextResponse.json({
      name: "Google Maps API",
      category: "Google Services",
      endpoint: "/api/status/google-maps",
      critical: true,
      status: "error",
      message: `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      response_time: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
      http_status: 500,
    })
  }
}
