import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const heading = searchParams.get("heading") || "0"
    const pitch = searchParams.get("pitch") || "0"
    const fov = searchParams.get("fov") || "90"
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key is not configured" }, { status: 500 })
    }

    const url = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${apiKey}`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for image

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Solar-App-StreetView/1.0",
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error("Google Street View API error:", response.status, response.statusText)

      if (response.status === 404) {
        return NextResponse.json(
          {
            success: false,
            error: "No Street View imagery available for this location",
            details: {
              coordinates: { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) },
              status: response.status,
            },
          },
          { status: 404 },
        )
      }

      return NextResponse.json(
        {
          success: false,
          error: `Google Street View API error: ${response.status}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            coordinates: { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) },
          },
        },
        { status: response.status },
      )
    }

    const imageBuffer = await response.arrayBuffer()

    if (imageBuffer.byteLength === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Empty image response from Google Street View API",
          details: { coordinates: { lat: Number.parseFloat(lat), lng: Number.parseFloat(lng) } },
        },
        { status: 404 },
      )
    }

    console.log(`✅ Street View image retrieved: ${imageBuffer.byteLength} bytes`)

    const contentType = response.headers.get("content-type") || "image/jpeg"

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Image-Size": imageBuffer.byteLength.toString(),
        "X-Coordinates": `${Number.parseFloat(lat)},${Number.parseFloat(lng)}`,
        "X-View-Parameters": `heading=${Number.parseFloat(heading)},pitch=${Number.parseFloat(pitch)},fov=${Number.parseFloat(fov)}`,
      },
    })
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Google Street View API timeout")
      return NextResponse.json(
        {
          success: false,
          error: "Request timeout - Google Street View API took too long to respond",
          details: { timeout: "15 seconds" },
        },
        { status: 408 },
      )
    }

    console.error("Street view API error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to fetch Street View image", details: errorMessage }, { status: 500 })
  }
}
