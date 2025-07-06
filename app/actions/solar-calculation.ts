"use server"

import { createClient } from "@/lib/supabase-server"
import { trackUsage, checkUsageLimit } from "./usage-tracking"

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
  sunHours: number
  location: string
  utilityCompany: string
  netMeteringRate: number
  systemType: "grid-tied" | "hybrid" | "off-grid"
  batteryStorage?: number
  panelType: "monocrystalline" | "polycrystalline" | "thin-film"
  inverterType: "string" | "power-optimizer" | "microinverter"
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
    roi25Year: number
    netPresentValue: number
    levelizedCostOfEnergy: number
    batteryBackupHours?: number
  }
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
      return { success: false, error: "Authentication required" }
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(user.id)
    if (!usageCheck.success) {
      return { success: false, error: usageCheck.error }
    }

    // Advanced calculations with efficiency factors
    const panelEfficiencies = {
      monocrystalline: 0.22,
      polycrystalline: 0.18,
      "thin-film": 0.12,
    }

    const inverterEfficiencies = {
      string: 0.96,
      "power-optimizer": 0.98,
      microinverter: 0.95,
    }

    const panelEfficiency = panelEfficiencies[input.panelType]
    const inverterEfficiency = inverterEfficiencies[input.inverterType]

    // System efficiency calculation
    const systemEfficiency = panelEfficiency * inverterEfficiency * (1 - input.shadingFactor / 100) * 0.85

    // Annual consumption
    const annualConsumption = (input.monthlyBill / input.electricityRate) * 12

    // System sizing with tilt and azimuth factors
    const tiltFactor = Math.cos((Math.abs(input.roofTilt - 35) * Math.PI) / 180) * 0.1 + 0.9
    const azimuthFactor = Math.cos((Math.abs(input.roofAzimuth - 180) * Math.PI) / 180) * 0.1 + 0.9

    const adjustedSunHours = input.sunHours * tiltFactor * azimuthFactor
    const systemSize = annualConsumption / 365 / (adjustedSunHours * systemEfficiency)

    // Panel calculations
    const panelWattage = 0.4 // 400W panels
    const panelsNeeded = Math.ceil(systemSize / panelWattage)

    // Cost estimation with system type multipliers
    const baseCostPerWatt = 3.0
    const systemMultipliers = {
      "grid-tied": 1.0,
      hybrid: 1.4,
      "off-grid": 1.8,
    }

    const costPerWatt = baseCostPerWatt * systemMultipliers[input.systemType]
    let estimatedCost = systemSize * 1000 * costPerWatt

    // Add battery cost if specified
    if (input.batteryStorage) {
      estimatedCost += input.batteryStorage * 800 // $800 per kWh of battery
    }

    // Monthly production calculation
    const monthlyMultipliers = [0.7, 0.8, 1.0, 1.1, 1.2, 1.3, 1.3, 1.2, 1.1, 0.9, 0.7, 0.6]
    const baseMonthlyProduction = systemSize * adjustedSunHours * 30.44 * systemEfficiency
    const monthlyProduction = monthlyMultipliers.map((mult) => Math.round(baseMonthlyProduction * mult))

    // Annual production and savings
    const annualProduction = monthlyProduction.reduce((sum, month) => sum + month, 0)
    const annualSavings = annualProduction * input.netMeteringRate

    // Financial calculations
    const paybackPeriod = estimatedCost / annualSavings
    const roi25Year = ((annualSavings * 25 - estimatedCost) / estimatedCost) * 100

    // Net Present Value (7% discount rate)
    const discountRate = 0.07
    let npv = -estimatedCost
    for (let year = 1; year <= 25; year++) {
      npv += annualSavings / Math.pow(1 + discountRate, year)
    }

    // Levelized Cost of Energy
    const lcoe = estimatedCost / (annualProduction * 25)

    // Environmental impact
    const co2Reduction = annualProduction * 0.92 // lbs CO2 per year

    // Roof utilization
    const panelArea = panelsNeeded * 20 // 20 sq ft per panel
    const roofUtilization = (panelArea / input.roofArea) * 100

    // Battery backup calculation
    let batteryBackupHours: number | undefined
    if (input.batteryStorage) {
      const dailyConsumption = annualConsumption / 365
      batteryBackupHours = (input.batteryStorage / dailyConsumption) * 24
    }

    const calculationData = {
      systemSize: Math.round(systemSize * 100) / 100,
      panelsNeeded,
      estimatedCost: Math.round(estimatedCost),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Reduction: Math.round(co2Reduction),
      monthlyProduction: monthlyProduction.map((month) => Math.round(month)),
      roofAreaUsed: panelArea,
      efficiency: Math.round(systemEfficiency * 1000) / 10, // as percentage
      netMeteringCredit: Math.round(annualSavings * 0.8),
      maintenanceCost: Math.round(systemSize * 15), // $15 per kW annually
      warrantyYears: 25,
      roi25Year: Math.round(roi25Year * 10) / 10,
      netPresentValue: Math.round(npv),
      levelizedCostOfEnergy: Math.round(lcoe * 1000) / 1000,
      batteryBackupHours: batteryBackupHours ? Math.round(batteryBackupHours * 10) / 10 : undefined,
    }

    // Save calculation to database
    const { error: saveError } = await supabase.from("solar_calculations").insert({
      user_id: user.id,
      calculation_type: "advanced",
      input_data: input,
      result_data: calculationData,
      created_at: new Date().toISOString(),
    })

    if (saveError) {
      console.error("Error saving advanced calculation:", saveError)
    }

    // Track usage
    await trackUsage(user.id, "advanced_calculation")

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
