import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const zoom = searchParams.get("zoom") || "21"
    const size = searchParams.get("size") || "640x640"

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing lat or lng parameters" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Google Static Maps API URL for aerial/satellite view
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=satellite&scale=2&key=${apiKey}`

    console.log(`🛰️ Fetching aerial view: ${lat}, ${lng} (zoom: ${zoom})`)

    const response = await fetch(staticMapUrl)

    if (!response.ok) {
      console.error("Google Static Maps API error:", response.status, response.statusText)
      return NextResponse.json(
        { error: `Google Static Maps API error: ${response.status}` },
        { status: response.status },
      )
    }

    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Aerial view API error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
