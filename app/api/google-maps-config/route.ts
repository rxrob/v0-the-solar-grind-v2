import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only check if keys exist, don't return actual values
    const hasGoogleMapsKey = !!process.env.GOOGLE_MAPS_API_KEY
    const hasGeocodingKey = !!process.env.GOOGLE_GEOCODING_API_KEY
    const hasElevationKey = !!process.env.GOOGLE_ELEVATION_API_KEY

    return NextResponse.json({
      configured: hasGoogleMapsKey && hasGeocodingKey && hasElevationKey,
      services: {
        maps: hasGoogleMapsKey,
        geocoding: hasGeocodingKey,
        elevation: hasElevationKey,
      },
      message:
        hasGoogleMapsKey && hasGeocodingKey && hasElevationKey
          ? "Google Maps services are configured"
          : "Some Google Maps services are not configured",
    })
  } catch (error) {
    console.error("Google Maps config error:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to check Google Maps configuration",
      },
      { status: 500 },
    )
  }
}
