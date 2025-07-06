"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { cookies } from "next/headers"

interface CalculationResult {
  annualProduction: number
  monthlyProduction: number[]
  dailyAverage: number
  peakProduction: number
  systemSize: number
  panelCount: number
  estimatedCost: number
  annualSavings: number
  paybackPeriod: number
  co2Offset: number
  roofArea: number
  sunHours: number
}

interface SolarParams {
  address: string
  lat: number
  lng: number
  monthlyBill: number
  roofSize: number
  shading: string
  roofType: string
  electricityRate: number
}

async function fetchSunHours(lat: number, lng: number): Promise<number> {
  try {
    const nrelApiKey = process.env.NREL_API_KEY
    if (!nrelApiKey) {
      console.warn("NREL API key not found, using default sun hours")
      return 5.0 // Default sun hours
    }

    const url = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${nrelApiKey}&lat=${lat}&lon=${lng}`
    const response = await fetch(url)

    if (!response.ok) {
      console.warn("NREL API request failed, using default sun hours")
      return 5.0
    }

    const data = await response.json()
    return data.outputs?.avg_ghi?.annual || 5.0
  } catch (error) {
    console.error("Error fetching sun hours:", error)
    return 5.0 // Fallback value
  }
}

async function saveCalculation(userEmail: string, params: SolarParams, results: CalculationResult) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { error } = await supabase.from("solar_calculations").insert({
      user_email: userEmail,
      calculation_type: "basic",
      input_data: params,
      results: results,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving calculation:", error)
    }
  } catch (error) {
    console.error("Error saving calculation:", error)
  }
}

export async function performSolarCalculation(params: SolarParams): Promise<CalculationResult> {
  try {
    // Get current user
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Fetch sun hours data
    const sunHours = await fetchSunHours(params.lat, params.lng)

    // Calculate annual usage from monthly bill
    const annualUsage = (params.monthlyBill / params.electricityRate) * 12

    // Calculate system size needed (kW)
    const systemSize = annualUsage / (sunHours * 365 * 0.8) // 80% efficiency factor

    // Apply shading factor
    let shadingFactor = 1.0
    switch (params.shading) {
      case "heavy":
        shadingFactor = 0.7
        break
      case "moderate":
        shadingFactor = 0.85
        break
      case "light":
        shadingFactor = 0.95
        break
      default:
        shadingFactor = 1.0
    }

    // Apply roof type factor
    let roofFactor = 1.0
    switch (params.roofType) {
      case "asphalt":
        roofFactor = 1.0
        break
      case "metal":
        roofFactor = 1.05
        break
      case "tile":
        roofFactor = 0.95
        break
      case "flat":
        roofFactor = 0.9
        break
      default:
        roofFactor = 1.0
    }

    // Calculate adjusted system size
    const adjustedSystemSize = Math.min(systemSize, params.roofSize / 100) // Limit by roof size

    // Calculate annual production
    const annualProduction = adjustedSystemSize * sunHours * 365 * shadingFactor * roofFactor

    // Calculate monthly production (simplified seasonal variation)
    const monthlyProduction = []
    const seasonalFactors = [0.8, 0.9, 1.1, 1.2, 1.3, 1.3, 1.4, 1.3, 1.1, 1.0, 0.8, 0.7]

    for (let i = 0; i < 12; i++) {
      monthlyProduction.push((annualProduction / 12) * seasonalFactors[i])
    }

    // Calculate other metrics
    const dailyAverage = annualProduction / 365
    const peakProduction = adjustedSystemSize * 5 // Assuming 5 hours of peak sun
    const panelCount = Math.ceil((adjustedSystemSize * 1000) / 400) // 400W panels
    const estimatedCost = adjustedSystemSize * 3000 // $3/W installed cost
    const annualSavings = Math.min(annualProduction, annualUsage) * params.electricityRate
    const paybackPeriod = estimatedCost / annualSavings
    const co2Offset = annualProduction * 0.0004 * 1000 // kg CO2 per year
    const roofArea = adjustedSystemSize * 100 // sq ft needed

    const results: CalculationResult = {
      annualProduction: Math.round(annualProduction),
      monthlyProduction: monthlyProduction.map((p) => Math.round(p)),
      dailyAverage: Math.round(dailyAverage),
      peakProduction: Math.round(peakProduction),
      systemSize: Math.round(adjustedSystemSize * 10) / 10,
      panelCount,
      estimatedCost: Math.round(estimatedCost),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Offset: Math.round(co2Offset),
      roofArea: Math.round(roofArea),
      sunHours: Math.round(sunHours * 10) / 10,
    }

    // Save calculation to database if user is authenticated
    if (user?.email) {
      await saveCalculation(user.email, params, results)
    }

    return results
  } catch (error) {
    console.error("Solar calculation error:", error)
    throw new Error("Failed to perform solar calculation")
  }
}
