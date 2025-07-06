"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

interface BasicSolarInput {
  monthlyBill: number
  roofSize: number
  location: string
  electricityRate?: number
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
  annualProduction: number
  netCost: number
}

export async function calculateBasicSolar(input: BasicSolarInput): Promise<{
  success: boolean
  data?: BasicSolarResult
  error?: string
}> {
  try {
    const { monthlyBill, roofSize, location, electricityRate = 0.13 } = input

    // Validate inputs
    if (!monthlyBill || !roofSize || !location) {
      return { success: false, error: "All fields are required" }
    }

    if (monthlyBill <= 0 || roofSize <= 0) {
      return { success: false, error: "Values must be greater than zero" }
    }

    // Basic calculations
    const annualUsage = (monthlyBill * 12) / electricityRate // kWh per year
    const systemSize = Math.min(annualUsage / 1200, roofSize / 100) // kW
    const panelsNeeded = Math.ceil(systemSize / 0.4) // 400W panels
    const roofCoverage = ((panelsNeeded * 20) / roofSize) * 100 // percentage

    // Cost calculations
    const costPerWatt = 3.5
    const estimatedCost = systemSize * 1000 * costPerWatt
    const federalTaxCredit = estimatedCost * 0.3
    const netCost = estimatedCost - federalTaxCredit

    // Production and savings calculations
    const annualProduction = systemSize * 1200 // kWh per year
    const annualSavings = annualProduction * electricityRate
    const paybackPeriod = netCost / annualSavings
    const twentyYearSavings = annualSavings * 20 - netCost

    // Environmental impact
    const co2Reduction = annualProduction * 0.92 // lbs CO2 per kWh

    // Financing
    const monthlyPayment = netCost / (20 * 12) // 20-year loan estimate

    const result: BasicSolarResult = {
      systemSize: Math.round(systemSize * 100) / 100,
      estimatedCost: Math.round(estimatedCost),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Reduction: Math.round(co2Reduction),
      panelsNeeded,
      roofCoverage: Math.round(roofCoverage),
      monthlyPayment: Math.round(monthlyPayment),
      twentyYearSavings: Math.round(twentyYearSavings),
      annualProduction: Math.round(annualProduction),
      netCost: Math.round(netCost),
    }

    // Save calculation to database if user is authenticated
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from("solar_calculations").insert({
          user_id: user.id,
          calculation_type: "basic",
          input_data: input,
          result_data: result,
          created_at: new Date().toISOString(),
        })

        revalidatePath("/dashboard")
      }
    } catch (dbError) {
      console.error("Database save error:", dbError)
      // Don't fail the calculation if database save fails
    }

    return { success: true, data: result }
  } catch (error) {
    console.error("Basic solar calculation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Calculation failed",
    }
  }
}

export async function saveBasicCalculation(userId: string, input: BasicSolarInput, result: BasicSolarResult) {
  try {
    const supabase = await createClient()

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

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error saving calculation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save calculation",
    }
  }
}

export async function getUserBasicCalculations(userId: string) {
  try {
    const supabase = await createClient()

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
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch calculations",
      data: [],
    }
  }
}

export async function deleteCalculation(calculationId: string) {
  try {
    const supabase = await createClient()

    // Get current user to verify ownership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase.from("solar_calculations").delete().eq("id", calculationId).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting calculation:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Error deleting calculation:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete calculation",
    }
  }
}
