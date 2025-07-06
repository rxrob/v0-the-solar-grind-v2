"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface AdvancedSolarInput {
  monthlyBill: number
  roofSize: number
  location: string
  panelType: string
  roofType: string
  shading: string
  tiltAngle: number
  azimuthAngle: number
  electricityRate: number
  netMeteringRate: number
  userId?: string
}

interface AdvancedSolarResult {
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
  monthlyProduction: number[]
  annualProduction: number
  roi: number
  netPresentValue: number
}

export async function calculateAdvancedSolarSystem(input: AdvancedSolarInput): Promise<AdvancedSolarResult> {
  const {
    monthlyBill,
    roofSize,
    location,
    panelType,
    roofType,
    shading,
    tiltAngle,
    azimuthAngle,
    electricityRate,
    netMeteringRate,
  } = input

  // Advanced calculations with detailed factors
  const annualUsage = (monthlyBill * 12) / electricityRate // Actual kWh usage

  // Panel specifications
  const panelSpecs = {
    standard: { efficiency: 0.18, costPerWatt: 3.5, degradation: 0.005 },
    premium: { efficiency: 0.22, costPerWatt: 4.0, degradation: 0.003 },
    monocrystalline: { efficiency: 0.2, costPerWatt: 3.8, degradation: 0.004 },
    polycrystalline: { efficiency: 0.16, costPerWatt: 3.2, degradation: 0.006 },
  }

  const specs = panelSpecs[panelType as keyof typeof panelSpecs] || panelSpecs.standard

  // Environmental factors
  const shadingFactors = {
    none: 1.0,
    minimal: 0.95,
    moderate: 0.85,
    heavy: 0.7,
  }

  const roofTypeFactors = {
    asphalt: 1.0,
    metal: 1.05,
    tile: 0.95,
    flat: 0.9,
  }

  // Location-based solar irradiance (kWh/m²/day)
  const locationIrradiance: { [key: string]: number } = {
    california: 5.5,
    arizona: 6.5,
    florida: 5.0,
    texas: 5.2,
    nevada: 6.0,
    default: 4.5,
  }

  const irradiance = locationIrradiance[location.toLowerCase()] || locationIrradiance.default

  // Tilt and azimuth optimization
  const tiltFactor = Math.cos((Math.abs(tiltAngle - 35) * Math.PI) / 180) * 0.1 + 0.9
  const azimuthFactor = Math.cos((Math.abs(azimuthAngle - 180) * Math.PI) / 180) * 0.1 + 0.9

  // System sizing
  const shadingFactor = shadingFactors[shading as keyof typeof shadingFactors] || 1.0
  const roofFactor = roofTypeFactors[roofType as keyof typeof roofTypeFactors] || 1.0

  const baseSystemSize = Math.min(annualUsage / 1200, roofSize / 100)
  const systemSize = baseSystemSize * specs.efficiency * shadingFactor * roofFactor * tiltFactor * azimuthFactor
  const panelsNeeded = Math.ceil(systemSize / 0.4)
  const roofCoverage = (panelsNeeded * 20) / roofSize

  // Cost calculations
  const estimatedCost = systemSize * 1000 * specs.costPerWatt
  const federalTaxCredit = estimatedCost * 0.3
  const netCost = estimatedCost - federalTaxCredit

  // Monthly production calculation
  const monthlyProduction = Array.from({ length: 12 }, (_, month) => {
    const seasonalFactor = 0.8 + 0.4 * Math.cos(((month - 5) * Math.PI) / 6)
    return Math.round(systemSize * irradiance * 30 * seasonalFactor * shadingFactor * tiltFactor * azimuthFactor)
  })

  const annualProduction = monthlyProduction.reduce((sum, monthly) => sum + monthly, 0)

  // Financial calculations
  const annualSavings = annualProduction * netMeteringRate
  const paybackPeriod = netCost / annualSavings
  const twentyYearSavings = annualSavings * 20 - netCost

  // Advanced financial metrics
  const discountRate = 0.06
  const systemLife = 25
  let npv = -netCost

  for (let year = 1; year <= systemLife; year++) {
    const yearlyProduction = annualProduction * Math.pow(1 - specs.degradation, year - 1)
    const yearlySavings = yearlyProduction * electricityRate * Math.pow(1.03, year - 1) // 3% electricity rate increase
    npv += yearlySavings / Math.pow(1 + discountRate, year)
  }

  const roi = (twentyYearSavings / netCost) * 100

  // Environmental impact
  const co2Reduction = annualProduction * 0.92

  // Financing
  const monthlyPayment = netCost / (20 * 12)

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
    efficiency: Math.round(specs.efficiency * 100),
    monthlyProduction,
    annualProduction: Math.round(annualProduction),
    roi: Math.round(roi * 10) / 10,
    netPresentValue: Math.round(npv),
  }
}

export async function saveAdvancedCalculation(userId: string, input: AdvancedSolarInput, result: AdvancedSolarResult) {
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
      calculation_type: "advanced",
      input_data: input,
      result_data: result,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving advanced calculation:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving advanced calculation:", error)
    return { success: false, error: "Failed to save calculation" }
  }
}

export async function getUserAdvancedCalculations(userId: string) {
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
      .eq("calculation_type", "advanced")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching advanced calculations:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching advanced calculations:", error)
    return { success: false, error: "Failed to fetch calculations", data: [] }
  }
}
