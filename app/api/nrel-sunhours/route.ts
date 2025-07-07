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
      return NextResponse.json({ error: "NREL API key not configured" }, { status: 500 })
    }

    // Use NREL Solar Resource API to get sun hours data
    const response = await fetch(
      `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${apiKey}&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "MySolarAI/1.0",
        },
      },
    )

    if (!response.ok) {
      console.error("NREL API error:", response.status, response.statusText)
      return NextResponse.json(
        { error: `NREL Solar Resource API request failed: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    if (!data.outputs) {
      console.error("Invalid NREL API response:", data)
      return NextResponse.json({ error: "Invalid response from NREL API" }, { status: 500 })
    }

    // Extract average daily sun hours from the response
    const sunHours = data.outputs?.avg_dni?.annual || 5.5 // Default fallback

    return NextResponse.json({
      success: true,
      data: {
        sunHours: Math.round(sunHours * 100) / 100,
        location: `${lat}, ${lon}`,
        source: "NREL Solar Resource Database",
      },
    })
  } catch (error) {
    console.error("NREL Sun Hours API error:", error)
    return NextResponse.json(
      {
        error: "Failed to get sun hours data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
