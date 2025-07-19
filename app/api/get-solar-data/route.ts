import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const { lat, lng, targetAnnualKwh } = await request.json()

  if (!lat || !lng) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  const apiKey = process.env.SOLAR_API_KEY
  if (!apiKey) {
    console.error("SOLAR_API_KEY is not set")
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${apiKey}`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      const errorData = await response.json()
      console.error("Google Solar API error:", errorData)
      const message = errorData.error?.message || response.statusText
      return NextResponse.json({ error: `Failed to fetch solar data: ${message}` }, { status: response.status })
    }

    const data = await response.json()

    if (!data.solarPotential || !data.solarPotential.solarPanels || data.solarPotential.solarPanels.length === 0) {
      return NextResponse.json(
        {
          error:
            "No detailed solar potential data available for this location. The property may be too new, in a remote area, or have poor imagery.",
        },
        { status: 404 },
      )
    }

    const { solarPanels } = data.solarPotential

    // Sort all available panels by their production, highest first.
    const sortedPanels = solarPanels.sort((a: any, b: any) => b.yearlyEnergyDcKwh - a.yearlyEnergyDcKwh)

    const selectedPanels: any[] = []
    let cumulativeProduction = 0
    const targetKwh = targetAnnualKwh || 14000 // Use provided target or a default

    // Add panels until we meet the target offset
    for (const panel of sortedPanels) {
      if (cumulativeProduction >= targetKwh) {
        break // We've met the target
      }
      selectedPanels.push(panel)
      cumulativeProduction += panel.yearlyEnergyDcKwh
    }

    // If no panels were selected (e.g., targetKwh was 0), select at least one best panel.
    if (selectedPanels.length === 0 && sortedPanels.length > 0) {
      selectedPanels.push(sortedPanels[0])
      cumulativeProduction = sortedPanels[0].yearlyEnergyDcKwh
    }

    if (selectedPanels.length === 0) {
      return NextResponse.json({ error: "No suitable panel placements found on the roof." }, { status: 404 })
    }

    const panelCount = selectedPanels.length
    const annualProductionKwh = cumulativeProduction
    const systemSizeKw = (panelCount * 440) / 1000 // 440W per panel

    const panelSpecs = {
      // Silfab 440W panel dimensions
      panelWidthMeters: 1.13, // approx 44.6 inches
      panelHeightMeters: 1.89, // approx 74.4 inches
    }

    // Include energy data for heatmap
    const panelLayout = selectedPanels.map((panel: any) => ({
      centerX: panel.center.x,
      centerY: panel.center.y,
      orientation: panel.orientation,
      yearlyEnergy: panel.yearlyEnergyDcKwh,
    }))

    const energyValues = panelLayout.map((p) => p.yearlyEnergy)
    const maxEnergy = Math.max(...energyValues)
    const minEnergy = Math.min(...energyValues)

    const result = {
      panelCount,
      systemSizeKw: Number.parseFloat(systemSizeKw.toFixed(2)),
      annualProductionKwh: Math.round(annualProductionKwh),
      panels: panelLayout,
      panelSpecs,
      energyRange: { min: minEnergy, max: maxEnergy },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching from Google Solar API:", error)
    return NextResponse.json({ error: "An internal error occurred while analyzing solar potential." }, { status: 500 })
  }
}
