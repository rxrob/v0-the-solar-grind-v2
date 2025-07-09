import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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

    // Validate coordinates
    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ error: "Invalid coordinates provided" }, { status: 400 })
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: "Coordinates out of valid range" }, { status: 400 })
    }

    // Google Static Maps API URL for aerial/satellite view
    const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=satellite&scale=2&key=${apiKey}`

    console.log(`🛰️ Fetching aerial view: ${lat}, ${lng} (zoom: ${zoom})`)

    const response = await fetch(staticMapUrl, {
      headers: {
        "User-Agent": "MySolarAI/1.0",
      },
    })

    if (!response.ok) {
      console.error("Google Static Maps API error:", response.status, response.statusText)
      return NextResponse.json(
        { error: `Google Static Maps API error: ${response.status}` },
        { status: response.status },
      )
    }

    const imageBuffer = await response.arrayBuffer()

    if (imageBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Empty response from Google Maps API" }, { status: 500 })
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
        "Content-Length": imageBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Aerial view API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch aerial view",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
