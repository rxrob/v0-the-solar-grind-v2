import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  if (!apiKey) {
    console.error("Google Maps API key is not configured.")
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  // 1. Check if Street View imagery exists using the metadata endpoint
  const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?size=600x400&location=${lat},${lng}&key=${apiKey}`
  const metadataResponse = await fetch(metadataUrl)
  const metadata = await metadataResponse.json()

  let streetViewUrl = null
  if (metadata.status === "OK") {
    // 2. If imagery exists, construct the Street View image URL
    streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&fov=90&heading=235&pitch=10&key=${apiKey}`
  }

  // 3. Construct the Aerial View URL
  const aerialViewUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=21&size=600x400&maptype=satellite&key=${apiKey}`

  return NextResponse.json({
    streetView: streetViewUrl,
    aerialView: aerialViewUrl,
  })
}
