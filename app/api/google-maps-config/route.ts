import { NextResponse } from "next/server"
import { getServerConfig } from "@/lib/env-validation"

export async function GET() {
  try {
    const config = getServerConfig()

    return NextResponse.json(
      {
        configured: !!(config.googleMapsApiKeyPublic || config.googleMapsApiKey),
        hasPublicKey: !!config.googleMapsApiKeyPublic,
        hasServerKey: !!config.googleMapsApiKey,
        geocodingAvailable: !!config.googleGeocodingApiKey,
        elevationAvailable: !!config.googleElevationApiKey,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      },
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get Google Maps configuration", details: error.message },
      { status: 500 },
    )
  }
}
