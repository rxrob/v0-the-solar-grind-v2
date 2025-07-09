import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

async function fetchImage(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const buffer = await response.arrayBuffer()
    return `data:${response.headers.get("content-type")};base64,${Buffer.from(buffer).toString("base64")}`
  } catch (error) {
    console.error(`Failed to fetch image from ${url}`, error)
    return null
  }
}

export async function GET(request: Request) {
  if (!GOOGLE_API_KEY) {
    return NextResponse.json({ error: "Google API key is not configured." }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required." }, { status: 400 })
  }

  const size = "640x640"
  const fov = "90"
  const headings = ["0", "90", "180", "270"]
  const pitch = "10"

  const imageUrls = headings.map(
    (heading) =>
      `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&fov=${fov}&heading=${heading}&pitch=${pitch}&key=${GOOGLE_API_KEY}`,
  )

  const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=20&size=${size}&maptype=satellite&key=${GOOGLE_API_KEY}`

  try {
    const [north, east, south, west, satellite] = await Promise.all([
      fetchImage(imageUrls[0]),
      fetchImage(imageUrls[1]),
      fetchImage(imageUrls[2]),
      fetchImage(imageUrls[3]),
      fetchImage(satelliteUrl),
    ])

    return NextResponse.json({
      north,
      east,
      south,
      west,
      satellite,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Failed to fetch property images", details: errorMessage }, { status: 500 })
  }
}
