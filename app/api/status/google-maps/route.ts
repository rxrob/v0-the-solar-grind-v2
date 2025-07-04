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
        const testResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${mapsApiKey}`,
        )
        const testData = await testResponse.json()

        status.apiTest = {
          success: testData.status === "OK",
          status: testData.status,
          error: testData.error_message || null,
        }
      } catch (error) {
        status.apiTest = {
          success: false,
          error: "Failed to test API key",
        }
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking Google Maps status:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to check Google Maps status",
        lastChecked: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
