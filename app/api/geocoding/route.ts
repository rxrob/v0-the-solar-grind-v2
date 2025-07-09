import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")
  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: "Google API key is not configured" }, { status: 500 })
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK") {
      return NextResponse.json({ error: data.error_message || "Geocoding failed" }, { status: 500 })
    }

    const { lat, lng } = data.results[0].geometry.location
    const formattedAddress = data.results[0].formatted_address
    const placeId = data.results[0].place_id

    return NextResponse.json({ lat, lng, formattedAddress, placeId })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to fetch geocoding data", details: errorMessage }, { status: 500 })
  }
}
