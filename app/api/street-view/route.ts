import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const heading = searchParams.get("heading") || "0"
    const pitch = searchParams.get("pitch") || "10"
    const fov = searchParams.get("fov") || "90"
    const size = searchParams.get("size") || "400x300"

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing lat or lng parameters" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Google Street View Static API URL
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?location=${lat},${lng}&size=${size}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${apiKey}`

    console.log(`🏠 Fetching street view: ${lat}, ${lng} (heading: ${heading}°)`)

    const response = await fetch(streetViewUrl)

    if (!response.ok) {
      console.error("Google Street View API error:", response.status, response.statusText)
      return NextResponse.json(
        { error: `Google Street View API error: ${response.status}` },
        { status: response.status },
      )
    }

    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Street view API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
