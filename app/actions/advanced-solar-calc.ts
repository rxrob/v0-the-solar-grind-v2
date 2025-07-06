"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface ProCalculatorInput {
  // Customer Information
  customerName: string
  customerEmail: string
  customerPhone?: string
  projectName: string
  customerType: "residential" | "commercial" | "industrial"

  // Property Analysis
  address: string
  coordinates?: { lat: number; lng: number }
  roofType: string
  roofArea: number
  roofOrientation: string
  roofTilt: number
  shading: string
  roofCondition: string

  // Energy Profile
  monthlyBill: number
  electricityRate: number
  monthlyUsage?: number
  utilityCompany: string
  peakUsageHours?: string
  hasTimeOfUse?: boolean
  peakRate?: number
  offPeakRate?: number

  // System Preferences
  systemGoal: string
  panelPreference: string
  inverterType?: string
  batteryBackup?: boolean
  batteryCapacity?: number
  hasEV?: boolean
  hasPool?: boolean
  futureExpansion?: boolean

  // Financial Preferences
  purchaseMethod: string
  downPayment?: number
  financingTerm?: number
  interestRate?: number
  includeIncentives?: boolean
}

interface ProCalculatorResult {
  success: boolean
  error?: string
  data?: {
    // System Specifications
    systemSize: number
    panelCount: number
    panelWattage: number
    inverterCount: number
    annualProduction: number
    monthlyProduction: number[]

    // Performance Metrics
    peakSunHours: number
    systemEfficiency: number
    capacityFactor: number
    performanceRatio: number

    // Financial Analysis
    systemCost: number
    costPerWatt: number
    federalTaxCredit: number
    stateIncentives: number
    netCost: number
    currentMonthlyBill: number
    monthlyBillWithSolar: number
    monthlySavings: number
    annualSavings: number
    paybackPeriod: number

    // Environmental Impact
    co2OffsetTons: number
    treesEquivalent: number

    // 15-year projections
    yearlyProjections: Array<{
      year: number
      annualSavings: number
      cumulativeSavings: number
      billWithoutSolar: number
      billWithSolar: number
      systemValue: number
    }>

    // Equipment Recommendations
    recommendations: {
      panelBrand: string
      panelModel: string
      inverterBrand: string
      inverterModel: string
      rackingSystem: string
      monitoringSystem: string
      warranty: {
        panels: string
        inverters: string
        workmanship: string
      }
    }

    // Site Analysis
    siteAnalysis: {
      roofSuitability: string
      shadingAssessment: string
      structuralRequirements: string
      electricalUpgrades: string
      permittingComplexity: string
    }

    // Warnings and Recommendations
    warnings?: string[]
    recommendations_text?: string[]
  }
}

export async function calculateProSolarSystem(input: ProCalculatorInput): Promise<ProCalculatorResult> {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    // Get current user and verify Pro access
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        error: "User authentication required for Pro calculations",
      }
    }

    // Check user subscription status
    const { data: userData, error: subscriptionError } = await supabase
      .from("users")
      .select("subscription_type, subscription_status, pro_trial_used")
      .eq("id", user.id)
      .single()

    const isProUser = userData?.subscription_type === "pro" && userData?.subscription_status === "active"
    const canUseTrial = !userData?.pro_trial_used

    if (!isProUser && !canUseTrial) {
      return {
        success: false,
        error: "Pro subscription or trial required for advanced calculations",
      }
    }

    // Mark trial as used if this is a trial user
    if (!isProUser && canUseTrial) {
      await supabase
        .from("users")
        .update({ pro_trial_used: true, updated_at: new Date().toISOString() })
        .eq("id", user.id)
    }

    // Advanced calculation logic
    const result = await performAdvancedCalculation(input)

    // Save calculation to database
    try {
      await supabase.from("solar_calculations").insert({
        user_id: user.id,
        calculation_type: "pro",
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        project_name: input.projectName,
        address: input.address,
        monthly_bill: input.monthlyBill,
        roof_area: input.roofArea,
        roof_type: input.roofType,
        roof_orientation: input.roofOrientation,
        roof_tilt: input.roofTilt,
        shading_level: input.shading,
        roof_condition: input.roofCondition,
        electricity_rate: input.electricityRate,
        utility_company: input.utilityCompany,
        system_goal: input.systemGoal,
        panel_preference: input.panelPreference,
        inverter_type: input.inverterType,
        battery_backup: input.batteryBackup,
        battery_capacity: input.batteryCapacity,
        has_ev: input.hasEV,
        has_pool: input.hasPool,
        purchase_method: input.purchaseMethod,
        system_size: result.systemSize,
        annual_production: result.annualProduction,
        annual_savings: result.annualSavings,
        installation_cost: result.systemCost,
        net_cost: result.netCost,
        payback_period: result.paybackPeriod,
        created_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error("Error saving Pro calculation:", dbError)
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Pro solar calculation error:", error)
    return {
      success: false,
      error: "An error occurred during Pro calculation",
    }
  }
}

async function performAdvancedCalculation(input: ProCalculatorInput) {
  // Advanced calculation parameters
  const panelWattage = getPanelWattage(input.panelPreference)
  const systemEfficiency = getSystemEfficiency(input.panelPreference, input.inverterType)
  const peakSunHours = 5.5 // Would use NREL API for actual location
  const degradationRate = 0.5 // 0.5% per year

  // Calculate system size based on goal
  let targetSystemSize = 0
  const monthlyUsage = input.monthlyUsage || input.monthlyBill / input.electricityRate
  const annualUsage = monthlyUsage * 12

  switch (input.systemGoal) {
    case "offset_100":
      targetSystemSize = annualUsage / (peakSunHours * 365 * systemEfficiency)
      break
    case "offset_80":
      targetSystemSize = (annualUsage * 0.8) / (peakSunHours * 365 * systemEfficiency)
      break
    case "offset_120":
      targetSystemSize = (annualUsage * 1.2) / (peakSunHours * 365 * systemEfficiency)
      break
    case "maximize":
      targetSystemSize = (input.roofArea * 0.7) / 17.5 // Max panels that fit
      break
    default:
      targetSystemSize = annualUsage / (peakSunHours * 365 * systemEfficiency)
  }

  // Add extra capacity for EV and pool
  if (input.hasEV) targetSystemSize += 2.5 // 2.5kW for EV charging
  if (input.hasPool) targetSystemSize += 1.5 // 1.5kW for pool pump
  if (input.futureExpansion) targetSystemSize *= 1.15 // 15% extra

  // Calculate panel count and actual system size
  const panelCount = Math.ceil((targetSystemSize * 1000) / panelWattage)
  const actualSystemSize = (panelCount * panelWattage) / 1000

  // Calculate production
  const annualProduction = actualSystemSize * peakSunHours * 365 * systemEfficiency
  const monthlyProduction = Array.from({ length: 12 }, (_, i) => {
    const seasonalMultiplier = [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6][i]
    return Math.round((annualProduction / 12) * seasonalMultiplier)
  })

  // Calculate costs
  const costPerWatt = getCostPerWatt(input.panelPreference, input.inverterType)
  const systemCost = actualSystemSize * 1000 * costPerWatt
  const batteryCost = input.batteryBackup ? (input.batteryCapacity || 13.5) * 1000 : 0
  const totalSystemCost = systemCost + batteryCost

  // Calculate incentives
  const federalTaxCredit = totalSystemCost * 0.3 // 30%
  const stateIncentives = 2000 // Mock state incentive
  const netCost = totalSystemCost - federalTaxCredit - stateIncentives

  // Calculate savings
  const annualSavings = Math.min(annualProduction, annualUsage) * input.electricityRate
  const monthlySavings = annualSavings / 12
  const paybackPeriod = netCost / annualSavings

  // Calculate bill comparison
  const monthlyBillWithSolar = Math.max(15, (monthlyUsage - annualProduction / 12) * input.electricityRate + 15)

  // Generate 15-year projections
  const yearlyProjections = []
  let cumulativeSavings = -netCost

  for (let year = 1; year <= 15; year++) {
    const escalatedRate = input.electricityRate * Math.pow(1.035, year - 1)
    const panelEfficiency = 1 - (degradationRate / 100) * (year - 1)
    const adjustedProduction = annualProduction * panelEfficiency

    const billWithoutSolar = (monthlyUsage * escalatedRate + 15) * 12
    const billWithSolar = Math.max(180, (Math.max(0, monthlyUsage - adjustedProduction / 12) * escalatedRate + 15) * 12)
    const yearlyAnnualSavings = billWithoutSolar - billWithSolar

    cumulativeSavings += yearlyAnnualSavings

    yearlyProjections.push({
      year,
      annualSavings: Math.round(yearlyAnnualSavings),
      cumulativeSavings: Math.round(cumulativeSavings),
      billWithoutSolar: Math.round(billWithoutSolar),
      billWithSolar: Math.round(billWithSolar),
      systemValue: Math.round(totalSystemCost * (1 - year * 0.08)),
    })
  }

  // Equipment recommendations
  const recommendations = {
    panelBrand: "Silfab",
    panelModel: "SIL-440 BK",
    inverterBrand: "Enphase",
    inverterModel: "IQ8+ MC",
    rackingSystem: "IronRidge XR Rail System",
    monitoringSystem: "Enphase Enlighten",
    warranty: {
      panels: "25-year product and performance warranty",
      inverters: "25-year warranty with Enphase",
      workmanship: "10-year installation warranty",
    },
  }

  // Site analysis
  const siteAnalysis = {
    roofSuitability: assessRoofSuitability(input.roofOrientation, input.roofCondition),
    shadingAssessment: assessShading(input.shading),
    structuralRequirements: "Standard residential installation",
    electricalUpgrades: actualSystemSize > 10 ? "May require electrical panel upgrade" : "Standard installation",
    permittingComplexity: "Standard residential permitting",
  }

  // Generate warnings
  const warnings = []
  if (input.roofCondition === "poor") warnings.push("Roof replacement recommended before installation")
  if (input.shading === "heavy") warnings.push("Heavy shading will significantly reduce system performance")
  if (paybackPeriod > 15) warnings.push("Long payback period - consider smaller system size")

  return {
    systemSize: Math.round(actualSystemSize * 10) / 10,
    panelCount,
    panelWattage,
    inverterCount: panelCount, // Microinverters
    annualProduction: Math.round(annualProduction),
    monthlyProduction,
    peakSunHours: Math.round(peakSunHours * 10) / 10,
    systemEfficiency: Math.round(systemEfficiency * 100),
    capacityFactor: Math.round((annualProduction / (actualSystemSize * 8760)) * 100),
    performanceRatio: Math.round(systemEfficiency * 100),
    systemCost: Math.round(totalSystemCost),
    costPerWatt: Math.round((totalSystemCost / (actualSystemSize * 1000)) * 100) / 100,
    federalTaxCredit: Math.round(federalTaxCredit),
    stateIncentives: Math.round(stateIncentives),
    netCost: Math.round(netCost),
    currentMonthlyBill: Math.round(input.monthlyBill),
    monthlyBillWithSolar: Math.round(monthlyBillWithSolar),
    monthlySavings: Math.round(monthlySavings),
    annualSavings: Math.round(annualSavings),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    co2OffsetTons: Math.round(annualProduction * 0.0004 * 100) / 100,
    treesEquivalent: Math.round(annualProduction * 0.0004 * 16),
    yearlyProjections,
    recommendations,
    siteAnalysis,
    warnings: warnings.length > 0 ? warnings : undefined,
  }
}

// Helper functions
function getPanelWattage(preference: string): number {
  switch (preference) {
    case "high_efficiency":
      return 440
    case "standard":
      return 400
    case "budget":
      return 350
    default:
      return 400
  }
}

function getSystemEfficiency(panelPreference: string, inverterType?: string): number {
  let baseEfficiency = 0.85

  if (panelPreference === "high_efficiency") baseEfficiency = 0.88
  if (panelPreference === "budget") baseEfficiency = 0.82

  if (inverterType === "microinverter") baseEfficiency += 0.03
  if (inverterType === "power_optimizer") baseEfficiency += 0.02

  return baseEfficiency
}

function getCostPerWatt(panelPreference: string, inverterType?: string): number {
  let baseCost = 3.5

  if (panelPreference === "high_efficiency") baseCost = 3.8
  if (panelPreference === "budget") baseCost = 3.2

  if (inverterType === "microinverter") baseCost += 0.3
  if (inverterType === "power_optimizer") baseCost += 0.2

  return baseCost
}

function assessRoofSuitability(orientation: string, condition: string): string {
  if (condition === "poor") return "Poor - Roof replacement recommended"
  if (orientation === "south") return "Excellent - Optimal south-facing orientation"
  if (orientation === "southeast" || orientation === "southwest") return "Good - Near-optimal orientation"
  if (orientation === "east" || orientation === "west") return "Fair - Acceptable orientation"
  return "Poor - North-facing orientation not recommended"
}

function assessShading(level: string): string {
  switch (level) {
    case "none":
      return "Excellent - No shading obstacles"
    case "minimal":
      return "Good - Minor shading during morning/evening"
    case "moderate":
      return "Fair - Some shading from trees or buildings"
    case "heavy":
      return "Poor - Significant shading will reduce performance"
    default:
      return "Assessment needed"
  }
}

export async function getProCalculationHistory() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

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
      .eq("calculation_type", "pro")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching Pro calculation history:", error)
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
    console.error("Error fetching Pro calculation history:", error)
    return {
      success: false,
      error: "An error occurred while fetching calculation history",
    }
  }
}
