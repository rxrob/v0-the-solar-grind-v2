"use server"

import { createClient } from "@/lib/supabase-server"

interface SolarCalculationInput {
  monthlyBill: number
  roofArea: number
  sunHours: number
  electricityRate: number
  systemEfficiency?: number
  userId?: string
}

interface SolarCalculationResult {
  success: boolean
  error?: string
  data?: {
    systemSize: number
    panelsNeeded: number
    annualProduction: number
    annualSavings: number
    paybackPeriod: number
    co2Reduction: number
    installationCost: number
    monthlyProduction: number
    roofCoverage: number
  }
}

export async function calculateBasicSolar(input: SolarCalculationInput): Promise<SolarCalculationResult> {
  try {
    const { monthlyBill, roofArea, sunHours, electricityRate, systemEfficiency = 0.85, userId } = input

    // Validate inputs
    if (monthlyBill <= 0 || roofArea <= 0 || sunHours <= 0 || electricityRate <= 0) {
      return {
        success: false,
        error: "All input values must be greater than zero",
      }
    }

    // Calculate annual energy consumption (kWh)
    const annualConsumption = (monthlyBill / electricityRate) * 12

    // Calculate required system size (kW)
    const systemSize = annualConsumption / (sunHours * 365 * systemEfficiency)

    // Calculate number of panels needed (assuming 400W panels)
    const panelWattage = 400
    const panelsNeeded = Math.ceil((systemSize * 1000) / panelWattage)

    // Calculate actual system size based on panels
    const actualSystemSize = (panelsNeeded * panelWattage) / 1000

    // Calculate annual production
    const annualProduction = actualSystemSize * sunHours * 365 * systemEfficiency

    // Calculate monthly production
    const monthlyProduction = annualProduction / 12

    // Calculate annual savings
    const annualSavings = Math.min(annualProduction * electricityRate, monthlyBill * 12)

    // Calculate installation cost (assuming $3/W)
    const installationCost = actualSystemSize * 1000 * 3

    // Calculate payback period
    const paybackPeriod = installationCost / annualSavings

    // Calculate CO2 reduction (assuming 0.92 lbs CO2 per kWh)
    const co2Reduction = annualProduction * 0.92

    // Calculate roof coverage (assuming 20 sq ft per panel)
    const panelArea = panelsNeeded * 20
    const roofCoverage = (panelArea / roofArea) * 100

    const result = {
      systemSize: Math.round(actualSystemSize * 100) / 100,
      panelsNeeded,
      annualProduction: Math.round(annualProduction),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Reduction: Math.round(co2Reduction),
      installationCost: Math.round(installationCost),
      monthlyProduction: Math.round(monthlyProduction),
      roofCoverage: Math.round(roofCoverage * 10) / 10,
    }

    // Save calculation to database if user is provided
    if (userId) {
      try {
        const supabase = await createClient()
        await supabase.from("solar_calculations").insert({
          user_id: userId,
          calculation_type: "basic",
          input_data: input,
          result_data: result,
          created_at: new Date().toISOString(),
        })

        // Update user's calculation count
        await supabase.rpc("increment_user_calculations", { user_id: userId })
      } catch (dbError) {
        console.error("Error saving calculation:", dbError)
        // Don't fail the calculation if database save fails
      }
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Solar calculation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Calculation failed",
    }
  }
}

export async function getUserCalculationCount(userId: string): Promise<number> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("users").select("calculations_used").eq("id", userId).single()

    if (error) {
      console.error("Error getting calculation count:", error)
      return 0
    }

    return data?.calculations_used || 0
  } catch (error) {
    console.error("Get calculation count error:", error)
    return 0
  }
}

export async function checkCalculationLimit(userId: string): Promise<{ canCalculate: boolean; remaining: number }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("users")
      .select("calculations_used, monthly_calculation_limit, subscription_type")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error checking calculation limit:", error)
      return { canCalculate: false, remaining: 0 }
    }

    const used = data?.calculations_used || 0
    const limit = data?.monthly_calculation_limit || 3
    const subscriptionType = data?.subscription_type || "free"

    // Pro users have unlimited calculations
    if (subscriptionType === "pro") {
      return { canCalculate: true, remaining: -1 } // -1 indicates unlimited
    }

    const remaining = Math.max(0, limit - used)
    const canCalculate = remaining > 0

    return { canCalculate, remaining }
  } catch (error) {
    console.error("Check calculation limit error:", error)
    return { canCalculate: false, remaining: 0 }
  }
}
