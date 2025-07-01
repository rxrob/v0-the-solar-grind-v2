import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()

  try {
    const apiKey = process.env.GOOGLE_ELEVATION_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        name: "Google Elevation API",
        category: "Google Services",
        endpoint: "/api/status/google-elevation",
        critical: false,
        status: "error",
        message: "Google Elevation API key not configured",
        response_time: Date.now() - startTime,
        details: {
          error: "GOOGLE_ELEVATION_API_KEY environment variable not set",
        },
        timestamp: new Date().toISOString(),
        http_status: 500,
      })
    }

    // Test with Mount Everest coordinates
    const lat = 27.9881
    const lng = 86.925
    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()
    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return NextResponse.json({
        name: "Google Elevation API",
        category: "Google Services",
        endpoint: "/api/status/google-elevation",
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
        name: "Google Elevation API",
        category: "Google Services",
        endpoint: "/api/status/google-elevation",
        critical: false,
        status: "error",
        message: `Elevation request failed: ${data.status}`,
        response_time: responseTime,
        details: {
          api_status: data.status,
          error_message: data.error_message,
        },
        timestamp: new Date().toISOString(),
        http_status: 400,
      })
    }

    const elevation = data.results?.[0]?.elevation

    return NextResponse.json({
      name: "Google Elevation API",
      category: "Google Services",
      endpoint: "/api/status/google-elevation",
      critical: false,
      status: "healthy",
      message: "Elevation API working correctly",
      response_time: responseTime,
      details: {
        test_location: "Mount Everest",
        coordinates: `${lat}, ${lng}`,
        elevation_meters: elevation ? Math.round(elevation) : null,
        api_status: data.status,
      },
      timestamp: new Date().toISOString(),
      http_status: 200,
    })
  } catch (error) {
    return NextResponse.json({
      name: "Google Elevation API",
      category: "Google Services",
      endpoint: "/api/status/google-elevation",
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
