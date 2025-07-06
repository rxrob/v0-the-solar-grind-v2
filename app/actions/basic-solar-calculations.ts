"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

interface SolarCalculationInput {
  address: string
  monthlyBill: number
  roofArea?: number
  sunHours?: number
  userId?: string
}

interface SolarCalculationResult {
  success: boolean
  error?: string
  data?: {
    systemSize: number
    panelsNeeded: number
    estimatedCost: number
    annualSavings: number
    paybackPeriod: number
    co2Reduction: number
    monthlyProduction: number
    roofAreaUsed: number
  }
}

export async function calculateBasicSolar(input: SolarCalculationInput): Promise<SolarCalculationResult> {
  try {
    const supabase = await createClient()

    // Basic solar calculations
    const averageElectricityRate = 0.13 // $0.13 per kWh
    const monthlyUsage = input.monthlyBill / averageElectricityRate
    const annualUsage = monthlyUsage * 12

    // System sizing (assuming 4 hours of peak sun per day if not provided)
    const peakSunHours = input.sunHours || 4
    const systemSize = annualUsage / (peakSunHours * 365) // kW

    // Panel calculations (assuming 400W panels)
    const panelWattage = 0.4 // kW per panel
    const panelsNeeded = Math.ceil(systemSize / panelWattage)

    // Cost calculations
    const costPerWatt = 3.5 // $3.50 per watt installed
    const estimatedCost = systemSize * 1000 * costPerWatt

    // Savings calculations
    const annualProduction = systemSize * peakSunHours * 365
    const annualSavings = annualProduction * averageElectricityRate
    const paybackPeriod = estimatedCost / annualSavings

    // Environmental impact
    const co2ReductionPerKwh = 0.92 // lbs CO2 per kWh
    const co2Reduction = annualProduction * co2ReductionPerKwh

    // Roof area (assuming 20 sq ft per panel)
    const roofAreaUsed = panelsNeeded * 20

    const calculationData = {
      systemSize: Math.round(systemSize * 100) / 100,
      panelsNeeded,
      estimatedCost: Math.round(estimatedCost),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Reduction: Math.round(co2Reduction),
      monthlyProduction: Math.round(annualProduction / 12),
      roofAreaUsed,
    }

    // Save calculation to database if user is provided
    if (input.userId) {
      const { error: saveError } = await supabase.from("solar_calculations").insert({
        user_id: input.userId,
        calculation_type: "basic",
        input_data: input,
        result_data: calculationData,
        created_at: new Date().toISOString(),
      })

      if (saveError) {
        console.error("Error saving calculation:", saveError)
        // Don't fail the calculation if saving fails
      }

      revalidatePath("/dashboard")
    }

    return {
      success: true,
      data: calculationData,
    }
  } catch (error) {
    console.error("Basic solar calculation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Calculation failed",
    }
  }
}

export async function getSavedCalculations(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting saved calculations:", error)
      return {
        success: false,
        error: error.message,
        data: [],
      }
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error("Get saved calculations error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get calculations",
      data: [],
    }
  }
}

export async function deleteCalculation(calculationId: string, userId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from("solar_calculations").delete().eq("id", calculationId).eq("user_id", userId)

    if (error) {
      console.error("Error deleting calculation:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Delete calculation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete calculation",
    }
  }
}
