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
      return NextResponse.json(
        {
          success: false,
          error: "Missing lat or lng parameters",
          details: { received: { lat, lng }, required: ["lat", "lng"] },
        },
        { status: 400 },
      )
    }

    // Validate coordinates
    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)
    const headingNum = Number.parseFloat(heading)
    const pitchNum = Number.parseFloat(pitch)
    const fovNum = Number.parseFloat(fov)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid coordinate format",
          details: { lat, lng },
        },
        { status: 400 },
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Coordinates out of valid range",
          details: {
            lat: latitude,
            lng: longitude,
            valid_range: "lat: -90 to 90, lng: -180 to 180",
          },
        },
        { status: 400 },
      )
    }

    // Validate other parameters
    if (headingNum < 0 || headingNum >= 360) {
      return NextResponse.json(
        {
          success: false,
          error: "Heading must be between 0 and 359 degrees",
          details: { heading: headingNum, valid_range: "0-359" },
        },
        { status: 400 },
      )
    }

    if (pitchNum < -90 || pitchNum > 90) {
      return NextResponse.json(
        {
          success: false,
          error: "Pitch must be between -90 and 90 degrees",
          details: { pitch: pitchNum, valid_range: "-90 to 90" },
        },
        { status: 400 },
      )
    }

    if (fovNum < 10 || fovNum > 120) {
      return NextResponse.json(
        {
          success: false,
          error: "Field of view must be between 10 and 120 degrees",
          details: { fov: fovNum, valid_range: "10-120" },
        },
        { status: 400 },
      )
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error("Google Maps API key not configured")
      return NextResponse.json(
        {
          success: false,
          error: "Google Maps API key not configured",
          details: { service: "Google Street View Static API" },
        },
        { status: 500 },
      )
    }

    // Google Street View Static API URL
    const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?location=${latitude},${longitude}&size=${size}&heading=${headingNum}&pitch=${pitchNum}&fov=${fovNum}&key=${apiKey}`

    console.log(
      `🏠 Fetching street view: ${latitude}, ${longitude} (heading: ${headingNum}°, pitch: ${pitchNum}°, fov: ${fovNum}°)`,
    )

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout for image

    const response = await fetch(streetViewUrl, {
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
              coordinates: { lat: latitude, lng: longitude },
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
            coordinates: { lat: latitude, lng: longitude },
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
          details: { coordinates: { lat: latitude, lng: longitude } },
        },
        { status: 404 },
      )
    }

    console.log(`✅ Street View image retrieved: ${imageBuffer.byteLength} bytes`)

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
        "X-Image-Size": imageBuffer.byteLength.toString(),
        "X-Coordinates": `${latitude},${longitude}`,
        "X-View-Parameters": `heading=${headingNum},pitch=${pitchNum},fov=${fovNum}`,
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
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch street view image",
        details: {
          error_type: error.constructor.name,
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    )
  }
}
