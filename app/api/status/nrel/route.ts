import { NextResponse } from "next/server"

export async function GET() {
  const startTime = Date.now()

  try {
    const apiKey = process.env.NREL_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        name: "NREL Solar API",
        category: "Solar Data",
        endpoint: "/api/status/nrel",
        critical: true,
        status: "error",
        message: "NREL API key not configured",
        response_time: Date.now() - startTime,
        details: {
          error: "NREL_API_KEY environment variable not set",
        },
        timestamp: new Date().toISOString(),
        http_status: 500,
      })
    }

    // Test with Denver, CO coordinates
    const lat = 39.7392
    const lng = -104.9903
    const url = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${apiKey}&lat=${lat}&lon=${lng}`

    const response = await fetch(url)
    const data = await response.json()
    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return NextResponse.json({
        name: "NREL Solar API",
        category: "Solar Data",
        endpoint: "/api/status/nrel",
        critical: true,
        status: "error",
        message: `API request failed: ${response.status}`,
        response_time: responseTime,
        details: {
          http_status: response.status,
          error: data.error || "Unknown error",
        },
        timestamp: new Date().toISOString(),
        http_status: response.status,
      })
    }

    if (data.errors && data.errors.length > 0) {
      return NextResponse.json({
        name: "NREL Solar API",
        category: "Solar Data",
        endpoint: "/api/status/nrel",
        critical: true,
        status: "error",
        message: `NREL API error: ${data.errors[0]}`,
        response_time: responseTime,
        details: {
          errors: data.errors,
        },
        timestamp: new Date().toISOString(),
        http_status: 400,
      })
    }

    const avgGhi = data.outputs?.avg_ghi?.annual

    return NextResponse.json({
      name: "NREL Solar API",
      category: "Solar Data",
      endpoint: "/api/status/nrel",
      critical: true,
      status: "healthy",
      message: "Solar resource data API working correctly",
      response_time: responseTime,
      details: {
        test_location: "Denver, CO",
        coordinates: `${lat}, ${lng}`,
        annual_ghi: avgGhi ? `${avgGhi} kWh/m²/day` : null,
        data_available: !!data.outputs,
      },
      timestamp: new Date().toISOString(),
      http_status: 200,
    })
  } catch (error) {
    return NextResponse.json({
      name: "NREL Solar API",
      category: "Solar Data",
      endpoint: "/api/status/nrel",
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
