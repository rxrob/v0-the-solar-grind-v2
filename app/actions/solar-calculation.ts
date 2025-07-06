"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface SolarCalculationInput {
  monthlyBill: number
  roofArea: number
  location: string
  latitude?: number
  longitude?: number
  electricityRate?: number
  systemEfficiency?: number
  panelWattage?: number
}

interface SolarCalculationResult {
  success: boolean
  error?: string
  data?: {
    systemSize: number
    annualProduction: number
    monthlySavings: number
    annualSavings: number
    paybackPeriod: number
    co2Offset: number
    numberOfPanels: number
    roofCoverage: number
    installationCost: number
    twentyYearSavings: number
  }
}

export async function calculateSolarSystem(input: SolarCalculationInput): Promise<SolarCalculationResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("User authentication error:", userError)
    }

    // Default values
    const electricityRate = input.electricityRate || 0.12 // $0.12 per kWh
    const systemEfficiency = input.systemEfficiency || 0.85 // 85% efficiency
    const panelWattage = input.panelWattage || 400 // 400W panels
    const costPerWatt = 3.5 // $3.50 per watt installed
    const sunHoursPerDay = 5.5 // Average sun hours (will be replaced by NREL data)

    // Calculate annual electricity consumption
    const annualConsumption = (input.monthlyBill / electricityRate) * 12 // kWh per year

    // Calculate required system size
    const systemSize = annualConsumption / (sunHoursPerDay * 365 * systemEfficiency) // kW

    // Calculate number of panels needed
    const numberOfPanels = Math.ceil((systemSize * 1000) / panelWattage)

    // Calculate actual system size based on panels
    const actualSystemSize = (numberOfPanels * panelWattage) / 1000 // kW

    // Calculate annual production
    const annualProduction = actualSystemSize * sunHoursPerDay * 365 * systemEfficiency // kWh

    // Calculate savings
    const annualSavings = annualProduction * electricityRate
    const monthlySavings = annualSavings / 12

    // Calculate installation cost
    const installationCost = actualSystemSize * 1000 * costPerWatt

    // Calculate payback period
    const paybackPeriod = installationCost / annualSavings

    // Calculate 20-year savings
    const twentyYearSavings = annualSavings * 20 - installationCost

    // Calculate CO2 offset (pounds per year)
    const co2Offset = annualProduction * 0.92 // 0.92 lbs CO2 per kWh

    // Calculate roof coverage
    const panelArea = numberOfPanels * 21.5 // 21.5 sq ft per panel
    const roofCoverage = (panelArea / input.roofArea) * 100

    const result = {
      systemSize: Math.round(actualSystemSize * 100) / 100,
      annualProduction: Math.round(annualProduction),
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      annualSavings: Math.round(annualSavings * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Offset: Math.round(co2Offset),
      numberOfPanels,
      roofCoverage: Math.round(roofCoverage * 10) / 10,
      installationCost: Math.round(installationCost),
      twentyYearSavings: Math.round(twentyYearSavings),
    }

    // Save calculation to database if user is authenticated
    if (user) {
      try {
        await supabase.from("solar_calculations").insert({
          user_id: user.id,
          monthly_bill: input.monthlyBill,
          roof_area: input.roofArea,
          location: input.location,
          latitude: input.latitude,
          longitude: input.longitude,
          system_size: result.systemSize,
          annual_production: result.annualProduction,
          annual_savings: result.annualSavings,
          installation_cost: result.installationCost,
          payback_period: result.paybackPeriod,
          created_at: new Date().toISOString(),
        })
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
      error: "An error occurred during calculation",
    }
  }
}

export async function getSolarCalculationHistory() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: cookieStore })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching calculation history:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("Error fetching calculation history:", error)
    return {
      success: false,
      error: "An error occurred while fetching calculation history",
    }
  }
}

export async function deleteSolarCalculation(calculationId: string) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: cookieStore })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    const { error } = await supabase.from("solar_calculations").delete().eq("id", calculationId).eq("user_id", user.id) // Ensure user can only delete their own calculations

    if (error) {
      console.error("Error deleting calculation:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: "Calculation deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting calculation:", error)
    return {
      success: false,
      error: "An error occurred while deleting the calculation",
    }
  }
}
