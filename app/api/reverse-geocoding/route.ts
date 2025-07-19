import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { lat, lng } = await request.json()

  if (!lat || !lng) {
    return NextResponse.json({ success: false, error: "Latitude and longitude are required." }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_GEOCODING_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "Server configuration error: Missing Geocoding API key." },
      { status: 500 },
    )
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json(
        { success: false, error: data.error_message || "Could not find address for coordinates." },
        { status: 404 },
      )
    }

    const address = data.results[0].formatted_address
    const zipCode =
      data.results[0].address_components.find((c: any) => c.types.includes("postal_code"))?.long_name || null

    return NextResponse.json({ success: true, address, zipCode })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
    return NextResponse.json(
      { success: false, error: `Failed to fetch from Google Geocoding API: ${errorMessage}` },
      { status: 500 },
    )
  }
}
