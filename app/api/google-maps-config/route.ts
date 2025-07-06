import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only check for server-side keys, don't expose any sensitive information
    const hasServerMapsKey = !!process.env.GOOGLE_MAPS_API_KEY
    const hasGeocodingKey = !!process.env.GOOGLE_GEOCODING_API_KEY
    const hasElevationKey = !!process.env.GOOGLE_ELEVATION_API_KEY

    return NextResponse.json({
      success: true,
      services: {
        maps: hasServerMapsKey ? "configured" : "missing",
        geocoding: hasGeocodingKey ? "configured" : "missing",
        elevation: hasElevationKey ? "configured" : "missing",
      },
      allConfigured: hasServerMapsKey && hasGeocodingKey && hasElevationKey,
      message: "Google Maps configuration status checked",
    })
  } catch (error) {
    console.error("Google Maps config error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check Google Maps configuration",
        services: {
          maps: "error",
          geocoding: "error",
          elevation: "error",
        },
        allConfigured: false,
      },
      { status: 500 },
    )
  }
}
