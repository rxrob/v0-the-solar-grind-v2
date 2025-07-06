import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only check configuration status without exposing keys
    const googleMapsConfigured = !!process.env.GOOGLE_MAPS_API_KEY
    const geocodingConfigured = !!process.env.GOOGLE_GEOCODING_API_KEY
    const elevationConfigured = !!process.env.GOOGLE_ELEVATION_API_KEY

    return NextResponse.json({
      success: true,
      configured: {
        googleMaps: googleMapsConfigured,
        geocoding: geocodingConfigured,
        elevation: elevationConfigured,
        overall: googleMapsConfigured && geocodingConfigured && elevationConfigured,
      },
      services: {
        maps: googleMapsConfigured ? "Available" : "Not configured",
        geocoding: geocodingConfigured ? "Available" : "Not configured",
        elevation: elevationConfigured ? "Available" : "Not configured",
      },
      message: googleMapsConfigured ? "Google Maps services are configured" : "Google Maps services need configuration",
    })
  } catch (error: any) {
    console.error("Error checking Google Maps configuration:", error)
    return NextResponse.json(
      {
        success: false,
        configured: {
          googleMaps: false,
          geocoding: false,
          elevation: false,
          overall: false,
        },
        services: {
          maps: "Error",
          geocoding: "Error",
          elevation: "Error",
        },
        error: "Failed to check Google Maps configuration",
      },
      { status: 500 },
    )
  }
}
