import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const config = {
      apiKey,
      libraries: ["places", "geometry", "drawing"],
      version: "weekly",
    }

    return NextResponse.json({
      success: true,
      config,
      status: "Google Maps configured",
    })
  } catch (error) {
    console.error("Google Maps config error:", error)
    return NextResponse.json(
      {
        error: "Failed to get Google Maps configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
