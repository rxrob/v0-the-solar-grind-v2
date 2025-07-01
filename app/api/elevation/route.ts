import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json(
      { success: false, error: "Latitude and longitude parameters are required" },
      { status: 400 },
    )
  }

  try {
    const apiKey = process.env.GOOGLE_ELEVATION_API_KEY
    if (!apiKey) {
      throw new Error("Google Elevation API key not configured")
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/elevation/json?locations=${lat},${lng}&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error("Elevation API request failed")
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.results.length) {
      return NextResponse.json({ success: false, error: "Elevation data not found" }, { status: 404 })
    }

    const elevation = data.results[0].elevation

    return NextResponse.json({ success: true, data: { elevation } })
  } catch (error) {
    console.error("Elevation error:", error)
    return NextResponse.json({ success: false, error: "Failed to get elevation data" }, { status: 500 })
  }
}
