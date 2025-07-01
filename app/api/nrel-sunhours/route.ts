import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    const apiKey = process.env.NREL_API_KEY
    if (!apiKey) {
      throw new Error("NREL API key not configured")
    }

    // Use NREL Solar Resource API to get sun hours data
    const response = await fetch(
      `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${apiKey}&lat=${lat}&lon=${lon}`,
    )

    if (!response.ok) {
      throw new Error("NREL Solar Resource API request failed")
    }

    const data = await response.json()

    // Extract average daily sun hours from the response
    const sunHours = data.outputs?.avg_dni?.annual || 5.5 // Default fallback

    return NextResponse.json({
      success: true,
      data: {
        sunHours: Math.round(sunHours * 100) / 100,
        location: `${lat}, ${lon}`,
      },
    })
  } catch (error) {
    console.error("NREL Sun Hours API error:", error)
    return NextResponse.json({ error: "Failed to get sun hours data" }, { status: 500 })
  }
}
