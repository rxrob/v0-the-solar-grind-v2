"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface ProSolarInput {
  // Basic inputs
  monthlyBill: number
  roofSize: number
  location: string

  // Advanced inputs
  panelType: string
  roofType: string
  shading: string
  tiltAngle: number
  azimuthAngle: number
  electricityRate: number
  netMeteringRate: number

  // Pro inputs
  inverterType: string
  batteryStorage: boolean
  batteryCapacity: number
  timeOfUseRates: boolean
  peakRate: number
  offPeakRate: number
  demandCharges: number
  interconnectionCost: number
  permitCost: number

  userId?: string
}

interface ProSolarResult {
  // Basic results
  systemSize: number
  estimatedCost: number
  annualSavings: number
  paybackPeriod: number
  co2Reduction: number
  panelsNeeded: number
  roofCoverage: number

  // Advanced results
  monthlyProduction: number[]
  annualProduction: number
  efficiency: number
  roi: number
  netPresentValue: number

  // Pro results
  batteryBenefit: number
  demandChargeSavings: number
  timeOfUseSavings: number
  totalSystemCost: number
  financingOptions: FinancingOption[]
  monthlyEnergyProfile: MonthlyProfile[]
  optimizedSystemDesign: SystemDesign
  performanceGuarantee: PerformanceGuarantee
}

interface FinancingOption {
  type: string
  monthlyPayment: number
  totalCost: number
  interestRate: number
  term: number
}

interface MonthlyProfile {
  month: string
  production: number
  consumption: number
  gridExport: number
  gridImport: number
  savings: number
}

interface SystemDesign {
  panelLayout: string
  inverterConfiguration: string
  batteryPlacement: string
  wiringDiagram: string
  recommendations: string[]
}

interface PerformanceGuarantee {
  year1Production: number
  year25Production: number
  degradationRate: number
  warrantyTerms: string[]
}

export async function calculateProSolarSystem(input: ProSolarInput): Promise<ProSolarResult> {
  const {
    monthlyBill,
    roofSize,
    location,
    panelType,
    roofType,
    shading,
    tiltAngle,
    azimuthAngle,
    electricityRate,
    netMeteringRate,
    inverterType,
    batteryStorage,
    batteryCapacity,
    timeOfUseRates,
    peakRate,
    offPeakRate,
    demandCharges,
    interconnectionCost,
    permitCost,
  } = input

  // Advanced panel specifications
  const panelSpecs = {
    standard: { efficiency: 0.18, costPerWatt: 3.5, degradation: 0.005, warranty: 25 },
    premium: { efficiency: 0.22, costPerWatt: 4.0, degradation: 0.003, warranty: 25 },
    monocrystalline: { efficiency: 0.2, costPerWatt: 3.8, degradation: 0.004, warranty: 25 },
    polycrystalline: { efficiency: 0.16, costPerWatt: 3.2, degradation: 0.006, warranty: 20 },
    bifacial: { efficiency: 0.21, costPerWatt: 4.2, degradation: 0.003, warranty: 30 },
  }

  const specs = panelSpecs[panelType as keyof typeof panelSpecs] || panelSpecs.standard

  // Inverter specifications
  const inverterSpecs = {
    string: { efficiency: 0.96, costPerWatt: 0.3, reliability: 0.98 },
    power_optimizer: { efficiency: 0.97, costPerWatt: 0.4, reliability: 0.99 },
    microinverter: { efficiency: 0.95, costPerWatt: 0.5, reliability: 0.995 },
  }

  const inverterSpec = inverterSpecs[inverterType as keyof typeof inverterSpecs] || inverterSpecs.string

  // Environmental factors
  const shadingFactors = {
    none: 1.0,
    minimal: 0.95,
    moderate: 0.85,
    heavy: 0.7,
  }

  const roofTypeFactors = {
    asphalt: 1.0,
    metal: 1.05,
    tile: 0.95,
    flat: 0.9,
    membrane: 0.92,
  }

  // Location-based data
  const locationData: { [key: string]: { irradiance: number; tempCoeff: number; weatherFactor: number } } = {
    california: { irradiance: 5.5, tempCoeff: 0.95, weatherFactor: 0.98 },
    arizona: { irradiance: 6.5, tempCoeff: 0.9, weatherFactor: 0.99 },
    florida: { irradiance: 5.0, tempCoeff: 0.92, weatherFactor: 0.95 },
    texas: { irradiance: 5.2, tempCoeff: 0.93, weatherFactor: 0.97 },
    nevada: { irradiance: 6.0, tempCoeff: 0.91, weatherFactor: 0.99 },
    default: { irradiance: 4.5, tempCoeff: 0.95, weatherFactor: 0.96 },
  }

  const locData = locationData[location.toLowerCase()] || locationData.default

  // System sizing calculations
  const annualUsage = (monthlyBill * 12) / electricityRate
  const shadingFactor = shadingFactors[shading as keyof typeof shadingFactors] || 1.0
  const roofFactor = roofTypeFactors[roofType as keyof typeof roofTypeFactors] || 1.0

  // Tilt and azimuth optimization
  const tiltFactor = Math.cos((Math.abs(tiltAngle - 35) * Math.PI) / 180) * 0.1 + 0.9
  const azimuthFactor = Math.cos((Math.abs(azimuthAngle - 180) * Math.PI) / 180) * 0.1 + 0.9

  const baseSystemSize = Math.min(annualUsage / 1200, roofSize / 100)
  const systemSize =
    baseSystemSize *
    specs.efficiency *
    shadingFactor *
    roofFactor *
    tiltFactor *
    azimuthFactor *
    inverterSpec.efficiency
  const panelsNeeded = Math.ceil(systemSize / 0.4)
  const roofCoverage = (panelsNeeded * 20) / roofSize

  // Cost calculations
  const panelCost = systemSize * 1000 * specs.costPerWatt
  const inverterCost = systemSize * 1000 * inverterSpec.costPerWatt
  const batteryCost = batteryStorage ? batteryCapacity * 800 : 0 // $800 per kWh
  const installationCost = (panelCost + inverterCost) * 0.3
  const totalSystemCost = panelCost + inverterCost + batteryCost + installationCost + interconnectionCost + permitCost

  const federalTaxCredit = totalSystemCost * 0.3
  const netCost = totalSystemCost - federalTaxCredit

  // Monthly production calculation with seasonal variations
  const monthlyProduction = Array.from({ length: 12 }, (_, month) => {
    const seasonalFactor = 0.8 + 0.4 * Math.cos(((month - 5) * Math.PI) / 6)
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
    return Math.round(
      systemSize *
        locData.irradiance *
        daysInMonth *
        seasonalFactor *
        shadingFactor *
        tiltFactor *
        azimuthFactor *
        locData.tempCoeff *
        locData.weatherFactor,
    )
  })

  const annualProduction = monthlyProduction.reduce((sum, monthly) => sum + monthly, 0)

  // Time-of-use calculations
  let timeOfUseSavings = 0
  if (timeOfUseRates) {
    const peakHours = 6 // hours per day
    const offPeakHours = 18
    const peakProduction = annualProduction * 0.4 // 40% during peak hours
    const offPeakProduction = annualProduction * 0.6

    timeOfUseSavings = peakProduction * peakRate + offPeakProduction * offPeakRate - annualProduction * electricityRate
  }

  // Battery benefits
  let batteryBenefit = 0
  if (batteryStorage) {
    const dailyStorageValue = batteryCapacity * (peakRate - offPeakRate) * 300 // 300 days per year
    batteryBenefit = dailyStorageValue
  }

  // Demand charge savings
  const demandChargeSavings = batteryStorage ? demandCharges * 12 * 0.7 : 0 // 70% reduction

  // Financial calculations
  const totalAnnualSavings =
    annualProduction * netMeteringRate + timeOfUseSavings + batteryBenefit + demandChargeSavings
  const paybackPeriod = netCost / totalAnnualSavings
  const twentyYearSavings = totalAnnualSavings * 20 - netCost

  // Advanced financial metrics
  const discountRate = 0.06
  const systemLife = 25
  let npv = -netCost

  for (let year = 1; year <= systemLife; year++) {
    const yearlyProduction = annualProduction * Math.pow(1 - specs.degradation, year - 1)
    const yearlySavings =
      yearlyProduction * electricityRate * Math.pow(1.03, year - 1) +
      timeOfUseSavings * Math.pow(1.03, year - 1) +
      batteryBenefit * Math.pow(1.02, year - 1)
    npv += yearlySavings / Math.pow(1 + discountRate, year)
  }

  const roi = (twentyYearSavings / netCost) * 100

  // Financing options
  const financingOptions: FinancingOption[] = [
    {
      type: "Cash Purchase",
      monthlyPayment: 0,
      totalCost: netCost,
      interestRate: 0,
      term: 0,
    },
    {
      type: "Solar Loan (12 years)",
      monthlyPayment: calculateLoanPayment(netCost, 0.045, 12),
      totalCost: calculateLoanPayment(netCost, 0.045, 12) * 144,
      interestRate: 4.5,
      term: 12,
    },
    {
      type: "Solar Loan (20 years)",
      monthlyPayment: calculateLoanPayment(netCost, 0.055, 20),
      totalCost: calculateLoanPayment(netCost, 0.055, 20) * 240,
      interestRate: 5.5,
      term: 20,
    },
  ]

  // Monthly energy profile
  const monthlyEnergyProfile: MonthlyProfile[] = monthlyProduction.map((production, index) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const consumption = annualUsage / 12
    const gridExport = Math.max(0, production - consumption)
    const gridImport = Math.max(0, consumption - production)
    const savings = production * electricityRate

    return {
      month: monthNames[index],
      production,
      consumption: Math.round(consumption),
      gridExport: Math.round(gridExport),
      gridImport: Math.round(gridImport),
      savings: Math.round(savings),
    }
  })

  // System design recommendations
  const optimizedSystemDesign: SystemDesign = {
    panelLayout: `${panelsNeeded} panels in ${Math.ceil(panelsNeeded / 20)} rows`,
    inverterConfiguration: `${inverterType} inverter system with ${Math.ceil(systemSize / 5)} units`,
    batteryPlacement: batteryStorage
      ? `${batteryCapacity}kWh battery system in garage/utility room`
      : "No battery storage",
    wiringDiagram: "Optimized DC and AC wiring with rapid shutdown compliance",
    recommendations: [
      `Optimal tilt angle: ${Math.round(35 + Math.sin((tiltAngle * Math.PI) / 180) * 10)}°`,
      `Recommended azimuth: 180° (true south)`,
      `Consider ${panelType} panels for maximum efficiency`,
      batteryStorage
        ? "Battery backup recommended for energy independence"
        : "Consider adding battery storage for backup power",
      "Regular maintenance every 6 months recommended",
    ],
  }

  // Performance guarantee
  const performanceGuarantee: PerformanceGuarantee = {
    year1Production: Math.round(annualProduction * 0.98), // 98% of calculated
    year25Production: Math.round(annualProduction * Math.pow(1 - specs.degradation, 24)),
    degradationRate: specs.degradation,
    warrantyTerms: [
      `${specs.warranty}-year panel warranty`,
      "25-year performance guarantee",
      "10-year inverter warranty",
      batteryStorage ? "10-year battery warranty" : "",
      "2-year installation warranty",
    ].filter(Boolean),
  }

  // Environmental impact
  const co2Reduction = annualProduction * 0.92

  return {
    systemSize: Math.round(systemSize * 100) / 100,
    estimatedCost: Math.round(totalSystemCost),
    annualSavings: Math.round(totalAnnualSavings),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    co2Reduction: Math.round(co2Reduction),
    panelsNeeded,
    roofCoverage: Math.round(roofCoverage * 100),
    monthlyProduction,
    annualProduction: Math.round(annualProduction),
    efficiency: Math.round(specs.efficiency * 100),
    roi: Math.round(roi * 10) / 10,
    netPresentValue: Math.round(npv),
    batteryBenefit: Math.round(batteryBenefit),
    demandChargeSavings: Math.round(demandChargeSavings),
    timeOfUseSavings: Math.round(timeOfUseSavings),
    totalSystemCost: Math.round(totalSystemCost),
    financingOptions,
    monthlyEnergyProfile,
    optimizedSystemDesign,
    performanceGuarantee,
  }
}

function calculateLoanPayment(principal: number, rate: number, years: number): number {
  const monthlyRate = rate / 12
  const numPayments = years * 12
  return Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1),
  )
}

export async function saveProCalculation(userId: string, input: ProSolarInput, result: ProSolarResult) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: "", ...options })
          },
        },
      },
    )

    const { error } = await supabase.from("solar_calculations").insert({
      user_id: userId,
      calculation_type: "pro",
      input_data: input,
      result_data: result,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving pro calculation:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving pro calculation:", error)
    return { success: false, error: "Failed to save calculation" }
  }
}

export async function getUserProCalculations(userId: string) {
  try {
    const cookieStore = await cookies()
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

    const { data, error } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_id", userId)
      .eq("calculation_type", "pro")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching pro calculations:", error)
      return { success: false, error: error.message, data: [] }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching pro calculations:", error)
    return { success: false, error: "Failed to fetch calculations", data: [] }
  }
}
