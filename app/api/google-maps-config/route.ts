import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          configured: false,
          error: "Google Maps API key not configured",
          message: "Please set GOOGLE_MAPS_API_KEY environment variable",
        },
        { status: 200 }, // Return 200 instead of 500 to allow graceful handling
      )
    }

    // Return configuration for Google Maps
    return NextResponse.json({
      configured: true,
      apiKey,
      libraries: ["places", "geometry"],
      version: "weekly",
      region: "US",
      language: "en",
    })
  } catch (error) {
    console.error("Error getting Google Maps config:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to get Google Maps configuration",
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
