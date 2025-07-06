"use server"

import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { trackUsage, checkUsageLimit } from "./usage-tracking"

interface BasicSolarInput {
  monthlyBill: number
  roofArea: number
  sunHours: number
  location: string
  electricityRate?: number
}

interface BasicSolarResult {
  systemSize: number
  panelsNeeded: number
  estimatedCost: number
  annualSavings: number
  paybackPeriod: number
  co2Reduction: number
  monthlyProduction: number
  roofUtilization: number
}

export async function calculateBasicSolar(input: BasicSolarInput): Promise<{
  success: boolean
  data?: BasicSolarResult
  error?: string
}> {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Authentication required" }
    }

    // Check usage limits for free users
    const usageCheck = await checkUsageLimit(user.id)
    if (!usageCheck.success) {
      return { success: false, error: usageCheck.error }
    }

    // Basic solar calculations
    const electricityRate = input.electricityRate || 0.12 // Default $0.12/kWh
    const annualConsumption = (input.monthlyBill / electricityRate) * 12 // kWh per year
    const dailyConsumption = annualConsumption / 365

    // System sizing (accounting for system efficiency ~85%)
    const systemSize = dailyConsumption / input.sunHours / 0.85 // kW

    // Panel calculations (assuming 400W panels)
    const panelWattage = 0.4 // kW per panel
    const panelsNeeded = Math.ceil(systemSize / panelWattage)

    // Cost estimation ($2.50-3.50 per watt installed)
    const costPerWatt = 3.0
    const estimatedCost = systemSize * 1000 * costPerWatt

    // Savings calculation
    const annualProduction = systemSize * input.sunHours * 365 * 0.85 // kWh
    const annualSavings = annualProduction * electricityRate
    const monthlyProduction = annualProduction / 12

    // Payback period
    const paybackPeriod = estimatedCost / annualSavings

    // Environmental impact (0.92 lbs CO2 per kWh)
    const co2Reduction = annualProduction * 0.92 // lbs CO2 per year

    // Roof utilization (assuming 20 sq ft per panel)
    const panelArea = panelsNeeded * 20
    const roofUtilization = (panelArea / input.roofArea) * 100

    const result: BasicSolarResult = {
      systemSize: Math.round(systemSize * 100) / 100,
      panelsNeeded,
      estimatedCost: Math.round(estimatedCost),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Reduction: Math.round(co2Reduction),
      monthlyProduction: Math.round(monthlyProduction),
      roofUtilization: Math.round(roofUtilization * 10) / 10,
    }

    // Save calculation to database
    const { error: saveError } = await supabase.from("solar_calculations").insert({
      user_id: user.id,
      calculation_type: "basic",
      input_data: input,
      result_data: result,
      created_at: new Date().toISOString(),
    })

    if (saveError) {
      console.error("Error saving calculation:", saveError)
    }

    // Track usage
    await trackUsage(user.id, "basic_calculation")

    return { success: true, data: result }
  } catch (error) {
    console.error("Basic solar calculation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Calculation failed",
    }
  }
}

export async function getUserCalculations(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Get user calculations error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch calculations",
    }
  }
}
