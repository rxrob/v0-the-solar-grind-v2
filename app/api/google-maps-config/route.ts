import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only return configuration status, never the actual key
    const hasGoogleMapsKey = !!process.env.GOOGLE_MAPS_API_KEY
    const hasGeocodingKey = !!process.env.GOOGLE_GEOCODING_API_KEY
    const hasElevationKey = !!process.env.GOOGLE_ELEVATION_API_KEY

    return NextResponse.json(
      {
        googleMaps: {
          available: hasGoogleMapsKey,
          geocoding: hasGeocodingKey,
          elevation: hasElevationKey,
          status: hasGoogleMapsKey ? "configured" : "missing",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      },
    )
  } catch (error) {
    console.error("Google Maps config error:", error)
    return NextResponse.json(
      { error: "Configuration check failed" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      },
    )
  }
}
