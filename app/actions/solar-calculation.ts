"use server"

import { createClient } from "@/lib/supabase-server"

interface AdvancedSolarInput {
  address: string
  monthlyBill: number
  roofArea: number
  roofType: string
  roofAge: number
  shadingFactor: number
  panelType: string
  inverterType: string
  batteryStorage: boolean
  batteryCapacity?: number
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
    annualProduction: number
    monthlyProduction: number[]
    annualSavings: number
    paybackPeriod: number
    co2Reduction: number
    installationCost: number
    roofCoverage: number
    efficiencyFactors: {
      roofType: number
      roofAge: number
      shading: number
      panelType: number
      inverter: number
    }
    batteryInfo?: {
      capacity: number
      cost: number
      backupHours: number
    }
  }
}

export async function calculateAdvancedSolar(input: AdvancedSolarInput): Promise<AdvancedSolarResult> {
  try {
    const {
      address,
      monthlyBill,
      roofArea,
      roofType,
      roofAge,
      shadingFactor,
      panelType,
      inverterType,
      batteryStorage,
      batteryCapacity = 0,
      userId,
      latitude,
      longitude,
    } = input

    // Validate inputs
    if (monthlyBill <= 0 || roofArea <= 0) {
      return {
        success: false,
        error: "Monthly bill and roof area must be greater than zero",
      }
    }

    // Get solar irradiance data (mock for now, would use NREL API in production)
    const avgSunHours = latitude ? calculateSunHours(latitude) : 5.5
    const monthlyIrradiance = generateMonthlyIrradiance(latitude || 40)

    // Calculate efficiency factors
    const efficiencyFactors = {
      roofType: getRoofTypeEfficiency(roofType),
      roofAge: getRoofAgeEfficiency(roofAge),
      shading: shadingFactor / 100,
      panelType: getPanelTypeEfficiency(panelType),
      inverter: getInverterEfficiency(inverterType),
    }

    // Calculate overall system efficiency
    const systemEfficiency = Object.values(efficiencyFactors).reduce((acc, factor) => acc * factor, 1)

    // Estimate electricity rate (would get from utility API in production)
    const electricityRate = 0.12 // $0.12 per kWh average

    // Calculate annual energy consumption
    const annualConsumption = (monthlyBill / electricityRate) * 12

    // Calculate required system size
    const systemSize = annualConsumption / (avgSunHours * 365 * systemEfficiency)

    // Calculate number of panels needed
    const panelWattage = getPanelWattage(panelType)
    const panelsNeeded = Math.ceil((systemSize * 1000) / panelWattage)

    // Calculate actual system size based on panels
    const actualSystemSize = (panelsNeeded * panelWattage) / 1000

    // Calculate monthly production based on irradiance
    const monthlyProduction = monthlyIrradiance.map(
      (irradiance) => actualSystemSize * irradiance * 30 * systemEfficiency,
    )

    // Calculate annual production
    const annualProduction = monthlyProduction.reduce((sum, month) => sum + month, 0)

    // Calculate installation cost
    const baseCostPerWatt = getPanelCost(panelType)
    const inverterCost = getInverterCost(inverterType, actualSystemSize)
    const installationCost = actualSystemSize * 1000 * baseCostPerWatt + inverterCost

    // Calculate battery costs if applicable
    let batteryInfo
    if (batteryStorage && batteryCapacity > 0) {
      const batteryCost = batteryCapacity * 800 // $800 per kWh
      const backupHours = (batteryCapacity * 1000) / ((monthlyBill / electricityRate / 30 / 24) * 1000)

      batteryInfo = {
        capacity: batteryCapacity,
        cost: batteryCost,
        backupHours: Math.round(backupHours * 10) / 10,
      }
    }

    // Calculate annual savings
    const annualSavings = Math.min(annualProduction * electricityRate, monthlyBill * 12)

    // Calculate payback period
    const totalCost = installationCost + (batteryInfo?.cost || 0)
    const paybackPeriod = totalCost / annualSavings

    // Calculate CO2 reduction
    const co2Reduction = annualProduction * 0.92 // lbs CO2 per kWh

    // Calculate roof coverage
    const panelArea = panelsNeeded * 20 // 20 sq ft per panel
    const roofCoverage = (panelArea / roofArea) * 100

    const result = {
      systemSize: Math.round(actualSystemSize * 100) / 100,
      panelsNeeded,
      annualProduction: Math.round(annualProduction),
      monthlyProduction: monthlyProduction.map((p) => Math.round(p)),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Reduction: Math.round(co2Reduction),
      installationCost: Math.round(totalCost),
      roofCoverage: Math.round(roofCoverage * 10) / 10,
      efficiencyFactors,
      batteryInfo,
    }

    // Save calculation to database if user is provided
    if (userId) {
      try {
        const supabase = await createClient()
        await supabase.from("solar_calculations").insert({
          user_id: userId,
          calculation_type: "advanced",
          input_data: input,
          result_data: result,
          created_at: new Date().toISOString(),
        })

        // Update user's calculation count
        await supabase.rpc("increment_user_calculations", { user_id: userId })
      } catch (dbError) {
        console.error("Error saving calculation:", dbError)
      }
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Calculation failed",
    }
  }
}

// Helper functions
function calculateSunHours(latitude: number): number {
  // Simplified calculation based on latitude
  const baseSunHours = 5.5
  const latitudeAdjustment = (40 - Math.abs(latitude)) * 0.02
  return Math.max(3, Math.min(8, baseSunHours + latitudeAdjustment))
}

function generateMonthlyIrradiance(latitude: number): number[] {
  // Generate monthly solar irradiance values (kWh/m²/day)
  const baseIrradiance = [3.2, 4.1, 5.3, 6.2, 6.8, 7.1, 6.9, 6.3, 5.4, 4.2, 3.4, 2.9]
  const latitudeMultiplier = 1 + (40 - Math.abs(latitude)) * 0.01

  return baseIrradiance.map((irr) => Math.max(2, irr * latitudeMultiplier))
}

function getRoofTypeEfficiency(roofType: string): number {
  const efficiencies: { [key: string]: number } = {
    asphalt: 0.95,
    metal: 0.98,
    tile: 0.92,
    slate: 0.9,
    flat: 0.85,
  }
  return efficiencies[roofType] || 0.95
}

function getRoofAgeEfficiency(roofAge: number): number {
  if (roofAge < 5) return 1.0
  if (roofAge < 10) return 0.98
  if (roofAge < 20) return 0.95
  return 0.9
}

function getPanelTypeEfficiency(panelType: string): number {
  const efficiencies: { [key: string]: number } = {
    monocrystalline: 0.22,
    polycrystalline: 0.18,
    "thin-film": 0.12,
  }
  return efficiencies[panelType] || 0.2
}

function getInverterEfficiency(inverterType: string): number {
  const efficiencies: { [key: string]: number } = {
    string: 0.95,
    "power-optimizer": 0.97,
    microinverter: 0.96,
  }
  return efficiencies[inverterType] || 0.95
}

function getPanelWattage(panelType: string): number {
  const wattages: { [key: string]: number } = {
    monocrystalline: 400,
    polycrystalline: 350,
    "thin-film": 300,
  }
  return wattages[panelType] || 400
}

function getPanelCost(panelType: string): number {
  const costs: { [key: string]: number } = {
    monocrystalline: 3.2,
    polycrystalline: 2.8,
    "thin-film": 2.5,
  }
  return costs[panelType] || 3.0
}

function getInverterCost(inverterType: string, systemSize: number): number {
  const costsPerKW: { [key: string]: number } = {
    string: 200,
    "power-optimizer": 300,
    microinverter: 400,
  }
  const costPerKW = costsPerKW[inverterType] || 250
  return systemSize * costPerKW
}
