"use server"

export async function advancedSolarCalculation(data: {
  address: string
  monthlyBill: number
  roofArea: number
  roofOrientation: string
  shadingFactor: number
  electricityRate: number
}) {
  try {
    // Advanced calculation with more parameters
    const { address, monthlyBill, roofArea, roofOrientation, shadingFactor, electricityRate } = data

    // Orientation multipliers
    const orientationMultipliers = {
      south: 1.0,
      southwest: 0.95,
      southeast: 0.95,
      west: 0.88,
      east: 0.88,
      north: 0.68,
    }

    const orientationMultiplier = orientationMultipliers[roofOrientation as keyof typeof orientationMultipliers] || 0.9
    const effectiveSunHours = 5.5 * orientationMultiplier * (shadingFactor / 100)

    const annualUsage = (monthlyBill / electricityRate) * 12
    const systemSize = annualUsage / (effectiveSunHours * 365 * 0.85)

    const panelCount = Math.ceil((systemSize * 1000) / 400)
    const requiredRoofArea = panelCount * 20 // 20 sq ft per panel

    if (requiredRoofArea > roofArea) {
      const maxPanels = Math.floor(roofArea / 20)
      const maxSystemSize = (maxPanels * 400) / 1000

      return {
        systemSize: maxSystemSize,
        annualProduction: Math.round(maxSystemSize * effectiveSunHours * 365 * 0.85),
        monthlyBillOffset:
          Math.round(((maxSystemSize * effectiveSunHours * 365 * 0.85) / 12) * electricityRate * 100) / 100,
        totalCost: Math.round(maxSystemSize * 1000 * 3.5),
        paybackPeriod:
          Math.round(
            ((maxSystemSize * 1000 * 3.5) / (maxSystemSize * effectiveSunHours * 365 * 0.85 * electricityRate)) * 10,
          ) / 10,
        co2Offset: Math.round(maxSystemSize * effectiveSunHours * 365 * 0.85 * 0.0007 * 100) / 100,
        roofArea,
        panelCount: maxPanels,
        roofUtilization: 100,
        warning: "System size limited by available roof area",
      }
    }

    const totalCost = systemSize * 1000 * 3.5
    const annualProduction = systemSize * effectiveSunHours * 365 * 0.85
    const monthlyBillOffset = (annualProduction / 12) * electricityRate
    const paybackPeriod = totalCost / (monthlyBillOffset * 12)
    const co2Offset = annualProduction * 0.0007

    return {
      systemSize: Math.round(systemSize * 100) / 100,
      annualProduction: Math.round(annualProduction),
      monthlyBillOffset: Math.round(monthlyBillOffset * 100) / 100,
      totalCost: Math.round(totalCost),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Offset: Math.round(co2Offset * 100) / 100,
      roofArea,
      panelCount,
      roofUtilization: Math.round((requiredRoofArea / roofArea) * 100),
    }
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    throw new Error("Failed to perform advanced solar calculation")
  }
}
