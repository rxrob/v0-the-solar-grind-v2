import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get("input")
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!input) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 })
  }

  if (!apiKey) {
    return NextResponse.json({ error: "Google API key is not configured" }, { status: 500 })
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    input,
  )}&key=${apiKey}&types=address`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return NextResponse.json({ error: data.error_message || "Failed to fetch places" }, { status: 500 })
    }

    return NextResponse.json(data.predictions)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to fetch places data", details: errorMessage }, { status: 500 })
  }
}
