import { NextResponse } from "next/server"

// This function calculates an estimated number of sun hours based on latitude.
// It's a simplified model and not a substitute for precise data.
function estimateSunHours(lat: number): number {
  const latitude = Math.abs(lat)
  // A simple linear model: more sun closer to the equator.
  // Base of 6 hours, decreasing by 1 hour for every 20 degrees of latitude.
  const baseHours = 6.0
  const reduction = latitude / 20.0
  const estimated = baseHours - reduction
  // Clamp the value between a reasonable range (e.g., 2 to 6 hours)
  return Math.max(2.0, Math.min(6.0, estimated))
}

export async function POST(request: Request) {
  let lat: string | number, lon: string | number
  try {
    const body = await request.json()
    lat = body.lat
    lon = body.lon

    if (!lat || !lon) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const NREL_API_KEY = process.env.NREL_API_KEY
    if (!NREL_API_KEY) {
      console.warn("NREL_API_KEY not found. Falling back to estimation.")
      const sunHours = estimateSunHours(Number.parseFloat(lat as string))
      return NextResponse.json({
        source: "estimation",
        sunHours,
      })
    }

    const apiUrl = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${NREL_API_KEY}&lat=${lat}&lon=${lon}`

    const nrelResponse = await fetch(apiUrl)

    if (!nrelResponse.ok) {
      const errorText = await nrelResponse.text()
      console.error(`NREL API request failed with status ${nrelResponse.status}: ${errorText}`)
      const sunHours = estimateSunHours(Number.parseFloat(lat as string))
      return NextResponse.json({
        source: "estimation_fallback",
        sunHours,
        error: `NREL API Error: ${nrelResponse.statusText}`,
      })
    }

    const data = await nrelResponse.json()
    const avgGhi = data?.outputs?.avg_ghi?.annual

    if (typeof avgGhi !== "number") {
      console.warn("NREL API did not return avg_ghi. Falling back to estimation.")
      const sunHours = estimateSunHours(Number.parseFloat(lat as string))
      return NextResponse.json({
        source: "estimation_no_ghi",
        sunHours,
      })
    }

    // Convert GHI (kWh/m^2/day) to Peak Sun Hours. The conversion is 1-to-1.
    const sunHours = avgGhi

    return NextResponse.json({ source: "nrel_api", sunHours })
  } catch (error) {
    console.error("Error in nrel-sunhours route:", error)
    // In case of any unexpected error, try to get lat from the request again for estimation
    if (lat) {
      const sunHours = estimateSunHours(Number.parseFloat(lat as string))
      return NextResponse.json({
        source: "estimation_error_fallback",
        sunHours,
      })
    }
    // If we couldn't even parse lat, return a server error
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
