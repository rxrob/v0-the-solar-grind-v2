"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

interface SolarCalculationInput {
  address: string
  monthlyBill: number
  roofArea: number
  roofType: string
  shadingLevel: string
  electricityRate: number
}

interface SolarCalculationResult {
  systemSizeKw: number
  panelsNeeded: number
  annualProductionKwh: number
  systemCost: number
  netCost: number
  annualSavings: number
  monthlySavings: number
  roiYears: number
  co2OffsetTons: number
  treesEquivalent: number
}

export async function performSolarCalculation(input: SolarCalculationInput): Promise<{
  success: boolean
  data?: SolarCalculationResult
  error?: string
}> {
  try {
    // Validate inputs
    if (!input.address || !input.monthlyBill || !input.roofArea) {
      return { success: false, error: "Required fields are missing" }
    }

    // Solar calculation logic
    const avgDailySunHours = 5.5 // Default for most US locations
    const systemEfficiency = 0.85
    const panelWattage = 400
    const costPerWatt = 3.0
    const federalTaxCredit = 0.3

    // Calculate system size needed
    const annualKwhNeeded = (input.monthlyBill * 12) / input.electricityRate
    const systemSizeKw = annualKwhNeeded / (avgDailySunHours * 365 * systemEfficiency)

    // Round to nearest 0.5 kW
    const roundedSystemSize = Math.round(systemSizeKw * 2) / 2

    // Calculate panels needed
    const panelsNeeded = Math.ceil((roundedSystemSize * 1000) / panelWattage)

    // Recalculate actual system size based on panels
    const actualSystemSize = (panelsNeeded * panelWattage) / 1000

    // Calculate production
    const annualProductionKwh = Math.round(actualSystemSize * avgDailySunHours * 365 * systemEfficiency)

    // Calculate costs
    const systemCost = Math.round(actualSystemSize * 1000 * costPerWatt)
    const taxCredit = Math.round(systemCost * federalTaxCredit)
    const netCost = systemCost - taxCredit

    // Calculate savings
    const annualSavings = Math.round(annualProductionKwh * input.electricityRate)
    const monthlySavings = Math.round(annualSavings / 12)

    // Calculate ROI
    const roiYears = Math.round((netCost / annualSavings) * 10) / 10

    // Environmental impact
    const co2OffsetTons = Math.round(annualProductionKwh * 0.0004 * 100) / 100
    const treesEquivalent = Math.round(co2OffsetTons * 16)

    const result: SolarCalculationResult = {
      systemSizeKw: actualSystemSize,
      panelsNeeded,
      annualProductionKwh,
      systemCost,
      netCost,
      annualSavings,
      monthlySavings,
      roiYears,
      co2OffsetTons,
      treesEquivalent,
    }

    // Save calculation to database
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase.from("solar_calculations").insert({
        user_id: user.id,
        calculation_type: "advanced",
        input_data: input,
        result_data: result,
        created_at: new Date().toISOString(),
      })

      revalidatePath("/dashboard")
    }

    return { success: true, data: result }
  } catch (error) {
    console.error("Solar calculation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Calculation failed",
    }
  }
}

export async function getSolarCalculations() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching calculations:", error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Get calculations error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch calculations",
    }
  }
}
