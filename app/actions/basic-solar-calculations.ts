"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface BasicSolarInput {
  monthlyBill: number
  roofSize: number
  location: string
  userId?: string
}

interface BasicSolarResult {
  systemSize: number
  estimatedCost: number
  annualSavings: number
  paybackPeriod: number
  co2Reduction: number
  panelsNeeded: number
  roofCoverage: number
  monthlyPayment: number
  twentyYearSavings: number
}

export async function calculateBasicSolarSystem(input: BasicSolarInput): Promise<BasicSolarResult> {
  const { monthlyBill, roofSize, location } = input

  // Basic calculations
  const annualUsage = monthlyBill * 12 * 12 // Rough kWh estimate
  const systemSize = Math.min(annualUsage / 1200, roofSize / 100) // kW
  const panelsNeeded = Math.ceil(systemSize / 0.4) // 400W panels
  const roofCoverage = (panelsNeeded * 20) / roofSize // sq ft per panel

  // Cost calculations
  const costPerWatt = 3.5
  const estimatedCost = systemSize * 1000 * costPerWatt
  const federalTaxCredit = estimatedCost * 0.3
  const netCost = estimatedCost - federalTaxCredit

  // Savings calculations
  const annualProduction = systemSize * 1200 // kWh per year
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
  }
}

export async function saveBasicCalculation(userId: string, input: BasicSolarInput, result: BasicSolarResult) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.set(name, "", options)
          },
        },
      },
    )

    const { error } = await supabase.from("solar_calculations").insert({
      user_id: userId,
      calculation_type: "basic",
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

export async function getUserBasicCalculations(userId: string) {
  try {
    const cookieStore = cookies()
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
      .eq("calculation_type", "basic")
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

// Export alias for backward compatibility
export const calculateBasicSolar = calculateBasicSolarSystem
