"use server"

import { createClient } from "@/lib/supabase-server"
import { revalidatePath } from "next/cache"

interface AdvancedSolarInput {
  address: string
  monthlyBill: number
  roofArea: number
  roofTilt: number
  roofAzimuth: number
  shadingFactor: number
  electricityRate: number
  userId?: string
  latitude?: number
  longitude?: number
}

interface AdvancedSolarResult {
  success: boolean
  error?: string
  data?: {
    systemSize: number
    panelsNeeded: number
    estimatedCost: number
    annualSavings: number
    paybackPeriod: number
    co2Reduction: number
    monthlyProduction: number[]
    roofAreaUsed: number
    efficiency: number
    netMeteringCredit: number
    maintenanceCost: number
    warrantyYears: number
  }
}

export async function calculateAdvancedSolar(input: AdvancedSolarInput): Promise<AdvancedSolarResult> {
  try {
    const supabase = await createClient()

    // Advanced calculations with real-world factors
    const monthlyUsage = input.monthlyBill / input.electricityRate
    const annualUsage = monthlyUsage * 12

    // Efficiency factors
    const tiltFactor = calculateTiltFactor(input.roofTilt, input.latitude || 40)
    const azimuthFactor = calculateAzimuthFactor(input.roofAzimuth)
    const shadingEfficiency = 1 - input.shadingFactor / 100
    const systemEfficiency = 0.85 // Inverter and system losses

    const totalEfficiency = tiltFactor * azimuthFactor * shadingEfficiency * systemEfficiency

    // System sizing with efficiency factors
    const peakSunHours = 4.5 // Average for US
    const systemSize = annualUsage / (peakSunHours * 365 * totalEfficiency)

    // Panel calculations (400W panels, 20 sq ft each)
    const panelWattage = 0.4
    const panelArea = 20
    const panelsNeeded = Math.ceil(systemSize / panelWattage)
    const roofAreaUsed = panelsNeeded * panelArea

    // Check if system fits on roof
    if (roofAreaUsed > input.roofArea) {
      return {
        success: false,
        error: `System requires ${roofAreaUsed} sq ft but only ${input.roofArea} sq ft available`,
      }
    }

    // Cost calculations with incentives
    const costPerWatt = 3.2 // Current market rate
    const grossCost = systemSize * 1000 * costPerWatt
    const federalTaxCredit = grossCost * 0.3 // 30% federal tax credit
    const estimatedCost = grossCost - federalTaxCredit

    // Monthly production with seasonal variation
    const monthlyProduction = calculateMonthlyProduction(systemSize, totalEfficiency, input.latitude || 40)
    const annualProduction = monthlyProduction.reduce((sum, month) => sum + month, 0)

    // Financial calculations
    const annualSavings = annualProduction * input.electricityRate
    const netMeteringCredit = Math.max(0, (annualProduction - annualUsage) * input.electricityRate * 0.8)
    const totalAnnualBenefit = annualSavings + netMeteringCredit
    const paybackPeriod = estimatedCost / totalAnnualBenefit

    // Environmental impact
    const co2ReductionPerKwh = 0.92 // lbs CO2 per kWh
    const co2Reduction = annualProduction * co2ReductionPerKwh

    // Maintenance and warranty
    const maintenanceCost = systemSize * 15 // $15 per kW annually
    const warrantyYears = 25

    const calculationData = {
      systemSize: Math.round(systemSize * 100) / 100,
      panelsNeeded,
      estimatedCost: Math.round(estimatedCost),
      annualSavings: Math.round(totalAnnualBenefit),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Reduction: Math.round(co2Reduction),
      monthlyProduction: monthlyProduction.map((month) => Math.round(month)),
      roofAreaUsed,
      efficiency: Math.round(totalEfficiency * 100),
      netMeteringCredit: Math.round(netMeteringCredit),
      maintenanceCost: Math.round(maintenanceCost),
      warrantyYears,
    }

    // Save calculation to database
    if (input.userId) {
      const { error: saveError } = await supabase.from("solar_calculations").insert({
        user_id: input.userId,
        calculation_type: "advanced",
        input_data: input,
        result_data: calculationData,
        created_at: new Date().toISOString(),
      })

      if (saveError) {
        console.error("Error saving advanced calculation:", saveError)
      }

      revalidatePath("/dashboard")
    }

    return {
      success: true,
      data: calculationData,
    }
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Advanced calculation failed",
    }
  }
}

function calculateTiltFactor(tilt: number, latitude: number): number {
  const optimalTilt = latitude
  const tiltDifference = Math.abs(tilt - optimalTilt)
  return Math.max(0.7, 1 - tiltDifference * 0.005)
}

function calculateAzimuthFactor(azimuth: number): number {
  // 180 degrees is optimal (south-facing)
  const azimuthDifference = Math.abs(azimuth - 180)
  return Math.max(0.6, 1 - azimuthDifference * 0.002)
}

function calculateMonthlyProduction(systemSize: number, efficiency: number, latitude: number): number[] {
  // Solar irradiance varies by month and latitude
  const baseSolarHours = [3.1, 4.2, 5.4, 6.7, 7.8, 8.2, 8.0, 7.3, 6.1, 4.8, 3.5, 2.9]

  // Adjust for latitude (simplified model)
  const latitudeAdjustment = 1 + (40 - latitude) * 0.01

  return baseSolarHours.map((hours) => {
    const adjustedHours = hours * latitudeAdjustment
    const daysInMonth = 30.44 // Average days per month
    return systemSize * adjustedHours * daysInMonth * efficiency
  })
}

export async function getAdvancedCalculations(userId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("calculation_type", "advanced")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error getting advanced calculations:", error)
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
    console.error("Get advanced calculations error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get calculations",
      data: [],
    }
  }
}
