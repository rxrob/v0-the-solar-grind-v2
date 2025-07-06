"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface SolarCalculationInput {
  monthlyBill: number
  roofSize: number
  location: string
  userId?: string
  panelType?: string
  roofType?: string
  shading?: string
}

interface SolarCalculationResult {
  systemSize: number
  estimatedCost: number
  annualSavings: number
  paybackPeriod: number
  co2Reduction: number
  panelsNeeded: number
  roofCoverage: number
  monthlyPayment: number
  twentyYearSavings: number
  efficiency: number
}

export async function calculateSolarSystem(input: SolarCalculationInput): Promise<SolarCalculationResult> {
  const { monthlyBill, roofSize, location, panelType = "standard", roofType = "asphalt", shading = "none" } = input

  // Enhanced calculations with more factors
  const annualUsage = monthlyBill * 12 * 12 // Rough kWh estimate

  // Panel efficiency factors
  const panelEfficiencyMap = {
    standard: 0.18,
    premium: 0.22,
    monocrystalline: 0.2,
    polycrystalline: 0.16,
  }

  const efficiency = panelEfficiencyMap[panelType as keyof typeof panelEfficiencyMap] || 0.18

  // Shading factors
  const shadingFactorMap = {
    none: 1.0,
    minimal: 0.95,
    moderate: 0.85,
    heavy: 0.7,
  }

  const shadingFactor = shadingFactorMap[shading as keyof typeof shadingFactorMap] || 1.0

  // Location factors (simplified)
  const locationFactorMap: { [key: string]: number } = {
    california: 1.3,
    arizona: 1.4,
    florida: 1.2,
    texas: 1.25,
    nevada: 1.35,
    default: 1.0,
  }

  const locationFactor = locationFactorMap[location.toLowerCase()] || locationFactorMap.default

  // System sizing
  const baseSystemSize = Math.min(annualUsage / 1200, roofSize / 100) // kW
  const systemSize = baseSystemSize * efficiency * shadingFactor * locationFactor
  const panelsNeeded = Math.ceil(systemSize / 0.4) // 400W panels
  const roofCoverage = (panelsNeeded * 20) / roofSize // sq ft per panel

  // Cost calculations
  const costPerWatt = panelType === "premium" ? 4.0 : 3.5
  const estimatedCost = systemSize * 1000 * costPerWatt
  const federalTaxCredit = estimatedCost * 0.3
  const netCost = estimatedCost - federalTaxCredit

  // Production and savings
  const annualProduction = systemSize * 1200 * locationFactor * shadingFactor
  const electricityRate = 0.13 // per kWh
  const annualSavings = annualProduction * electricityRate
  const paybackPeriod = netCost / annualSavings
  const twentyYearSavings = annualSavings * 20 - netCost

  // Environmental impact
  const co2Reduction = annualProduction * 0.92 // lbs CO2 per kWh

  // Financing
  const monthlyPayment = netCost / (20 * 12) // 20-year loan estimate

  return {
    systemSize: Math.round(systemSize * 100) / 100,
    estimatedCost: Math.round(estimatedCost),
    annualSavings: Math.round(annualSavings),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    co2Reduction: Math.round(co2Reduction),
    panelsNeeded,
    roofCoverage: Math.round(roofCoverage * 100),
    monthlyPayment: Math.round(monthlyPayment),
    twentyYearSavings: Math.round(twentyYearSavings),
    efficiency: Math.round(efficiency * 100),
  }
}

export async function saveSolarCalculation(
  userId: string,
  input: SolarCalculationInput,
  result: SolarCalculationResult,
) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    const { error } = await supabase.from("solar_calculations").insert({
      user_id: userId,
      calculation_type: "standard",
      input_data: input,
      result_data: result,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving calculation:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving calculation:", error)
    return { success: false, error: "Failed to save calculation" }
  }
}

export async function getUserSolarCalculations(userId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("calculation_type", "standard")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching calculations:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching calculations:", error)
    return { success: false, error: "Failed to fetch calculations", data: [] }
  }
}
