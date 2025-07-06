"use server"

import { getCurrentUserReal } from "./auth-real"

interface SolarCalculationParams {
  address: string
  monthlyBill: number
  roofSize: number
  sunlightHours: number
  systemSize?: number
  panelEfficiency?: number
}

interface CalculationResult {
  annualProduction: number
  monthlyProduction: number[]
  dailyAverage: number
  peakProduction: number
  co2Offset: number
  costSavings: {
    monthly: number
    annual: number
    lifetime: number
  }
  paybackPeriod: number
  systemRecommendation: {
    recommendedSize: number
    estimatedCost: number
    panelsNeeded: number
  }
}

export async function performSolarCalculation(params: SolarCalculationParams): Promise<CalculationResult> {
  try {
    // Get current user for tracking
    const user = await getCurrentUserReal()

    // Default values
    const systemSize = params.systemSize || calculateRecommendedSystemSize(params.monthlyBill)
    const panelEfficiency = params.panelEfficiency || 0.2 // 20% efficiency
    const systemCostPerWatt = 3.5 // $3.50 per watt installed
    const electricityRate = 0.12 // $0.12 per kWh
    const panelWattage = 400 // 400W panels

    // Calculate annual production
    const dailyProduction = systemSize * params.sunlightHours * panelEfficiency
    const annualProduction = Math.round(dailyProduction * 365)

    // Calculate monthly production with seasonal variations
    const monthlyFactors = [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]
    const monthlyProduction = monthlyFactors.map((factor) => Math.round((annualProduction / 12) * factor))

    // Calculate savings
    const annualSavings = annualProduction * electricityRate
    const monthlySavings = annualSavings / 12
    const lifetimeSavings = annualSavings * 25 // 25-year system life

    // Calculate system cost and payback
    const systemCost = systemSize * systemCostPerWatt
    const paybackPeriod = systemCost / annualSavings

    // Calculate environmental impact
    const co2Offset = annualProduction * 0.0007 // metric tons CO2 per kWh

    // Calculate system recommendation
    const panelsNeeded = Math.ceil(systemSize / panelWattage)

    const result: CalculationResult = {
      annualProduction,
      monthlyProduction,
      dailyAverage: Math.round(dailyProduction),
      peakProduction: Math.round(systemSize * 1000), // Convert kW to W
      co2Offset: Math.round(co2Offset * 1000) / 1000, // Round to 3 decimal places
      costSavings: {
        monthly: Math.round(monthlySavings * 100) / 100,
        annual: Math.round(annualSavings * 100) / 100,
        lifetime: Math.round(lifetimeSavings * 100) / 100,
      },
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      systemRecommendation: {
        recommendedSize: Math.round(systemSize * 10) / 10,
        estimatedCost: Math.round(systemCost),
        panelsNeeded,
      },
    }

    // Save calculation to database if user is authenticated
    if (user && user.email) {
      await saveSolarCalculation(user.email, params, result)
    }

    return result
  } catch (error) {
    console.error("Solar calculation error:", error)
    throw new Error("Failed to perform solar calculation")
  }
}

function calculateRecommendedSystemSize(monthlyBill: number): number {
  // Estimate annual usage from monthly bill
  const electricityRate = 0.12 // $0.12 per kWh average
  const monthlyUsage = monthlyBill / electricityRate
  const annualUsage = monthlyUsage * 12

  // Size system to cover 90% of usage
  const targetProduction = annualUsage * 0.9
  const averageSunHours = 5 // Average daily sun hours
  const systemEfficiency = 0.85 // Account for losses

  const requiredSystemSize = targetProduction / (averageSunHours * 365 * systemEfficiency)

  // Round to nearest 0.5 kW
  return Math.round(requiredSystemSize * 2) / 2
}

async function saveSolarCalculation(userEmail: string, params: SolarCalculationParams, result: CalculationResult) {
  try {
    // In production, this would save to database
    console.log("Saving solar calculation for user:", userEmail)
    console.log("Calculation results:", {
      address: params.address,
      systemSize: result.systemRecommendation.recommendedSize,
      annualProduction: result.annualProduction,
      annualSavings: result.costSavings.annual,
      paybackPeriod: result.paybackPeriod,
    })
  } catch (error) {
    console.error("Error saving solar calculation:", error)
  }
}

export async function getSolarCalculationHistory(userEmail: string) {
  try {
    // In production, this would fetch from database
    console.log("Fetching solar calculation history for user:", userEmail)
    return []
  } catch (error) {
    console.error("Error fetching calculation history:", error)
    return []
  }
}

export async function deleteSolarCalculation(calculationId: string) {
  try {
    // In production, this would delete from database
    console.log("Deleting solar calculation:", calculationId)
    return { success: true }
  } catch (error) {
    console.error("Error deleting calculation:", error)
    return { success: false, error: "Failed to delete calculation" }
  }
}
