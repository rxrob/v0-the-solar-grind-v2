import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only return configuration status, not actual keys
    const hasGoogleMapsKey = !!process.env.GOOGLE_MAPS_API_KEY
    const hasGeocodingKey = !!process.env.GOOGLE_GEOCODING_API_KEY
    const hasElevationKey = !!process.env.GOOGLE_ELEVATION_API_KEY

    return NextResponse.json({
      success: true,
      config: {
        googleMaps: hasGoogleMapsKey ? "Configured" : "Missing",
        geocoding: hasGeocodingKey ? "Configured" : "Missing",
        elevation: hasElevationKey ? "Configured" : "Missing",
        isConfigured: hasGoogleMapsKey && hasGeocodingKey && hasElevationKey,
      },
    })
  } catch (error) {
    console.error("Google Maps config error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check Google Maps configuration",
        config: {
          googleMaps: "Error",
          geocoding: "Error",
          elevation: "Error",
          isConfigured: false,
        },
      },
      { status: 500 },
    )
  }
}
