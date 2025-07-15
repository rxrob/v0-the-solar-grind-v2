import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = {
      nrelApiKey: process.env.NREL_API_KEY ? "configured" : "missing",
      googleElevationKey: process.env.GOOGLE_ELEVATION_API_KEY ? "configured" : "missing",
      googleGeocodingKey: process.env.GOOGLE_GEOCODING_API_KEY ? "configured" : "missing",
    }

    const missingKeys = Object.entries(config)
      .filter(([, value]) => value === "missing")
      .map(([key]) => key)

    if (missingKeys.length > 0) {
      return NextResponse.json(
        {
          error: "Some Solar API keys are missing",
          missing: missingKeys,
          config,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      config,
      status: "All Solar API keys configured",
    })
  } catch (error) {
    console.error("Solar API config error:", error)
    return NextResponse.json(
      {
        error: "Failed to get Solar API configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
