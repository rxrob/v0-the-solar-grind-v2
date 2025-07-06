"use server"

import { getCurrentUserReal } from "./auth-real"

export interface CalculationResult {
  annualProduction: number
  monthlyProduction: number[]
  dailyAverage: number
  peakProduction: number
  systemCost: number
  annualSavings: number
  paybackPeriod: number
  co2Offset: number
  equivalentTrees: number
  systemSize: number
  numberOfPanels: number
  roofAreaNeeded: number
}

export interface SolarCalculationParams {
  address: string
  latitude: number
  longitude: number
  monthlyBill: number
  roofArea?: number
  systemSize?: number
  panelEfficiency?: number
  electricityRate?: number
  installationCost?: number
}

export async function calculateSolarPotential(params: SolarCalculationParams): Promise<CalculationResult> {
  try {
    // Get current user for tracking
    const user = await getCurrentUserReal()

    // Validate required parameters
    if (!params.latitude || !params.longitude) {
      throw new Error("Location coordinates are required")
    }

    if (!params.monthlyBill || params.monthlyBill <= 0) {
      throw new Error("Valid monthly electricity bill is required")
    }

    // Default values
    const electricityRate = params.electricityRate || 0.12 // $/kWh
    const panelEfficiency = params.panelEfficiency || 20 // %
    const installationCost = params.installationCost || 3.0 // $/W
    const systemLosses = 0.14 // 14% system losses
    const degradationRate = 0.005 // 0.5% per year

    // Calculate annual usage from monthly bill
    const annualUsage = (params.monthlyBill / electricityRate) * 12

    // Get solar irradiance data
    const solarData = await fetchSolarIrradiance(params.latitude, params.longitude)
    const peakSunHours = solarData.averageDailyIrradiance || 4.5

    // Calculate recommended system size
    const recommendedSystemSize = params.systemSize || calculateSystemSize(annualUsage, peakSunHours)

    // Calculate energy production
    const systemEfficiency = (panelEfficiency / 100) * (1 - systemLosses)
    const annualProduction = recommendedSystemSize * peakSunHours * 365 * systemEfficiency

    // Calculate monthly production with seasonal variations
    const monthlyProduction = calculateMonthlyProduction(annualProduction, params.latitude)

    // Calculate financial metrics
    const systemCost = recommendedSystemSize * installationCost * 1000 // Convert kW to W
    const annualSavings = Math.min(annualProduction, annualUsage) * electricityRate
    const paybackPeriod = systemCost / annualSavings

    // Calculate environmental impact
    const co2PerKwh = 0.4 // kg CO2 per kWh
    const co2Offset = annualProduction * co2PerKwh
    const equivalentTrees = co2Offset / 22 // kg CO2 per tree per year

    // Calculate system specifications
    const panelWattage = 400 // Standard panel wattage
    const numberOfPanels = Math.ceil((recommendedSystemSize * 1000) / panelWattage)
    const panelArea = 2.0 // m² per panel
    const roofAreaNeeded = numberOfPanels * panelArea

    const result: CalculationResult = {
      annualProduction: Math.round(annualProduction),
      monthlyProduction: monthlyProduction.map((p: number) => Math.round(p)),
      dailyAverage: Math.round(annualProduction / 365),
      peakProduction: Math.round(recommendedSystemSize * 0.8), // 80% of rated capacity
      systemCost: Math.round(systemCost),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Offset: Math.round(co2Offset),
      equivalentTrees: Math.round(equivalentTrees),
      systemSize: Math.round(recommendedSystemSize * 10) / 10,
      numberOfPanels,
      roofAreaNeeded: Math.round(roofAreaNeeded),
    }

    // Save calculation if user is authenticated
    if (user && user.email) {
      await saveSolarCalculation(user.email, params, result)
    }

    return result
  } catch (error) {
    console.error("Solar calculation error:", error)
    throw new Error(error instanceof Error ? error.message : "Calculation failed")
  }
}

async function fetchSolarIrradiance(latitude: number, longitude: number) {
  try {
    const apiKey = process.env.NREL_API_KEY
    if (!apiKey) {
      console.warn("NREL API key not configured, using default values")
      return { averageDailyIrradiance: 4.5 }
    }

    const url = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${apiKey}&lat=${latitude}&lon=${longitude}`

    const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour
    if (!response.ok) {
      throw new Error(`NREL API error: ${response.status}`)
    }

    const data = await response.json()
    return {
      averageDailyIrradiance: data.outputs?.avg_ghi?.annual || 4.5,
    }
  } catch (error) {
    console.error("NREL API error:", error)
    // Return default values if API fails
    return { averageDailyIrradiance: 4.5 }
  }
}

function calculateSystemSize(annualUsage: number, peakSunHours: number): number {
  // Calculate system size needed to offset 100% of usage
  const systemEfficiency = 0.8 // 80% overall system efficiency
  const systemSize = annualUsage / (peakSunHours * 365 * systemEfficiency)
  return Math.max(1, Math.min(20, systemSize)) // Limit between 1kW and 20kW
}

function calculateMonthlyProduction(annualProduction: number, latitude: number): number[] {
  // Seasonal adjustment factors based on latitude
  const isNorthern = latitude > 0
  const seasonalFactors = isNorthern
    ? [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6] // Northern hemisphere
    : [1.4, 1.3, 1.1, 0.9, 0.7, 0.6, 0.7, 0.8, 1.0, 1.2, 1.3, 1.4] // Southern hemisphere

  const monthlyProduction: number[] = []
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  for (let i = 0; i < 12; i++) {
    const monthlyProd = (annualProduction / 365) * daysInMonth[i] * seasonalFactors[i]
    monthlyProduction.push(monthlyProd)
  }

  return monthlyProduction
}

async function saveSolarCalculation(userEmail: string, params: SolarCalculationParams, result: CalculationResult) {
  try {
    // This would save to database in a real implementation
    console.log("Saving solar calculation for:", userEmail)
    console.log("Params:", params)
    console.log("Result:", result)

    // In a real implementation, you would save to Supabase here
    // const supabase = createServerClient()
    // await supabase.from('solar_calculations').insert({
    //   user_email: userEmail,
    //   calculation_params: params,
    //   calculation_results: result,
    //   created_at: new Date().toISOString()
    // })
  } catch (error) {
    console.error("Error saving solar calculation:", error)
    // Don't throw error here as it shouldn't break the calculation
  }
}

export async function getSolarCalculationHistory(limit = 10) {
  try {
    const user = await getCurrentUserReal()

    if (!user || !user.email) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    // This would fetch from database in a real implementation
    console.log("Fetching solar calculation history for:", user.email)

    // Return mock data for now
    return {
      success: true,
      calculations: [],
    }
  } catch (error) {
    console.error("Error fetching calculation history:", error)
    return {
      success: false,
      error: "Failed to fetch calculation history",
    }
  }
}

export async function deleteSolarCalculation(calculationId: string) {
  try {
    const user = await getCurrentUserReal()

    if (!user || !user.email) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    // This would delete from database in a real implementation
    console.log("Deleting solar calculation:", calculationId, "for user:", user.email)

    return {
      success: true,
      message: "Calculation deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting calculation:", error)
    return {
      success: false,
      error: "Failed to delete calculation",
    }
  }
}
