import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get("input")
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!input) {
    return NextResponse.json({ success: false, error: "Input is required" }, { status: 400 })
  }

  if (!apiKey) {
    console.error("Google API key is not configured")
    return NextResponse.json({ success: false, error: "Google API key is not configured" }, { status: 500 })
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input,
  )}&key=${apiKey}&types=address&componentRestrictions=country:us`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API Error:", data.error_message || data.status)
      return NextResponse.json(
        { success: false, error: data.error_message || "Failed to fetch places" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, predictions: data.predictions || [] })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    console.error("Failed to fetch places data:", errorMessage)
    return NextResponse.json(
      { success: false, error: "Failed to fetch places data", details: errorMessage },
      { status: 500 },
    )
  }
}
