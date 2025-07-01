import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      address,
      monthlyBill,
      roofArea,
      roofOrientation,
      shadingFactor,
      electricityRate,
      panelType,
      inverterType,
      mountingType,
    } = body

    // Professional-grade calculation with advanced parameters
    const panelEfficiencies = {
      monocrystalline: 0.22,
      polycrystalline: 0.18,
      thin_film: 0.12,
    }

    const inverterEfficiencies = {
      string: 0.96,
      power_optimizer: 0.98,
      microinverter: 0.95,
    }

    const mountingFactors = {
      roof_mount: 1.0,
      ground_mount: 1.05,
      tracking: 1.25,
    }

    const orientationMultipliers = {
      south: 1.0,
      southwest: 0.95,
      southeast: 0.95,
      west: 0.88,
      east: 0.88,
      north: 0.68,
    }

    const panelEfficiency = panelEfficiencies[panelType as keyof typeof panelEfficiencies] || 0.2
    const inverterEfficiency = inverterEfficiencies[inverterType as keyof typeof inverterEfficiencies] || 0.96
    const mountingFactor = mountingFactors[mountingType as keyof typeof mountingFactors] || 1.0
    const orientationMultiplier = orientationMultipliers[roofOrientation as keyof typeof orientationMultipliers] || 0.9

    const effectiveSunHours = 5.5 * orientationMultiplier * (shadingFactor / 100) * mountingFactor
    const systemEfficiency = panelEfficiency * inverterEfficiency * 0.85 // Additional system losses

    const annualUsage = (monthlyBill / electricityRate) * 12
    const systemSize = annualUsage / (effectiveSunHours * 365 * systemEfficiency)

    const panelWattage = panelType === "monocrystalline" ? 450 : panelType === "polycrystalline" ? 350 : 300
    const panelCount = Math.ceil((systemSize * 1000) / panelWattage)
    const requiredRoofArea = panelCount * (panelType === "thin_film" ? 25 : 20)

    // Cost calculations with premium equipment
    const baseCostPerWatt = 3.5
    const equipmentMultiplier = panelType === "monocrystalline" ? 1.2 : panelType === "polycrystalline" ? 1.0 : 0.8
    const inverterCostMultiplier =
      inverterType === "microinverter" ? 1.3 : inverterType === "power_optimizer" ? 1.15 : 1.0
    const mountingCostMultiplier = mountingType === "tracking" ? 1.4 : mountingType === "ground_mount" ? 1.1 : 1.0

    const totalCostPerWatt = baseCostPerWatt * equipmentMultiplier * inverterCostMultiplier * mountingCostMultiplier

    if (requiredRoofArea > roofArea) {
      const maxPanels = Math.floor(roofArea / (panelType === "thin_film" ? 25 : 20))
      const maxSystemSize = (maxPanels * panelWattage) / 1000

      const maxAnnualProduction = maxSystemSize * effectiveSunHours * 365 * systemEfficiency
      const maxMonthlySavings = (maxAnnualProduction / 12) * electricityRate
      const maxTotalCost = maxSystemSize * 1000 * totalCostPerWatt
      const maxPaybackPeriod = maxTotalCost / (maxMonthlySavings * 12)

      return NextResponse.json({
        success: true,
        data: {
          systemSize: Math.round(maxSystemSize * 100) / 100,
          annualProduction: Math.round(maxAnnualProduction),
          monthlyBillOffset: Math.round(maxMonthlySavings * 100) / 100,
          totalCost: Math.round(maxTotalCost),
          paybackPeriod: Math.round(maxPaybackPeriod * 10) / 10,
          co2Offset: Math.round(maxAnnualProduction * 0.0007 * 100) / 100,
          roofArea,
          panelCount: maxPanels,
          roofUtilization: 100,
          warning: "System size limited by available roof area",
          equipmentDetails: {
            panelType,
            inverterType,
            mountingType,
            panelWattage,
            systemEfficiency: Math.round(systemEfficiency * 100),
          },
        },
      })
    }

    const totalCost = systemSize * 1000 * totalCostPerWatt
    const annualProduction = systemSize * effectiveSunHours * 365 * systemEfficiency
    const monthlyBillOffset = (annualProduction / 12) * electricityRate
    const paybackPeriod = totalCost / (monthlyBillOffset * 12)
    const co2Offset = annualProduction * 0.0007

    return NextResponse.json({
      success: true,
      data: {
        systemSize: Math.round(systemSize * 100) / 100,
        annualProduction: Math.round(annualProduction),
        monthlyBillOffset: Math.round(monthlyBillOffset * 100) / 100,
        totalCost: Math.round(totalCost),
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        co2Offset: Math.round(co2Offset * 100) / 100,
        roofArea,
        panelCount,
        roofUtilization: Math.round((requiredRoofArea / roofArea) * 100),
        equipmentDetails: {
          panelType,
          inverterType,
          mountingType,
          panelWattage,
          systemEfficiency: Math.round(systemEfficiency * 100),
        },
      },
    })
  } catch (error) {
    console.error("Pro calculation error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to calculate professional solar metrics" },
      { status: 500 },
    )
  }
}
