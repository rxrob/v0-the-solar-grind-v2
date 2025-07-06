"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import type { SolarResults } from "@/types"

interface AdvancedSolarParams {
  address: string
  latitude: number
  longitude: number
  monthlyBill: number
  roofArea: number
  panelEfficiency: number
  tiltAngle: number
  azimuthAngle: number
  shadingFactor: number
  electricityRate: number
  netMetering: boolean
  annualUsage: number
}

export async function calculateAdvancedSolar(params: AdvancedSolarParams): Promise<SolarResults> {
  try {
    // Get current user
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // NREL PVWatts API call
    const nrelResponse = await fetch(
      `https://developer.nrel.gov/api/pvwatts/v6.json?api_key=${process.env.NREL_API_KEY}&lat=${params.latitude}&lon=${params.longitude}&system_capacity=4&azimuth=${params.azimuthAngle}&tilt=${params.tiltAngle}&array_type=1&module_type=1&losses=14`,
    )

    if (!nrelResponse.ok) {
      throw new Error("Failed to fetch NREL data")
    }

    const nrelData = await nrelResponse.json()
    const nrelAnnualProduction = nrelData.outputs?.ac_annual || 0

    // Enhanced calculations
    const systemSize = params.annualUsage / (nrelAnnualProduction / 4) // Assuming 4kW reference system
    const adjustedSystemSize = Math.max(systemSize, 2) // Minimum 2kW system

    // Panel calculations
    const panelWattage = 400 // Standard panel wattage
    const panelCount = Math.ceil((adjustedSystemSize * 1000) / panelWattage)
    const actualSystemSize = (panelCount * panelWattage) / 1000

    // Production calculations with shading and efficiency factors
    const baseAnnualProduction = (nrelAnnualProduction / 4) * actualSystemSize
    const shadingAdjustment = 1 - params.shadingFactor / 100
    const efficiencyAdjustment = params.panelEfficiency / 20 // Normalize to 20% baseline
    const annualProduction = baseAnnualProduction * shadingAdjustment * efficiencyAdjustment

    // Monthly production distribution
    const monthlyFactors = [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]
    const monthlyProduction: number[] = []
    const avgMonthlyProduction = annualProduction / 12

    for (let i = 0; i < 12; i++) {
      monthlyProduction.push(avgMonthlyProduction * monthlyFactors[i])
    }

    // Calculate monthly consumption (distribute annual usage)
    const monthlyConsumption: number[] = []
    const seasonalFactors = [1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 1.2, 1.3, 1.1, 0.9, 1.0, 1.1]
    const avgMonthlyUsage = params.annualUsage / 12

    for (let i = 0; i < 12; i++) {
      monthlyConsumption.push(avgMonthlyUsage * seasonalFactors[i])
    }

    // Financial calculations
    const costPerWatt = 3.2
    const totalSystemCost = actualSystemSize * 1000 * costPerWatt
    const federalTaxCredit = totalSystemCost * 0.3
    const netSystemCost = totalSystemCost - federalTaxCredit

    // Monthly savings calculation
    const monthlySavings: number[] = []
    let totalAnnualSavings = 0

    for (let i = 0; i < 12; i++) {
      const monthlyOffset = Math.min(monthlyProduction[i], monthlyConsumption[i])
      const excessProduction = Math.max(0, monthlyProduction[i] - monthlyConsumption[i])
      const netMeteringCredit = params.netMetering ? excessProduction * params.electricityRate * 0.8 : 0
      const monthlySaving = monthlyOffset * params.electricityRate + netMeteringCredit
      monthlySavings.push(monthlySaving)
      totalAnnualSavings += monthlySaving
    }

    // Payback and ROI calculations
    const simplePayback = netSystemCost / totalAnnualSavings
    const discountRate = 0.06
    let npv = -netSystemCost
    let cumulativeSavings = 0

    for (let year = 1; year <= 25; year++) {
      const yearlyDegradation = Math.pow(0.995, year - 1) // 0.5% annual degradation
      const adjustedAnnualSavings = totalAnnualSavings * yearlyDegradation
      const discountedSavings = adjustedAnnualSavings / Math.pow(1 + discountRate, year)
      npv += discountedSavings
      cumulativeSavings += adjustedAnnualSavings
    }

    const irr = calculateIRR(netSystemCost, totalAnnualSavings, 25)
    const co2Offset = annualProduction * 0.0007 // tons CO2 per kWh
    const equivalentTrees = co2Offset * 16 // trees planted equivalent

    const results: SolarResults = {
      annual_production: Math.round(annualProduction),
      annual_savings: Math.round(totalAnnualSavings),
      system_cost: Math.round(totalSystemCost),
      payback_period: Math.round(simplePayback * 10) / 10,
      roi_25_years: Math.round(((cumulativeSavings - netSystemCost) / netSystemCost) * 100),
      co2_offset: Math.round(co2Offset * 100) / 100,
      equivalent_trees: Math.round(equivalentTrees),
      monthly_production: monthlyProduction.map((p: number) => Math.round(p)),
      monthly_savings: monthlySavings.map((s: number) => Math.round(s * 100) / 100),
      system_specifications: {
        recommended_size: Math.round(actualSystemSize * 100) / 100,
        number_of_panels: panelCount,
        panel_wattage: panelWattage,
        inverter_size: Math.round(actualSystemSize * 1.2 * 100) / 100,
        roof_area_needed: Math.round(panelCount * 20), // sq ft per panel
      },
      financial_analysis: {
        total_cost: Math.round(totalSystemCost),
        federal_tax_credit: Math.round(federalTaxCredit),
        state_incentives: 0,
        net_cost: Math.round(netSystemCost),
        monthly_payment: Math.round((netSystemCost / 240) * 100) / 100, // 20-year loan
        break_even_year: Math.ceil(simplePayback),
        lifetime_savings: Math.round(cumulativeSavings - netSystemCost),
        npv: Math.round(npv),
        irr: Math.round(irr * 100) / 100,
      },
    }

    // Save calculation to database if user is authenticated
    if (user?.email) {
      await saveAdvancedCalculation(user.email, params, results)
    }

    return results
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    throw new Error("Failed to calculate advanced solar metrics")
  }
}

function calculateIRR(initialInvestment: number, annualCashFlow: number, years: number): number {
  // Simple IRR approximation
  let rate = 0.1
  const tolerance = 0.0001
  let iteration = 0
  const maxIterations = 100

  while (iteration < maxIterations) {
    let npv = -initialInvestment
    let derivative = 0

    for (let year = 1; year <= years; year++) {
      const discountFactor = Math.pow(1 + rate, year)
      npv += annualCashFlow / discountFactor
      derivative -= (year * annualCashFlow) / Math.pow(1 + rate, year + 1)
    }

    if (Math.abs(npv) < tolerance) break

    const newRate = rate - npv / derivative
    if (Math.abs(newRate - rate) < tolerance) break

    rate = newRate
    iteration++
  }

  return rate
}

async function saveAdvancedCalculation(
  userEmail: string,
  params: AdvancedSolarParams,
  results: SolarResults,
): Promise<void> {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("solar_calculations").insert({
      user_email: userEmail,
      address: params.address,
      latitude: params.latitude,
      longitude: params.longitude,
      monthly_bill: params.monthlyBill,
      roof_area: params.roofArea,
      system_size: results.system_specifications.recommended_size,
      annual_production: results.annual_production,
      annual_savings: results.annual_savings,
      payback_period: results.payback_period,
      total_cost: results.system_cost,
      calculation_type: "advanced",
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving calculation:", error)
    }
  } catch (error) {
    console.error("Database save error:", error)
  }
}
