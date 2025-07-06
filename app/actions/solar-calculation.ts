"use server"

import { createClient } from "@/lib/supabase-server"
import { trackUsage, checkUsageLimit } from "./usage-tracking"

interface AdvancedSolarInput {
  monthlyBill: number
  roofArea: number
  location: string
  sunHours: number
  roofOrientation: string
  roofTilt: number
  shadingFactor: number
  electricityRate: number
  utilityCompany: string
  homeAge: number
  roofCondition: string
}

interface AdvancedSolarResult {
  systemSize: number
  estimatedCost: number
  annualSavings: number
  paybackPeriod: number
  co2Reduction: number
  panelsNeeded: number
  monthlyProduction: number[]
  netMeteringCredit: number
  maintenanceCost: number
  warrantyYears: number
  roiPercentage: number
  success: boolean
  message?: string
}

export async function calculateAdvancedSolar(input: AdvancedSolarInput): Promise<AdvancedSolarResult> {
  try {
    const supabase = await createClient()

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
        monthlyProduction: [],
        netMeteringCredit: 0,
        maintenanceCost: 0,
        warrantyYears: 25,
        roiPercentage: 0,
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
        monthlyProduction: [],
        netMeteringCredit: 0,
        maintenanceCost: 0,
        warrantyYears: 25,
        roiPercentage: 0,
        success: false,
        message: usageCheck.message,
      }
    }

    // Advanced calculations with efficiency factors
    const monthlyUsage = input.monthlyBill / input.electricityRate
    const annualUsage = monthlyUsage * 12

    // Orientation efficiency factor
    const orientationFactors: { [key: string]: number } = {
      south: 1.0,
      southwest: 0.95,
      southeast: 0.95,
      west: 0.88,
      east: 0.88,
      northwest: 0.78,
      northeast: 0.78,
      north: 0.68,
    }

    const orientationFactor = orientationFactors[input.roofOrientation.toLowerCase()] || 0.85

    // Tilt efficiency factor (optimal is around 30-40 degrees)
    const optimalTilt = 35
    const tiltDifference = Math.abs(input.roofTilt - optimalTilt)
    const tiltFactor = Math.max(0.7, 1 - tiltDifference * 0.005)

    // Combined system efficiency
    const systemEfficiency = 0.85 * orientationFactor * tiltFactor * (1 - input.shadingFactor)

    // System sizing
    const systemSize = annualUsage / (input.sunHours * 365 * systemEfficiency) / 1000 // kW

    // Panel calculations
    const panelWattage = 400 // 400W panels
    const panelsNeeded = Math.ceil((systemSize * 1000) / panelWattage)

    // Cost calculations with roof condition factor
    const roofConditionFactors: { [key: string]: number } = {
      excellent: 1.0,
      good: 1.05,
      fair: 1.15,
      poor: 1.3,
    }

    const roofFactor = roofConditionFactors[input.roofCondition.toLowerCase()] || 1.1
    const baseCostPerWatt = 3.5
    const costPerWatt = baseCostPerWatt * roofFactor
    const estimatedCost = systemSize * 1000 * costPerWatt

    // Incentives
    const federalTaxCredit = estimatedCost * 0.3
    const netCost = estimatedCost - federalTaxCredit

    // Monthly production calculation (seasonal variation)
    const monthlyProductionFactors = [0.7, 0.8, 0.9, 1.1, 1.2, 1.3, 1.3, 1.2, 1.1, 0.9, 0.7, 0.6]
    const baseMonthlyProduction = systemSize * input.sunHours * 30 * systemEfficiency
    const monthlyProduction = monthlyProductionFactors.map((factor) => Math.round(baseMonthlyProduction * factor))

    // Annual production and savings
    const annualProduction = monthlyProduction.reduce((sum, month) => sum + month, 0)
    const annualSavings = annualProduction * input.electricityRate

    // Net metering credit (excess production)
    const excessProduction = Math.max(0, annualProduction - annualUsage)
    const netMeteringCredit = excessProduction * input.electricityRate * 0.8 // 80% credit rate

    // Maintenance costs (0.5% of system cost annually)
    const maintenanceCost = estimatedCost * 0.005

    // Net annual savings including maintenance
    const netAnnualSavings = annualSavings + netMeteringCredit - maintenanceCost

    // Payback period
    const paybackPeriod = netCost / netAnnualSavings

    // ROI calculation (25-year system life)
    const totalSavings25Years = netAnnualSavings * 25
    const roiPercentage = ((totalSavings25Years - netCost) / netCost) * 100

    // CO2 reduction (0.92 lbs CO2 per kWh)
    const co2Reduction = annualProduction * 0.92

    const result: AdvancedSolarResult = {
      systemSize: Math.round(systemSize * 100) / 100,
      estimatedCost: Math.round(estimatedCost),
      annualSavings: Math.round(netAnnualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Reduction: Math.round(co2Reduction),
      panelsNeeded,
      monthlyProduction,
      netMeteringCredit: Math.round(netMeteringCredit),
      maintenanceCost: Math.round(maintenanceCost),
      warrantyYears: 25,
      roiPercentage: Math.round(roiPercentage * 10) / 10,
      success: true,
    }

    // Save calculation to database
    try {
      const { error: saveError } = await supabase.from("solar_calculations").insert({
        user_id: user.id,
        calculation_type: "advanced",
        input_data: input,
        result_data: result,
        created_at: new Date().toISOString(),
      })

      if (saveError) {
        console.error("Error saving advanced calculation:", saveError)
      }
    } catch (saveError) {
      console.error("Error saving advanced calculation:", saveError)
    }

    // Track usage
    await trackUsage(user.id, "advanced_calculation")

    return result
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    return {
      systemSize: 0,
      estimatedCost: 0,
      annualSavings: 0,
      paybackPeriod: 0,
      co2Reduction: 0,
      panelsNeeded: 0,
      monthlyProduction: [],
      netMeteringCredit: 0,
      maintenanceCost: 0,
      warrantyYears: 25,
      roiPercentage: 0,
      success: false,
      message: "Calculation failed. Please try again.",
    }
  }
}

export async function saveAdvancedCalculation(userId: string, input: AdvancedSolarInput, result: AdvancedSolarResult) {
  try {
    const supabase = await createClient()

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
    console.error("Save advanced calculation error:", error)
    return { success: false, error: "Failed to save calculation" }
  }
}
