import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if Google Maps API key is configured (but don't expose it)
    const isGoogleMapsConfigured = !!process.env.GOOGLE_MAPS_API_KEY
    const isGeocodingConfigured = !!process.env.GOOGLE_GEOCODING_API_KEY
    const isElevationConfigured = !!process.env.GOOGLE_ELEVATION_API_KEY

    return NextResponse.json({
      googleMaps: {
        configured: isGoogleMapsConfigured,
        status: isGoogleMapsConfigured ? "available" : "not configured",
      },
      geocoding: {
        configured: isGeocodingConfigured,
        status: isGeocodingConfigured ? "available" : "not configured",
      },
      elevation: {
        configured: isElevationConfigured,
        status: isElevationConfigured ? "available" : "not configured",
      },
    })
  } catch (error) {
    console.error("Error checking Google Maps configuration:", error)
    return NextResponse.json({ error: "Failed to check configuration" }, { status: 500 })
  }
}
