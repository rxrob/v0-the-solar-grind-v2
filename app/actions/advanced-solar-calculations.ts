"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

interface AdvancedSolarInput {
  address: string
  monthlyBill: number
  roofArea: number
  roofTilt?: number
  roofAzimuth?: number
  shadingFactor?: number
  systemType?: "grid-tied" | "off-grid" | "hybrid"
  panelType?: "monocrystalline" | "polycrystalline" | "thin-film"
  inverterType?: "string" | "power-optimizer" | "microinverter"
  batteryStorage?: boolean
  batteryCapacity?: number
  electricityRate?: number
  netMeteringRate?: number
  federalTaxCredit?: number
  stateTaxCredit?: number
  localIncentives?: number
}

interface AdvancedSolarResult {
  success: boolean
  error?: string
  data?: {
    systemSize: number
    annualProduction: number
    monthlyProduction: number[]
    monthlySavings: number
    annualSavings: number
    paybackPeriod: number
    roi: number
    co2Offset: number
    numberOfPanels: number
    roofCoverage: number
    installationCost: number
    netInstallationCost: number
    twentyYearSavings: number
    batteryBackupHours?: number
    peakSunHours: number
    systemEfficiency: number
    degradationRate: number
    warrantyYears: number
    maintenanceCost: number
    insuranceCost: number
    totalLifetimeSavings: number
  }
}

export async function calculateAdvancedSolarSystem(input: AdvancedSolarInput): Promise<AdvancedSolarResult> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: cookieStore })

    // Get current user and check subscription
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: "User authentication required for advanced calculations",
      }
    }

    // Check user subscription status
    const { data: userData, error: subscriptionError } = await supabase
      .from("users")
      .select("subscription_type, subscription_status")
      .eq("id", user.id)
      .single()

    if (subscriptionError || userData?.subscription_type !== "pro" || userData?.subscription_status !== "active") {
      return {
        success: false,
        error: "Pro subscription required for advanced solar calculations",
      }
    }

    // Advanced calculation parameters
    const panelEfficiency = getPanelEfficiency(input.panelType || "monocrystalline")
    const inverterEfficiency = getInverterEfficiency(input.inverterType || "string")
    const systemEfficiency = panelEfficiency * inverterEfficiency * (input.shadingFactor || 0.95)
    const degradationRate = 0.005 // 0.5% per year
    const warrantyYears = 25
    const maintenanceCostPerYear = 150
    const insuranceCostPerYear = 200

    // Default values
    const electricityRate = input.electricityRate || 0.12
    const netMeteringRate = input.netMeteringRate || electricityRate * 0.9
    const federalTaxCredit = input.federalTaxCredit || 0.3 // 30%
    const stateTaxCredit = input.stateTaxCredit || 0.0
    const localIncentives = input.localIncentives || 0
    const costPerWatt = getSystemCostPerWatt(input.systemType || "grid-tied", input.batteryStorage || false)

    // Get solar irradiance data (mock for now - would use NREL API)
    const peakSunHours = await getPeakSunHours(input.address)
    const monthlyIrradiance = await getMonthlyIrradiance(input.address)

    // Calculate annual electricity consumption
    const annualConsumption = (input.monthlyBill / electricityRate) * 12

    // Calculate required system size
    const systemSize = annualConsumption / (peakSunHours * 365 * systemEfficiency)

    // Calculate number of panels
    const panelWattage = getPanelWattage(input.panelType || "monocrystalline")
    const numberOfPanels = Math.ceil((systemSize * 1000) / panelWattage)
    const actualSystemSize = (numberOfPanels * panelWattage) / 1000

    // Calculate monthly production
    const monthlyProduction = monthlyIrradiance.map((irradiance: number) => {
      const daysInMonth = 30.44 // Average days per month
      return actualSystemSize * irradiance * daysInMonth * systemEfficiency
    })

    // Calculate annual production
    const annualProduction = monthlyProduction.reduce((sum, monthly) => sum + monthly, 0)

    // Calculate savings
    const annualSavings = annualProduction * netMeteringRate
    const monthlySavings = annualSavings / 12

    // Calculate installation costs
    const baseInstallationCost = actualSystemSize * 1000 * costPerWatt
    const batteryStorageCost = input.batteryStorage ? (input.batteryCapacity || 10) * 1000 : 0
    const installationCost = baseInstallationCost + batteryStorageCost

    // Calculate net installation cost after incentives
    const federalCredit = installationCost * federalTaxCredit
    const stateCredit = installationCost * stateTaxCredit
    const netInstallationCost = installationCost - federalCredit - stateCredit - localIncentives

    // Calculate payback period and ROI
    const paybackPeriod = netInstallationCost / annualSavings
    const roi = (annualSavings / netInstallationCost) * 100

    // Calculate 20-year and lifetime savings
    const twentyYearSavings = calculateLifetimeSavings(annualSavings, 20, degradationRate) - netInstallationCost
    const totalLifetimeSavings =
      calculateLifetimeSavings(annualSavings, warrantyYears, degradationRate) -
      netInstallationCost -
      maintenanceCostPerYear * warrantyYears -
      insuranceCostPerYear * warrantyYears

    // Calculate CO2 offset
    const co2Offset = annualProduction * 0.92 // 0.92 lbs CO2 per kWh

    // Calculate roof coverage
    const panelArea = numberOfPanels * 21.5 // 21.5 sq ft per panel
    const roofCoverage = (panelArea / input.roofArea) * 100

    // Calculate battery backup hours if applicable
    let batteryBackupHours: number | undefined
    if (input.batteryStorage && input.batteryCapacity) {
      const dailyConsumption = annualConsumption / 365
      batteryBackupHours = (input.batteryCapacity * 0.8) / (dailyConsumption / 24) // 80% usable capacity
    }

    const result = {
      systemSize: Math.round(actualSystemSize * 100) / 100,
      annualProduction: Math.round(annualProduction),
      monthlyProduction: monthlyProduction.map((p: number) => Math.round(p)),
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      annualSavings: Math.round(annualSavings * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      roi: Math.round(roi * 10) / 10,
      co2Offset: Math.round(co2Offset),
      numberOfPanels,
      roofCoverage: Math.round(roofCoverage * 10) / 10,
      installationCost: Math.round(installationCost),
      netInstallationCost: Math.round(netInstallationCost),
      twentyYearSavings: Math.round(twentyYearSavings),
      batteryBackupHours: batteryBackupHours ? Math.round(batteryBackupHours * 10) / 10 : undefined,
      peakSunHours: Math.round(peakSunHours * 10) / 10,
      systemEfficiency: Math.round(systemEfficiency * 1000) / 10, // Convert to percentage
      degradationRate: degradationRate * 100, // Convert to percentage
      warrantyYears,
      maintenanceCost: maintenanceCostPerYear,
      insuranceCost: insuranceCostPerYear,
      totalLifetimeSavings: Math.round(totalLifetimeSavings),
    }

    // Save advanced calculation to database
    try {
      await supabase.from("solar_calculations").insert({
        user_id: user.id,
        calculation_type: "advanced",
        address: input.address,
        monthly_bill: input.monthlyBill,
        roof_area: input.roofArea,
        roof_tilt: input.roofTilt,
        roof_azimuth: input.roofAzimuth,
        shading_factor: input.shadingFactor,
        system_type: input.systemType,
        panel_type: input.panelType,
        inverter_type: input.inverterType,
        battery_storage: input.batteryStorage,
        battery_capacity: input.batteryCapacity,
        system_size: result.systemSize,
        annual_production: result.annualProduction,
        annual_savings: result.annualSavings,
        installation_cost: result.installationCost,
        net_installation_cost: result.netInstallationCost,
        payback_period: result.paybackPeriod,
        roi: result.roi,
        created_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error("Error saving advanced calculation:", dbError)
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    return {
      success: false,
      error: "An error occurred during advanced calculation",
    }
  }
}

// Helper functions
function getPanelEfficiency(panelType: string): number {
  switch (panelType) {
    case "monocrystalline":
      return 0.22 // 22%
    case "polycrystalline":
      return 0.18 // 18%
    case "thin-film":
      return 0.12 // 12%
    default:
      return 0.2 // 20%
  }
}

function getInverterEfficiency(inverterType: string): number {
  switch (inverterType) {
    case "string":
      return 0.96 // 96%
    case "power-optimizer":
      return 0.98 // 98%
    case "microinverter":
      return 0.97 // 97%
    default:
      return 0.96 // 96%
  }
}

function getPanelWattage(panelType: string): number {
  switch (panelType) {
    case "monocrystalline":
      return 400 // 400W
    case "polycrystalline":
      return 350 // 350W
    case "thin-film":
      return 200 // 200W
    default:
      return 400 // 400W
  }
}

function getSystemCostPerWatt(systemType: string, batteryStorage: boolean): number {
  let baseCost = 3.5 // $3.50 per watt

  switch (systemType) {
    case "off-grid":
      baseCost = 5.0
      break
    case "hybrid":
      baseCost = 4.5
      break
    default:
      baseCost = 3.5
  }

  if (batteryStorage) {
    baseCost += 1.0 // Additional $1 per watt for battery systems
  }

  return baseCost
}

async function getPeakSunHours(address: string): Promise<number> {
  // Mock implementation - would use NREL API
  // For now, return average US value
  return 5.5
}

async function getMonthlyIrradiance(address: string): Promise<number[]> {
  // Mock implementation - would use NREL API
  // Return typical monthly irradiance values (kWh/m²/day)
  return [3.2, 4.1, 5.3, 6.2, 6.8, 7.1, 6.9, 6.3, 5.4, 4.2, 3.4, 2.9]
}

function calculateLifetimeSavings(annualSavings: number, years: number, degradationRate: number): number {
  let totalSavings = 0
  for (let year = 1; year <= years; year++) {
    const yearlyProduction = 1 - degradationRate * (year - 1)
    totalSavings += annualSavings * yearlyProduction
  }
  return totalSavings
}

export async function getAdvancedCalculationHistory() {
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
      .eq("calculation_type", "advanced")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching advanced calculation history:", error)
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
    console.error("Error fetching advanced calculation history:", error)
    return {
      success: false,
      error: "An error occurred while fetching calculation history",
    }
  }
}
