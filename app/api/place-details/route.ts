import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const placeId = searchParams.get("placeId")
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!placeId) {
    return NextResponse.json({ success: false, error: "Place ID is required" }, { status: 400 })
  }

  if (!apiKey) {
    console.error("Google API key is not configured")
    return NextResponse.json({ success: false, error: "Google API key is not configured" }, { status: 500 })
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=address_components,formatted_address,geometry`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK") {
      console.error("Google Place Details API Error:", data.error_message || data.status)
      return NextResponse.json(
        { success: false, error: data.error_message || "Failed to fetch place details" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, result: data.result })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    console.error("Failed to fetch place details:", errorMessage)
    return NextResponse.json(
      { success: false, error: "Failed to fetch place details", details: errorMessage },
      { status: 500 },
    )
  }
}
