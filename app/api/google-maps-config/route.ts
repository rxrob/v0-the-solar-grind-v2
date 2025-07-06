import { type NextRequest, NextResponse } from "next/server"
import { getServerConfig } from "@/lib/env-validation"

export async function GET(request: NextRequest) {
  try {
    const config = getServerConfig()

    // Only return configuration status, never the actual keys
    return NextResponse.json(
      {
        configured: !!config.googleMapsApiKey,
        geocoding: !!config.googleGeocodingApiKey,
        elevation: !!config.googleElevationApiKey,
        status: "ready",
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
      {
        configured: false,
        geocoding: false,
        elevation: false,
        status: "error",
        error: "Configuration error",
      },
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
