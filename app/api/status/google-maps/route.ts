import { NextResponse } from "next/server"

export async function GET() {
  try {
    const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY
    const geocodingApiKey = process.env.GOOGLE_GEOCODING_API_KEY
    const elevationApiKey = process.env.GOOGLE_ELEVATION_API_KEY

    const status = {
      configured: !!mapsApiKey,
      mapsApiKey: mapsApiKey ? "Set" : "Missing",
      geocodingApiKey: geocodingApiKey ? "Set" : "Missing",
      elevationApiKey: elevationApiKey ? "Set" : "Missing",
      configEndpoint: "/api/google-maps-config",
      lastChecked: new Date().toISOString(),
    }

    // Test API key if available
    if (mapsApiKey) {
      try {
        console.log("🧪 Testing Google Maps API key...")

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const testResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${mapsApiKey}`,
          {
            signal: controller.signal,
            headers: {
              "User-Agent": "Solar-App-Status-Check/1.0",
            },
          },
        )

        clearTimeout(timeoutId)

        if (!testResponse.ok) {
          console.error("Google Maps API test failed:", testResponse.status, testResponse.statusText)
          status.apiTest = {
            success: false,
            status: `HTTP ${testResponse.status}`,
            error: `HTTP error: ${testResponse.status} ${testResponse.statusText}`,
            timestamp: new Date().toISOString(),
          }
        } else {
          const testData = await testResponse.json()

          console.log("✅ Google Maps API test result:", testData.status)

          status.apiTest = {
            success: testData.status === "OK",
            status: testData.status,
            error: testData.error_message || null,
            results_count: testData.results?.length || 0,
            timestamp: new Date().toISOString(),
          }

          if (testData.status === "OK" && testData.results?.length > 0) {
            status.apiTest.sample_result = {
              formatted_address: testData.results[0].formatted_address,
              location: testData.results[0].geometry?.location,
            }
          }
        }
      } catch (error) {
        console.error("Google Maps API test error:", error)

        if (error.name === "AbortError") {
          status.apiTest = {
            success: false,
            error: "Request timeout - API took too long to respond",
            timeout: "10 seconds",
            timestamp: new Date().toISOString(),
          }
        } else {
          status.apiTest = {
            success: false,
            error: error instanceof Error ? error.message : "Failed to test API key",
            error_type: error.constructor.name,
            timestamp: new Date().toISOString(),
          }
        }
      }
    } else {
      status.apiTest = {
        success: false,
        error: "No API key configured",
        timestamp: new Date().toISOString(),
      }
    }

    // Add service health summary
    const healthScore = status.apiTest?.success ? 100 : 0
    status.health = {
      score: healthScore,
      status: healthScore === 100 ? "healthy" : "unhealthy",
      message:
        healthScore === 100 ? "All Google Maps services operational" : "Google Maps API configuration issues detected",
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking Google Maps status:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to check Google Maps status",
        details: {
          error_type: error.constructor.name,
          message: error instanceof Error ? error.message : "Unknown error",
        },
        health: {
          score: 0,
          status: "unhealthy",
          message: "Status check failed",
        },
        lastChecked: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
