"use server"

import { createClient } from "@/lib/supabase-server"
import { cookies } from "next/headers"
import { trackUsage, checkUsageLimit } from "./usage-tracking"

interface BasicSolarInput {
  monthlyBill: number
  roofArea: number
  location: string
  sunHours: number
}

interface BasicSolarResult {
  systemSize: number
  estimatedCost: number
  annualSavings: number
  paybackPeriod: number
  co2Reduction: number
  panelsNeeded: number
  monthlyProduction: number
  success: boolean
  message?: string
}

export async function calculateBasicSolar(input: BasicSolarInput): Promise<BasicSolarResult> {
  try {
    const supabase = await createClient()
    const cookieStore = await cookies()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        systemSize: 0,
        estimatedCost: 0,
        annualSavings: 0,
        paybackPeriod: 0,
        co2Reduction: 0,
        panelsNeeded: 0,
        monthlyProduction: 0,
        success: false,
        message: "Authentication required",
      }
    }

    // Check usage limits for free users
    const usageCheck = await checkUsageLimit(user.id)
    if (!usageCheck.canCalculate) {
      return {
        systemSize: 0,
        estimatedCost: 0,
        annualSavings: 0,
        paybackPeriod: 0,
        co2Reduction: 0,
        panelsNeeded: 0,
        monthlyProduction: 0,
        success: false,
        message: usageCheck.message,
      }
    }

    // Basic solar calculations
    const avgElectricityRate = 0.13 // $0.13 per kWh average
    const monthlyUsage = input.monthlyBill / avgElectricityRate
    const annualUsage = monthlyUsage * 12

    // System sizing (accounting for efficiency losses)
    const systemEfficiency = 0.85 // 85% system efficiency
    const systemSize = annualUsage / (input.sunHours * 365 * systemEfficiency) / 1000 // kW

    // Panel calculations
    const panelWattage = 400 // 400W panels
    const panelsNeeded = Math.ceil((systemSize * 1000) / panelWattage)

    // Cost calculations
    const costPerWatt = 3.5 // $3.50 per watt installed
    const estimatedCost = systemSize * 1000 * costPerWatt

    // Federal tax credit (30%)
    const federalTaxCredit = estimatedCost * 0.3
    const netCost = estimatedCost - federalTaxCredit

    // Savings calculations
    const annualProduction = systemSize * input.sunHours * 365 * systemEfficiency
    const annualSavings = annualProduction * avgElectricityRate
    const monthlyProduction = annualProduction / 12

    // Payback period
    const paybackPeriod = netCost / annualSavings

    // CO2 reduction (0.92 lbs CO2 per kWh)
    const co2Reduction = annualProduction * 0.92

    const result: BasicSolarResult = {
      systemSize: Math.round(systemSize * 100) / 100,
      estimatedCost: Math.round(estimatedCost),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Reduction: Math.round(co2Reduction),
      panelsNeeded,
      monthlyProduction: Math.round(monthlyProduction),
      success: true,
    }

    // Save calculation to database
    try {
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
    } catch (saveError) {
      console.error("Error saving calculation:", saveError)
    }

    // Track usage
    await trackUsage(user.id, "basic_calculation")

    return result
  } catch (error) {
    console.error("Basic solar calculation error:", error)
    return {
      systemSize: 0,
      estimatedCost: 0,
      annualSavings: 0,
      paybackPeriod: 0,
      co2Reduction: 0,
      panelsNeeded: 0,
      monthlyProduction: 0,
      success: false,
      message: "Calculation failed. Please try again.",
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
      console.error("Error saving basic calculation:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Save basic calculation error:", error)
    return { success: false, error: "Failed to save calculation" }
  }
}
