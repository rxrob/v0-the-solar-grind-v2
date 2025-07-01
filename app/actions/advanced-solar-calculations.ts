"use server"

import { neon } from "@neondatabase/serverless"
import { getCurrentUser } from "./auth"

const sql = neon(process.env.DATABASE_URL!)

export interface AdvancedSolarParams {
  address: string
  coordinates: string
  monthlyKwh: number
  electricityRate: number
  roofType: string
  roofAge: string
  shadingLevel: string
  hasPool: boolean
  hasEv: boolean
  planningAdditions: boolean
  panelType: string
  inverterType: string
  batteryOption: string
  roofArea?: number
  roofTilt?: number
  roofAzimuth?: number
  utilityCompany?: string
  soilType?: string
  windLoad?: string
  snowLoad?: string
  utilityRates?: number[]
  netMeteringRate?: number
}

export interface AdvancedSolarResults {
  // Basic system specs
  systemSizeKw: number
  panelsNeeded: number
  panelWattage: number
  inverterType: string
  batteryCapacity: number

  // Production analysis
  annualProduction: number
  monthlyProduction: number[]
  peakSunHours: number
  capacityFactor: number

  // Financial analysis
  systemCost: number
  batteryCost: number
  totalCost: number
  federalTaxCredit: number
  stateIncentives: number
  localRebates: number
  netCost: number
  annualSavings: number
  monthlySavings: number
  roiYears: number
  twentyFiveYearSavings: number

  // Environmental impact
  co2OffsetTons: number
  treesEquivalent: number
  carsOffRoadEquivalent: number
  coalAvoidedPounds: number

  // Advanced metrics
  levelizedCostOfEnergy: number
  netPresentValue: number
  internalRateOfReturn: number
  paybackPeriod: number

  // System optimization
  optimalTilt: number
  optimalAzimuth: number
  shadingLosses: number
  systemEfficiency: number

  // Financing options
  financingOptions: FinancingOption[]

  // Seasonal analysis
  seasonalProduction: {
    spring: number
    summer: number
    fall: number
    winter: number
  }

  roofCoverage: number
}

export interface FinancingOption {
  type: "cash" | "loan" | "lease" | "ppa"
  name: string
  monthlyPayment: number
  totalCost: number
  savings: number
  description: string
}

export async function calculateAdvancedSolarSystem(params: AdvancedSolarParams): Promise<AdvancedSolarResults> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    // Get enhanced location data
    const [lat, lon] = params.coordinates.split(",").map(Number)

    // Calculate peak sun hours using NREL API or fallback
    const peakSunHours = await getEnhancedSolarData(lat, lon)

    // Calculate system requirements with advanced modeling
    const systemSpecs = calculateAdvancedSystemSpecs(params, peakSunHours)

    // Calculate production with detailed modeling
    const productionAnalysis = calculateDetailedProduction(systemSpecs, peakSunHours, lat)

    // Calculate comprehensive financial analysis
    const financialAnalysis = calculateComprehensiveFinancials(systemSpecs, productionAnalysis, params)

    // Calculate environmental impact
    const environmentalImpact = calculateEnvironmentalImpact(productionAnalysis.annualProduction)

    // Generate financing options
    const financingOptions = generateFinancingOptions(financialAnalysis.totalCost, financialAnalysis.annualSavings)

    // Calculate advanced metrics
    const advancedMetrics = calculateAdvancedMetrics(financialAnalysis, productionAnalysis)

    const results: AdvancedSolarResults = {
      // Basic system specs
      systemSizeKw: systemSpecs.systemSizeKw,
      panelsNeeded: systemSpecs.panelsNeeded,
      panelWattage: systemSpecs.panelWattage,
      inverterType: params.inverterType,
      batteryCapacity: systemSpecs.batteryCapacity,

      // Production analysis
      annualProduction: productionAnalysis.annualProduction,
      monthlyProduction: productionAnalysis.monthlyProduction,
      peakSunHours: peakSunHours.annual,
      capacityFactor: productionAnalysis.capacityFactor,

      // Financial analysis
      systemCost: financialAnalysis.systemCost,
      batteryCost: financialAnalysis.batteryCost,
      totalCost: financialAnalysis.totalCost,
      federalTaxCredit: financialAnalysis.federalTaxCredit,
      stateIncentives: financialAnalysis.stateIncentives,
      localRebates: financialAnalysis.localRebates,
      netCost: financialAnalysis.netCost,
      annualSavings: financialAnalysis.annualSavings,
      monthlySavings: financialAnalysis.monthlySavings,
      roiYears: financialAnalysis.roiYears,
      twentyFiveYearSavings: financialAnalysis.twentyFiveYearSavings,

      // Environmental impact
      co2OffsetTons: environmentalImpact.co2OffsetTons,
      treesEquivalent: environmentalImpact.treesEquivalent,
      carsOffRoadEquivalent: environmentalImpact.carsOffRoadEquivalent,
      coalAvoidedPounds: environmentalImpact.coalAvoidedPounds,

      // Advanced metrics
      levelizedCostOfEnergy: advancedMetrics.levelizedCostOfEnergy,
      netPresentValue: advancedMetrics.netPresentValue,
      internalRateOfReturn: advancedMetrics.internalRateOfReturn,
      paybackPeriod: advancedMetrics.paybackPeriod,

      // System optimization
      optimalTilt: calculateOptimalTilt(lat),
      optimalAzimuth: 180, // South-facing
      shadingLosses: calculateShadingLosses(params.shadingLevel),
      systemEfficiency: systemSpecs.systemEfficiency,

      // Financing options
      financingOptions,

      // Seasonal analysis
      seasonalProduction: productionAnalysis.seasonalProduction,

      roofCoverage: systemSpecs.roofCoverage,
    }

    // Save calculation to database
    await saveAdvancedCalculation(user.email, params, results)

    return results
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    throw new Error("Failed to calculate advanced solar analysis")
  }
}

// Enhanced solar data retrieval
async function getEnhancedSolarData(lat: number, lon: number) {
  try {
    // Try NREL PVWatts API first
    if (process.env.NREL_API_KEY) {
      const response = await fetch(
        `https://developer.nrel.gov/api/pvwatts/v8.json?api_key=${process.env.NREL_API_KEY}&lat=${lat}&lon=${lon}&system_capacity=4&azimuth=180&tilt=20&array_type=1&module_type=1&losses=14`,
      )

      if (response.ok) {
        const data = await response.json()
        return {
          annual: data.outputs.solrad_annual,
          monthly: data.outputs.solrad_monthly,
          capacityFactor: data.outputs.capacity_factor,
        }
      }
    }
  } catch (error) {
    console.log("NREL API unavailable, using fallback data")
  }

  // Fallback to location-based estimates
  return {
    annual: calculatePeakSunHours(lat, lon),
    monthly: generateMonthlyIrradiance(lat),
    capacityFactor: 19.5,
  }
}

// Advanced system specifications calculation
function calculateAdvancedSystemSpecs(params: AdvancedSolarParams, solarData: any) {
  // Equipment specifications
  const equipmentSpecs = {
    panels: {
      "silfab-440": { wattage: 440, efficiency: 22.6, cost: 280, degradation: 0.005 },
      "silfab-420": { wattage: 420, efficiency: 21.8, cost: 260, degradation: 0.005 },
      "silfab-460": { wattage: 460, efficiency: 23.1, cost: 300, degradation: 0.004 },
    },
    inverters: {
      "enphase-iq8m": { cost: 180, efficiency: 0.978 },
      "enphase-iq8a": { cost: 200, efficiency: 0.977 },
      "enphase-iq8h": { cost: 220, efficiency: 0.975 },
    },
    batteries: {
      none: { cost: 0, capacity: 0 },
      powerwall3: { cost: 15000, capacity: 13.5 },
      "enphase-iq5p": { cost: 8000, capacity: 5.0 },
      "enphase-iq10": { cost: 12000, capacity: 10.1 },
    },
  }

  const panelSpec =
    equipmentSpecs.panels[params.panelType as keyof typeof equipmentSpecs.panels] || equipmentSpecs.panels["silfab-440"]
  const inverterSpec =
    equipmentSpecs.inverters[params.inverterType as keyof typeof equipmentSpecs.inverters] ||
    equipmentSpecs.inverters["enphase-iq8m"]
  const batterySpec =
    equipmentSpecs.batteries[params.batteryOption as keyof typeof equipmentSpecs.batteries] ||
    equipmentSpecs.batteries.none

  // Calculate adjusted usage
  let adjustedMonthlyKwh = params.monthlyKwh
  if (params.hasPool) adjustedMonthlyKwh += 500
  if (params.hasEv) adjustedMonthlyKwh += 400
  if (params.planningAdditions) adjustedMonthlyKwh *= 1.25

  const annualKwh = adjustedMonthlyKwh * 12

  // Calculate system size with advanced modeling
  const shadingFactor = calculateShadingFactor(params.shadingLevel)
  const systemEfficiency = 0.85 * inverterSpec.efficiency * shadingFactor
  const systemSizeKw = annualKwh / (solarData.annual * 365 * systemEfficiency)

  // Calculate panel requirements
  const panelsNeeded = Math.ceil((systemSizeKw * 1000) / panelSpec.wattage)
  const actualSystemSize = (panelsNeeded * panelSpec.wattage) / 1000

  // Calculate roof coverage
  const roofCoverage = params.roofArea ? Math.min(((panelsNeeded * 22) / params.roofArea) * 100, 100) : 0

  return {
    systemSizeKw: actualSystemSize,
    panelsNeeded,
    panelWattage: panelSpec.wattage,
    panelCost: panelSpec.cost,
    inverterCost: inverterSpec.cost,
    batteryCapacity: batterySpec.capacity,
    batteryCost: batterySpec.cost,
    systemEfficiency,
    shadingFactor,
    roofCoverage,
  }
}

// Detailed production calculation
function calculateDetailedProduction(systemSpecs: any, solarData: any, latitude: number) {
  const annualProduction = systemSpecs.systemSizeKw * solarData.annual * 365 * systemSpecs.systemEfficiency

  // Monthly production with seasonal variation
  const monthlyProduction = solarData.monthly
    ? solarData.monthly.map((irradiance: number) =>
        Math.round(systemSpecs.systemSizeKw * irradiance * 30.44 * systemSpecs.systemEfficiency),
      )
    : generateMonthlyProduction(systemSpecs.systemSizeKw, solarData.annual, latitude)

  // Seasonal averages
  const seasonalProduction = {
    spring: Math.round((monthlyProduction[2] + monthlyProduction[3] + monthlyProduction[4]) / 3),
    summer: Math.round((monthlyProduction[5] + monthlyProduction[6] + monthlyProduction[7]) / 3),
    fall: Math.round((monthlyProduction[8] + monthlyProduction[9] + monthlyProduction[10]) / 3),
    winter: Math.round((monthlyProduction[11] + monthlyProduction[0] + monthlyProduction[1]) / 3),
  }

  const capacityFactor = (annualProduction / (systemSpecs.systemSizeKw * 8760)) * 100

  return {
    annualProduction: Math.round(annualProduction),
    monthlyProduction,
    seasonalProduction,
    capacityFactor: Math.round(capacityFactor * 10) / 10,
  }
}

// Comprehensive financial analysis
function calculateComprehensiveFinancials(systemSpecs: any, production: any, params: AdvancedSolarParams) {
  // System costs
  const panelCost = systemSpecs.panelsNeeded * systemSpecs.panelCost
  const inverterCost = systemSpecs.panelsNeeded * systemSpecs.inverterCost
  const installationCost = systemSpecs.systemSizeKw * 1200 // $1.20/W
  const systemCost = panelCost + inverterCost + installationCost
  const batteryCost = systemSpecs.batteryCost
  const totalCost = systemCost + batteryCost

  // Incentives
  const federalTaxCredit = totalCost * 0.3 // 30% federal tax credit
  const stateIncentives = calculateStateIncentives(params.address, systemSpecs.systemSizeKw)
  const localRebates = calculateLocalRebates(params.address, systemSpecs.systemSizeKw)
  const netCost = totalCost - federalTaxCredit - stateIncentives - localRebates

  // Savings calculation
  const annualSavings = Math.min(production.annualProduction, params.monthlyKwh * 12) * params.electricityRate
  const monthlySavings = annualSavings / 12

  // ROI calculation
  const roiYears = netCost / annualSavings

  // 25-year savings with escalation
  const electricityEscalation = 0.03
  let twentyFiveYearSavings = 0
  for (let year = 1; year <= 25; year++) {
    const yearlyRate = Math.pow(1 + electricityEscalation, year - 1)
    twentyFiveYearSavings += annualSavings * yearlyRate
  }

  return {
    systemCost: Math.round(systemCost),
    batteryCost: Math.round(batteryCost),
    totalCost: Math.round(totalCost),
    federalTaxCredit: Math.round(federalTaxCredit),
    stateIncentives: Math.round(stateIncentives),
    localRebates: Math.round(localRebates),
    netCost: Math.round(netCost),
    annualSavings: Math.round(annualSavings),
    monthlySavings: Math.round(monthlySavings),
    roiYears: Math.round(roiYears * 10) / 10,
    twentyFiveYearSavings: Math.round(twentyFiveYearSavings),
  }
}

// Environmental impact calculation
function calculateEnvironmentalImpact(annualProduction: number) {
  const co2PerKwh = 0.0004 // tons CO2 per kWh
  const co2OffsetTons = annualProduction * co2PerKwh
  const treesEquivalent = Math.round(co2OffsetTons * 16)
  const carsOffRoadEquivalent = Math.round((co2OffsetTons * 2300) / 12000) // assuming 12k miles/year
  const coalAvoidedPounds = Math.round(annualProduction * 0.9) // pounds of coal

  return {
    co2OffsetTons: Math.round(co2OffsetTons * 10) / 10,
    treesEquivalent,
    carsOffRoadEquivalent,
    coalAvoidedPounds,
  }
}

// Advanced financial metrics
function calculateAdvancedMetrics(financial: any, production: any) {
  const discountRate = 0.06 // 6% discount rate
  const systemLife = 25 // years

  // Levelized Cost of Energy (LCOE)
  let totalCosts = financial.netCost
  let totalProduction = 0

  for (let year = 1; year <= systemLife; year++) {
    const degradation = Math.pow(0.995, year - 1) // 0.5% annual degradation
    totalProduction += production.annualProduction * degradation

    // Add O&M costs
    const omCost = 20 * Math.pow(1.02, year - 1) // $20/year escalating at 2%
    totalCosts += omCost / Math.pow(1 + discountRate, year)
  }

  const levelizedCostOfEnergy = (totalCosts / totalProduction) * 100 // cents per kWh

  // Net Present Value (NPV)
  let npv = -financial.netCost
  for (let year = 1; year <= systemLife; year++) {
    const yearlyRate = Math.pow(1.03, year - 1) // 3% electricity escalation
    const savings = financial.annualSavings * yearlyRate
    npv += savings / Math.pow(1 + discountRate, year)
  }

  // Internal Rate of Return (IRR) - simplified calculation
  const irr = (financial.annualSavings / financial.netCost) * 100

  // Simple payback period
  const paybackPeriod = financial.netCost / financial.annualSavings

  return {
    levelizedCostOfEnergy: Math.round(levelizedCostOfEnergy * 100) / 100,
    netPresentValue: Math.round(npv),
    internalRateOfReturn: Math.round(irr * 10) / 10,
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
  }
}

// Generate financing options
function generateFinancingOptions(totalCost: number, annualSavings: number): FinancingOption[] {
  return [
    {
      type: "cash",
      name: "Cash Purchase",
      monthlyPayment: 0,
      totalCost,
      savings: annualSavings,
      description: "Pay upfront and maximize savings with no interest or fees",
    },
    {
      type: "loan",
      name: "Solar Loan (20 years)",
      monthlyPayment: Math.round((totalCost * 0.06) / 12), // Simplified loan payment
      totalCost: totalCost * 1.2, // With interest
      savings: annualSavings - ((totalCost * 0.06) / 12) * 12,
      description: "Finance your system with competitive rates and immediate savings",
    },
    {
      type: "lease",
      name: "Solar Lease",
      monthlyPayment: Math.round((annualSavings * 0.8) / 12), // 80% of savings
      totalCost: annualSavings * 0.8 * 20, // 20-year lease
      savings: annualSavings * 0.2, // 20% savings
      description: "No upfront cost, immediate savings with fixed monthly payments",
    },
    {
      type: "ppa",
      name: "Power Purchase Agreement",
      monthlyPayment: Math.round((annualSavings * 0.75) / 12), // 75% of current bill
      totalCost: annualSavings * 0.75 * 20,
      savings: annualSavings * 0.25, // 25% savings
      description: "Pay only for the power you use at a discounted rate",
    },
  ]
}

// Helper functions
function calculatePeakSunHours(lat: number, lon: number): number {
  // Simplified calculation based on latitude
  const baseHours = 5.5
  const latitudeAdjustment = (35 - Math.abs(lat)) * 0.02 // Adjust based on latitude
  return Math.max(3.5, Math.min(7.5, baseHours + latitudeAdjustment))
}

function generateMonthlyIrradiance(latitude: number): number[] {
  // Generate monthly irradiance based on latitude
  const basePattern = [0.6, 0.7, 0.9, 1.1, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]
  const latitudeAdjustment = (35 - Math.abs(latitude)) * 0.01

  return basePattern.map((factor) => Math.max(0.4, factor + latitudeAdjustment))
}

function generateMonthlyProduction(systemSizeKw: number, annualIrradiance: number, latitude: number): number[] {
  const monthlyIrradiance = generateMonthlyIrradiance(latitude)
  const baseMonthlyProduction = systemSizeKw * annualIrradiance * 30.44 // 30.44 = avg days per month

  return monthlyIrradiance.map((factor) => Math.round(baseMonthlyProduction * factor))
}

function calculateShadingFactor(shadingLevel: string): number {
  const factors = {
    none: 1.0,
    light: 0.95,
    moderate: 0.85,
    heavy: 0.7,
  }
  return factors[shadingLevel as keyof typeof factors] || 1.0
}

function calculateOptimalTilt(latitude: number): number {
  // Optimal tilt is approximately equal to latitude for year-round production
  return Math.round(Math.abs(latitude))
}

function calculateShadingLosses(shadingLevel: string): number {
  const losses = {
    none: 0,
    light: 5,
    moderate: 15,
    heavy: 30,
  }
  return losses[shadingLevel as keyof typeof losses] || 0
}

function calculateStateIncentives(address: string, systemSizeKw: number): number {
  // State incentive lookup (simplified)
  const stateIncentives: Record<string, number> = {
    CA: 1000, // SGIP and other programs
    NY: 800, // NY-Sun
    MA: 1200, // SMART program
    NJ: 600, // SRP
    CT: 500, // Green Bank
    RI: 400, // REG
    VT: 300, // PACE
    NH: 200, // REC
    // Add more states as needed
  }

  const stateMatch = address.match(/\b([A-Z]{2})\b/)
  const state = stateMatch ? stateMatch[1] : null
  const baseIncentive = state && stateIncentives[state] ? stateIncentives[state] : 0

  return Math.round(baseIncentive * systemSizeKw)
}

function calculateLocalRebates(address: string, systemSizeKw: number): number {
  // Local utility rebates (simplified)
  // In reality, this would query a database of utility programs
  const avgRebate = 200 // $200 per kW average
  return Math.round(avgRebate * systemSizeKw)
}

async function saveAdvancedCalculation(userEmail: string, params: AdvancedSolarParams, results: AdvancedSolarResults) {
  try {
    await sql`
      INSERT INTO solar_calculations (
        user_email, address, coordinates, monthly_kwh, electricity_rate,
        roof_type, roof_age, shading_level, has_pool, has_ev, planning_additions,
        utility_company, results, created_at
      ) VALUES (
        ${userEmail}, ${params.address}, ${params.coordinates}, ${params.monthlyKwh},
        ${params.electricityRate}, ${params.roofType}, ${params.roofAge}, 
        ${params.shadingLevel}, ${params.hasPool}, ${params.hasEv}, 
        ${params.planningAdditions}, ${params.utilityCompany || "Unknown"}, 
        ${JSON.stringify(results)}, NOW()
      )
    `
  } catch (error) {
    console.error("Failed to save advanced calculation:", error)
    // Don't throw error - calculation succeeded, just logging failed
  }
}

function getAdvancedOrientationMultiplier(orientation: string): number {
  const multipliers: { [key: string]: number } = {
    south: 1.0,
    southwest: 0.96,
    southeast: 0.96,
    west: 0.89,
    east: 0.89,
    northwest: 0.79,
    northeast: 0.79,
    north: 0.69,
  }
  return multipliers[orientation.toLowerCase()] || 0.9
}

function getAdvancedTiltMultiplier(tilt: number): number {
  // Optimal tilt varies by latitude, using 30-35 as baseline
  const optimalTilt = 32
  const difference = Math.abs(tilt - optimalTilt)

  if (difference <= 5) return 1.0
  if (difference <= 10) return 0.98
  if (difference <= 20) return 0.94
  if (difference <= 30) return 0.88
  return 0.8
}

function getSeasonalVariation(location: string): number[] {
  // Simplified seasonal variation - would use actual weather data in production
  return [0.7, 0.85, 1.0, 1.15, 1.2, 1.15, 1.1, 1.05, 0.95, 0.8, 0.7, 0.65]
}

function getTemperatureDerating(location: string): number {
  // Temperature coefficient for solar panels (simplified)
  // Would use actual temperature data in production
  return 0.92 // 8% derating for temperature
}

function calculateInstallationComplexity(soilType: string, windLoad: string, snowLoad: string): number {
  let complexity = 1.0

  // Soil type complexity
  if (soilType === "rocky") complexity += 0.15
  else if (soilType === "clay") complexity += 0.1
  else if (soilType === "sandy") complexity += 0.05

  // Wind load complexity
  if (windLoad === "high") complexity += 0.2
  else if (windLoad === "medium") complexity += 0.1

  // Snow load complexity
  if (snowLoad === "heavy") complexity += 0.15
  else if (snowLoad === "medium") complexity += 0.08

  return Math.min(complexity, 1.5) // Cap at 50% increase
}

function calculateNetMeteringSavings(production: number, consumption: number, rate: number): number {
  if (production <= consumption) {
    return production * rate
  } else {
    // Excess production typically gets lower compensation
    const excessRate = rate * 0.75 // 75% of retail rate for excess
    return consumption * rate + (production - consumption) * excessRate
  }
}
