"use server"

import { getCurrentUserReal } from "./auth-real"
import { createServerClient } from "@/lib/supabase-server-client"

// Advanced solar calculation types
interface AdvancedSolarParams {
  address: string
  latitude: number
  longitude: number
  systemSize: number
  panelWattage: number
  panelCount: number
  inverterEfficiency: number
  roofTilt: number
  roofAzimuth: number
  shadingFactor: number
  electricityRate: number
  annualUsage: number
  installationCost: number
  incentives: number
  degradationRate: number
  analysisYears: number
}

interface AdvancedSolarResults {
  monthlyProduction: number[]
  annualProduction: number
  monthlyConsumption: number[]
  annualConsumption: number
  netMetering: {
    monthlyNet: number[]
    annualNet: number
    excessGeneration: number
  }
  financial: {
    totalSavings: number
    paybackPeriod: number
    roi: number
    netPresentValue: number
    levelizedCostOfEnergy: number
    yearlyBreakdown: Array<{
      year: number
      production: number
      savings: number
      cumulativeSavings: number
    }>
  }
  environmental: {
    co2Offset: number
    treesEquivalent: number
    carsOffRoad: number
  }
  systemDetails: {
    totalSystemSize: number
    panelCount: number
    estimatedRoofArea: number
    inverterCount: number
    expectedLifespan: number
  }
}

// Save calculation to database
async function saveAdvancedCalculation(userEmail: string, params: AdvancedSolarParams, results: AdvancedSolarResults) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("solar_calculations").insert({
      user_email: userEmail,
      calculation_type: "advanced",
      input_data: params,
      results: results,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving calculation:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving calculation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Get NREL solar data
async function getNRELSolarData(latitude: number, longitude: number) {
  try {
    const apiKey = process.env.NREL_API_KEY
    if (!apiKey) {
      throw new Error("NREL API key not configured")
    }

    const response = await fetch(
      `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${apiKey}&lat=${latitude}&lon=${longitude}`,
    )

    if (!response.ok) {
      throw new Error(`NREL API error: ${response.status}`)
    }

    const data = await response.json()
    return data.outputs
  } catch (error) {
    console.error("NREL API error:", error)
    throw error
  }
}

// Calculate monthly solar production
function calculateMonthlyProduction(
  systemSize: number,
  solarData: any,
  roofTilt: number,
  roofAzimuth: number,
  shadingFactor: number,
  inverterEfficiency: number,
) {
  const monthlyProduction = []
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  for (let month = 0; month < 12; month++) {
    // Get monthly solar irradiance (kWh/m²/day)
    const monthlyIrradiance = solarData.avg_dni?.monthly?.[month] || 5.0

    // Apply tilt and azimuth corrections (simplified)
    const tiltFactor = Math.cos((Math.abs(roofTilt - 30) * Math.PI) / 180) * 0.9 + 0.1
    const azimuthFactor = Math.cos((Math.abs(roofAzimuth - 180) * Math.PI) / 180) * 0.9 + 0.1

    // Calculate monthly production
    const adjustedIrradiance = monthlyIrradiance * tiltFactor * azimuthFactor * shadingFactor
    const monthlyKWh = systemSize * adjustedIrradiance * daysInMonth[month] * inverterEfficiency

    monthlyProduction.push(Math.round(monthlyKWh))
  }

  return monthlyProduction
}

// Calculate financial analysis
function calculateFinancialAnalysis(
  annualProduction: number,
  annualConsumption: number,
  electricityRate: number,
  installationCost: number,
  incentives: number,
  degradationRate: number,
  analysisYears: number,
) {
  const yearlyBreakdown = []
  let cumulativeSavings = 0
  let paybackPeriod = 0
  let totalSavings = 0

  for (let year = 1; year <= analysisYears; year++) {
    // Account for panel degradation
    const degradationFactor = Math.pow(1 - degradationRate / 100, year - 1)
    const yearlyProduction = annualProduction * degradationFactor

    // Calculate savings (assuming net metering)
    const yearlySavings = Math.min(yearlyProduction, annualConsumption) * electricityRate
    const excessProduction = Math.max(0, yearlyProduction - annualConsumption)
    const excessValue = excessProduction * electricityRate * 0.75 // Reduced rate for excess

    const totalYearlySavings = yearlySavings + excessValue
    cumulativeSavings += totalYearlySavings
    totalSavings += totalYearlySavings

    // Check for payback period
    if (paybackPeriod === 0 && cumulativeSavings >= installationCost - incentives) {
      paybackPeriod =
        year + (installationCost - incentives - (cumulativeSavings - totalYearlySavings)) / totalYearlySavings
    }

    yearlyBreakdown.push({
      year,
      production: Math.round(yearlyProduction),
      savings: Math.round(totalYearlySavings),
      cumulativeSavings: Math.round(cumulativeSavings),
    })
  }

  // Calculate ROI and NPV
  const netCost = installationCost - incentives
  const roi = ((totalSavings - netCost) / netCost) * 100

  // Simple NPV calculation (assuming 3% discount rate)
  const discountRate = 0.03
  let npv = -netCost
  for (let year = 1; year <= analysisYears; year++) {
    const yearSavings = yearlyBreakdown[year - 1].savings
    npv += yearSavings / Math.pow(1 + discountRate, year)
  }

  // Levelized Cost of Energy
  const lcoe = netCost / (annualProduction * analysisYears)

  return {
    totalSavings: Math.round(totalSavings),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    roi: Math.round(roi * 10) / 10,
    netPresentValue: Math.round(npv),
    levelizedCostOfEnergy: Math.round(lcoe * 1000) / 1000,
    yearlyBreakdown,
  }
}

// Main advanced solar calculation function
export async function performAdvancedSolarCalculation(params: AdvancedSolarParams): Promise<AdvancedSolarResults> {
  try {
    // Get current user
    const user = await getCurrentUserReal()
    if (!user) {
      throw new Error("User not authenticated")
    }

    // Get NREL solar data
    const solarData = await getNRELSolarData(params.latitude, params.longitude)

    // Calculate monthly production
    const monthlyProduction = calculateMonthlyProduction(
      params.systemSize,
      solarData,
      params.roofTilt,
      params.roofAzimuth,
      params.shadingFactor,
      params.inverterEfficiency,
    )

    const annualProduction = monthlyProduction.reduce((sum, month) => sum + month, 0)

    // Calculate monthly consumption (distribute annual usage)
    const monthlyConsumption = []
    const seasonalFactors = [1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 1.2, 1.3, 1.1, 0.9, 1.0, 1.1]
    const avgMonthlyUsage = params.annualUsage / 12

    for (let month = 0; month < 12; month++) {
      monthlyConsumption.push(Math.round(avgMonthlyUsage * seasonalFactors[month]))
    }

    // Calculate net metering
    const monthlyNet = monthlyProduction.map((prod, i) => prod - monthlyConsumption[i])
    const annualNet = monthlyNet.reduce((sum, month) => sum + month, 0)
    const excessGeneration = Math.max(0, annualNet)

    // Financial analysis
    const financial = calculateFinancialAnalysis(
      annualProduction,
      params.annualUsage,
      params.electricityRate,
      params.installationCost,
      params.incentives,
      params.degradationRate,
      params.analysisYears,
    )

    // Environmental impact
    const co2Offset = annualProduction * 0.0007 * params.analysisYears // metric tons CO2
    const treesEquivalent = Math.round(co2Offset * 16) // trees planted
    const carsOffRoad = Math.round(co2Offset * 0.22) // cars off road for a year

    // System details
    const estimatedRoofArea = params.panelCount * 20 // sq ft per panel
    const inverterCount = Math.ceil(params.systemSize / 10) // 10kW per inverter

    const results: AdvancedSolarResults = {
      monthlyProduction,
      annualProduction,
      monthlyConsumption,
      annualConsumption: params.annualUsage,
      netMetering: {
        monthlyNet,
        annualNet,
        excessGeneration,
      },
      financial,
      environmental: {
        co2Offset: Math.round(co2Offset * 100) / 100,
        treesEquivalent,
        carsOffRoad,
      },
      systemDetails: {
        totalSystemSize: params.systemSize,
        panelCount: params.panelCount,
        estimatedRoofArea,
        inverterCount,
        expectedLifespan: 25,
      },
    }

    // Save calculation to database only if user has email
    if (user.email) {
      await saveAdvancedCalculation(user.email, params, results)
    }

    return results
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    throw new Error(error instanceof Error ? error.message : "Calculation failed")
  }
}

// Get user's saved calculations
export async function getUserAdvancedCalculations() {
  try {
    const user = await getCurrentUserReal()
    if (!user?.email) {
      return { calculations: [] }
    }

    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_email", user.email)
      .eq("calculation_type", "advanced")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching calculations:", error)
      return { calculations: [] }
    }

    return { calculations: data || [] }
  } catch (error) {
    console.error("Error fetching user calculations:", error)
    return { calculations: [] }
  }
}
