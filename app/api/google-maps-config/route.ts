import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Only return the API key if it exists (server-side only)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          configured: false,
          message: "Google Maps API key not configured",
        },
        { status: 400 },
      )
    }

    // Return configuration for client-side Google Maps
    return NextResponse.json({
      configured: true,
      apiKey: apiKey, // This is safe because it's server-side
      libraries: ["places", "geometry", "drawing"],
      message: "Google Maps configuration loaded",
    })
  } catch (error) {
    console.error("Google Maps config error:", error)
    return NextResponse.json(
      {
        configured: false,
        message: "Failed to load Google Maps configuration",
      },
      { status: 500 },
    )
  }
}
