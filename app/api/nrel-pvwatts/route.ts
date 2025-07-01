import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const systemCapacity = searchParams.get("system_capacity") || "4"
  const moduleType = searchParams.get("module_type") || "1"
  const losses = searchParams.get("losses") || "14"
  const arrayType = searchParams.get("array_type") || "1"
  const tilt = searchParams.get("tilt") || "20"
  const azimuth = searchParams.get("azimuth") || "180"

  if (!lat || !lon) {
    return NextResponse.json({ success: false, error: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    const apiKey = process.env.NREL_API_KEY
    if (!apiKey) {
      throw new Error("NREL API key not configured")
    }

    const url = new URL("https://developer.nrel.gov/api/pvwatts/v8.json")
    url.searchParams.set("api_key", apiKey)
    url.searchParams.set("lat", lat)
    url.searchParams.set("lon", lon)
    url.searchParams.set("system_capacity", systemCapacity)
    url.searchParams.set("module_type", moduleType)
    url.searchParams.set("losses", losses)
    url.searchParams.set("array_type", arrayType)
    url.searchParams.set("tilt", tilt)
    url.searchParams.set("azimuth", azimuth)
    url.searchParams.set("dataset", "nsrdb")
    url.searchParams.set("radius", "0")
    url.searchParams.set("timeframe", "monthly")

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`NREL API request failed: ${response.status}`)
    }

    const data = await response.json()

    if (data.errors && data.errors.length > 0) {
      return NextResponse.json({ success: false, error: data.errors.join(", ") }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: data.outputs })
  } catch (error) {
    console.error("NREL PVWatts error:", error)
    return NextResponse.json({ success: false, error: "Failed to get solar data from NREL" }, { status: 500 })
  }
}
