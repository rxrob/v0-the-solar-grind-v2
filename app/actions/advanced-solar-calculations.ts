"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { redirect } from "next/navigation"

interface AdvancedSolarParams {
  address: string
  monthlyBill: number
  roofArea: number
  roofTilt: number
  roofAzimuth: number
  shadingFactor: number
  systemEfficiency: number
  panelWattage: number
  inverterEfficiency: number
  degradationRate: number
  electricityRate: number
  netMeteringRate: number
  incentives: number
  installationCost: number
  maintenanceCost: number
  analysisYears: number
}

interface AdvancedSolarResults {
  systemSize: number
  panelCount: number
  annualProduction: number
  monthlyProduction: number[]
  annualSavings: number
  totalSavings: number
  paybackPeriod: number
  roi: number
  co2Offset: number
  totalCost: number
  netCost: number
  monthlyPayment: number
  breakEvenYear: number
  lifetimeSavings: number
  energyIndependence: number
  peakSunHours: number
  systemEfficiencyRating: string
  recommendedUpgrades: string[]
  financialAnalysis: {
    year: number
    production: number
    savings: number
    cumulativeSavings: number
    systemValue: number
  }[]
}

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
    }
  } catch (error) {
    console.error("Error in saveAdvancedCalculation:", error)
  }
}

export async function performAdvancedSolarCalculation(params: AdvancedSolarParams): Promise<AdvancedSolarResults> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    // Get location data for solar calculations
    const geocodingResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/geocoding?address=${encodeURIComponent(params.address)}`,
    )
    const locationData = await geocodingResponse.json()

    if (!locationData.success) {
      throw new Error("Failed to geocode address")
    }

    const { lat, lng } = locationData.data

    // Get NREL solar data
    const nrelResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/nrel-pvwatts?lat=${lat}&lon=${lng}&system_capacity=${params.roofArea * 0.15}&azimuth=${params.roofAzimuth}&tilt=${params.roofTilt}&array_type=1&module_type=1&losses=14`,
    )
    const nrelData = await nrelResponse.json()

    if (!nrelData.success) {
      throw new Error("Failed to get NREL data")
    }

    // Calculate system specifications
    const systemSize = Math.min(params.roofArea * 0.15, (params.monthlyBill * 12) / (params.electricityRate * 1200))
    const panelCount = Math.ceil((systemSize * 1000) / params.panelWattage)
    const actualSystemSize = (panelCount * params.panelWattage) / 1000

    // Get peak sun hours from NREL data
    const peakSunHours = nrelData.data.outputs.solrad_annual / 365

    // Calculate annual production with all efficiency factors
    const baseAnnualProduction = actualSystemSize * peakSunHours * 365
    const annualProduction =
      baseAnnualProduction *
      (params.systemEfficiency / 100) *
      (params.inverterEfficiency / 100) *
      (1 - params.shadingFactor / 100)

    // Calculate monthly production distribution
    const monthlyProduction = nrelData.data.outputs.solrad_monthly.map((monthlyRadiation: number) => {
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      const monthIndex = nrelData.data.outputs.solrad_monthly.indexOf(monthlyRadiation)
      return (
        actualSystemSize *
        monthlyRadiation *
        daysInMonth[monthIndex] *
        (params.systemEfficiency / 100) *
        (params.inverterEfficiency / 100) *
        (1 - params.shadingFactor / 100)
      )
    })

    // Financial calculations
    const annualSavings = annualProduction * params.netMeteringRate
    const totalCost = params.installationCost + params.maintenanceCost * params.analysisYears
    const netCost = totalCost - params.incentives

    // Calculate payback period
    const paybackPeriod = netCost / annualSavings

    // Calculate total savings over analysis period
    let totalSavings = 0
    const financialAnalysis = []

    for (let year = 1; year <= params.analysisYears; year++) {
      const yearlyDegradation = Math.pow(1 - params.degradationRate / 100, year - 1)
      const yearlyProduction = annualProduction * yearlyDegradation
      const yearlySavings = yearlyProduction * params.electricityRate
      totalSavings += yearlySavings

      financialAnalysis.push({
        year,
        production: yearlyProduction,
        savings: yearlySavings,
        cumulativeSavings: totalSavings,
        systemValue: actualSystemSize * 1000 * (1 - year * 0.02), // Depreciation estimate
      })
    }

    const roi = ((totalSavings - netCost) / netCost) * 100
    const lifetimeSavings = totalSavings - netCost
    const monthlyPayment = netCost / (params.analysisYears * 12)
    const breakEvenYear = Math.ceil(paybackPeriod)

    // Environmental impact
    const co2Offset = annualProduction * 0.0007 * params.analysisYears // metric tons CO2

    // Energy independence calculation
    const annualConsumption = (params.monthlyBill * 12) / params.electricityRate
    const energyIndependence = Math.min((annualProduction / annualConsumption) * 100, 100)

    // System efficiency rating
    let systemEfficiencyRating = "Good"
    const overallEfficiency = (params.systemEfficiency * params.inverterEfficiency) / 100
    if (overallEfficiency > 85) systemEfficiencyRating = "Excellent"
    else if (overallEfficiency > 75) systemEfficiencyRating = "Very Good"
    else if (overallEfficiency < 65) systemEfficiencyRating = "Needs Improvement"

    // Recommendations
    const recommendedUpgrades = []
    if (params.systemEfficiency < 80) recommendedUpgrades.push("Consider higher efficiency panels")
    if (params.inverterEfficiency < 95) recommendedUpgrades.push("Upgrade to premium inverter")
    if (params.shadingFactor > 20) recommendedUpgrades.push("Address shading issues")
    if (params.roofTilt < 25 || params.roofTilt > 40) recommendedUpgrades.push("Optimize panel tilt angle")

    const results: AdvancedSolarResults = {
      systemSize: actualSystemSize,
      panelCount,
      annualProduction,
      monthlyProduction,
      annualSavings,
      totalSavings,
      paybackPeriod,
      roi,
      co2Offset,
      totalCost,
      netCost,
      monthlyPayment,
      breakEvenYear,
      lifetimeSavings,
      energyIndependence,
      peakSunHours,
      systemEfficiencyRating,
      recommendedUpgrades,
      financialAnalysis,
    }

    // Save calculation to database only if user has email
    if (user.email) {
      await saveAdvancedCalculation(user.email, params, results)
    }

    return results
  } catch (error) {
    console.error("Error in advanced solar calculation:", error)
    throw new Error("Failed to perform advanced solar calculation")
  }
}
