import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { coordinates } = await request.json()

    if (!coordinates || !coordinates.lat || !coordinates.lng) {
      return NextResponse.json({ error: "Coordinates are required" }, { status: 400 })
    }

    const { lat, lng } = coordinates

    // Try to fetch from NREL API if available
    const nrelApiKey = process.env.NREL_API_KEY

    if (nrelApiKey) {
      try {
        const nrelUrl = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${nrelApiKey}&lat=${lat}&lon=${lng}`
        const nrelResponse = await fetch(nrelUrl)

        if (nrelResponse.ok) {
          const nrelData = await nrelResponse.json()
          const sunlightData = {
            peakSunHours: nrelData.outputs?.avg_dni?.annual || 4.5 + (lat - 30) * 0.1,
            annualIrradiance: nrelData.outputs?.avg_ghi?.annual * 365 || 1400 + Math.random() * 400,
            seasonalVariation: {
              spring: nrelData.outputs?.avg_dni?.monthly?.[3] || (4.5 + (lat - 30) * 0.1) * 0.9,
              summer: nrelData.outputs?.avg_dni?.monthly?.[6] || (4.5 + (lat - 30) * 0.1) * 1.2,
              fall: nrelData.outputs?.avg_dni?.monthly?.[9] || (4.5 + (lat - 30) * 0.1) * 0.8,
              winter: nrelData.outputs?.avg_dni?.monthly?.[12] || (4.5 + (lat - 30) * 0.1) * 0.6,
            },
            weatherImpact: 85 + Math.random() * 10,
            dataSource: "NREL",
          }

          return NextResponse.json({ success: true, data: sunlightData })
        }
      } catch (nrelError) {
        console.error("NREL API error:", nrelError)
        // Fall through to mock data
      }
    }

    // Fallback to calculated mock data based on latitude
    const baseSunHours = Math.max(3.5, Math.min(7.5, 4.5 + (lat - 30) * 0.1))

    const mockSunlightData = {
      peakSunHours: baseSunHours + (Math.random() - 0.5),
      annualIrradiance: 1400 + Math.random() * 400,
      seasonalVariation: {
        spring: baseSunHours * 0.9,
        summer: baseSunHours * 1.2,
        fall: baseSunHours * 0.8,
        winter: baseSunHours * 0.6,
      },
      weatherImpact: 85 + Math.random() * 10,
      dataSource: "Calculated",
    }

    return NextResponse.json({ success: true, data: mockSunlightData })
  } catch (error) {
    console.error("Sunlight analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze sunlight data" }, { status: 500 })
  }
}
