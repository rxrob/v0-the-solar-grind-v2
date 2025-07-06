"use server"

import { getCurrentUserReal } from "./auth-real"
import { createServerClient } from "@/lib/supabase-server-client"

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
}

export async function calculateAdvancedSolar(params: AdvancedSolarParams): Promise<AdvancedSolarResults> {
  try {
    // Get current user
    const userResult = await getCurrentUserReal()
    if (!userResult.success || !userResult.user) {
      throw new Error("User not authenticated")
    }

    const user = userResult.user

    // Calculate system size based on monthly bill and electricity rate
    const annualConsumption = (params.monthlyBill * 12) / params.electricityRate
    const systemSize = annualConsumption / (365 * 5.5 * params.systemEfficiency) // Assuming 5.5 peak sun hours average

    // Calculate panel count
    const panelCount = Math.ceil((systemSize * 1000) / params.panelWattage)

    // Calculate annual production with all efficiency factors
    const baseProduction = systemSize * 365 * 5.5 // kWh per year
    const annualProduction =
      baseProduction *
      params.systemEfficiency *
      params.inverterEfficiency *
      (1 - params.shadingFactor) *
      Math.cos(((params.roofTilt - 30) * Math.PI) / 180) * // Optimal tilt adjustment
      Math.cos(((params.roofAzimuth - 180) * Math.PI) / 180) // Optimal azimuth adjustment

    // Calculate monthly production (simplified seasonal variation)
    const monthlyProduction = Array.from({ length: 12 }, (_, month) => {
      const seasonalFactor = 0.8 + 0.4 * Math.cos(((month - 5) * Math.PI) / 6) // Peak in summer
      return (annualProduction / 12) * seasonalFactor
    })

    // Financial calculations
    const annualSavings = annualProduction * params.electricityRate * params.netMeteringRate
    const totalCost = params.installationCost + params.maintenanceCost * params.analysisYears
    const netCost = totalCost - params.incentives

    // Calculate degraded production over time
    let totalSavings = 0
    let cumulativeSavings = 0
    let paybackYear = 0

    for (let year = 1; year <= params.analysisYears; year++) {
      const yearlyProduction = annualProduction * Math.pow(1 - params.degradationRate, year - 1)
      const yearlySavings = yearlyProduction * params.electricityRate * params.netMeteringRate
      totalSavings += yearlySavings
      cumulativeSavings += yearlySavings

      if (paybackYear === 0 && cumulativeSavings >= netCost) {
        paybackYear = year
      }
    }

    const paybackPeriod = paybackYear || netCost / annualSavings
    const roi = ((totalSavings - netCost) / netCost) * 100
    const co2Offset = annualProduction * 0.0004 * params.analysisYears // tons of CO2
    const monthlyPayment = netCost / (params.analysisYears * 12)
    const breakEvenYear = Math.ceil(paybackPeriod)
    const lifetimeSavings = totalSavings - netCost

    const results: AdvancedSolarResults = {
      systemSize: Math.round(systemSize * 100) / 100,
      panelCount,
      annualProduction: Math.round(annualProduction),
      monthlyProduction: monthlyProduction.map((p) => Math.round(p)),
      annualSavings: Math.round(annualSavings),
      totalSavings: Math.round(totalSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      roi: Math.round(roi * 10) / 10,
      co2Offset: Math.round(co2Offset * 100) / 100,
      totalCost: Math.round(totalCost),
      netCost: Math.round(netCost),
      monthlyPayment: Math.round(monthlyPayment),
      breakEvenYear,
      lifetimeSavings: Math.round(lifetimeSavings),
    }

    // Save calculation to database only if user has email
    if (user.email) {
      await saveAdvancedCalculation(user.email, params, results)
    }

    return results
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    throw new Error("Failed to calculate advanced solar analysis")
  }
}

async function saveAdvancedCalculation(userEmail: string, params: AdvancedSolarParams, results: AdvancedSolarResults) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("solar_calculations").insert({
      user_email: userEmail,
      calculation_type: "advanced",
      input_params: params,
      results: results,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving calculation:", error)
    }
  } catch (error) {
    console.error("Error saving advanced calculation:", error)
  }
}

export async function getAdvancedCalculationHistory(userEmail: string) {
  try {
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_email", userEmail)
      .eq("calculation_type", "advanced")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching calculation history:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching advanced calculation history:", error)
    return []
  }
}
