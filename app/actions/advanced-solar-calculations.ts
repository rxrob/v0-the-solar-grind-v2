"use server"

import { getCurrentUserReal } from "./auth-real"

export interface AdvancedSolarParams {
  address: string
  latitude: number
  longitude: number
  monthlyBill: number
  roofArea: number
  systemSize: number
  panelEfficiency: number
  tiltAngle: number
  azimuthAngle: number
  shadingFactor: number
  electricityRate: number
  netMetering: boolean
  annualUsage: number
  installationCost: number
  maintenanceCost: number
  degradationRate: number
  inverterEfficiency: number
  systemLosses: number
  federalTaxCredit: number
  stateIncentives: number
  utilityRebates: number
  financingRate: number
  financingTerm: number
  escalationRate: number
  discountRate: number
}

export interface AdvancedSolarResults {
  systemSpecifications: {
    recommendedSize: number
    numberOfPanels: number
    panelWattage: number
    inverterSize: number
    roofAreaNeeded: number
    estimatedWeight: number
  }
  energyProduction: {
    annualProduction: number
    monthlyProduction: number[]
    dailyAverage: number
    peakProduction: number
    firstYearProduction: number
    year25Production: number
  }
  energyConsumption: {
    annualConsumption: number
    monthlyConsumption: number[]
    peakDemand: number
    loadFactor: number
  }
  financialAnalysis: {
    totalSystemCost: number
    netSystemCost: number
    federalTaxCredit: number
    stateIncentives: number
    utilityRebates: number
    annualSavings: number
    monthlySavings: number[]
    paybackPeriod: number
    roi25Years: number
    npv: number
    irr: number
    lcoe: number
    lifetimeSavings: number
  }
  environmentalImpact: {
    co2OffsetAnnual: number
    co2OffsetLifetime: number
    equivalentTrees: number
    equivalentCars: number
    coalOffset: number
  }
  performanceMetrics: {
    capacityFactor: number
    performanceRatio: number
    specificYield: number
    energyYield: number
  }
  monthlyBreakdown: {
    month: string
    production: number
    consumption: number
    netUsage: number
    billWithSolar: number
    billWithoutSolar: number
    savings: number
  }[]
}

async function saveAdvancedCalculation(userEmail: string, params: AdvancedSolarParams, results: AdvancedSolarResults) {
  // This would save to database in a real implementation
  console.log("Saving advanced calculation for:", userEmail)
  console.log("Params:", params)
  console.log("Results:", results)
}

export async function performAdvancedSolarCalculation(params: AdvancedSolarParams): Promise<AdvancedSolarResults> {
  try {
    // Get current user
    const user = await getCurrentUserReal()

    // Validate required parameters
    if (!params.latitude || !params.longitude) {
      throw new Error("Location coordinates are required")
    }

    if (!params.roofArea || params.roofArea <= 0) {
      throw new Error("Valid roof area is required")
    }

    if (!params.systemSize || params.systemSize <= 0) {
      throw new Error("Valid system size is required")
    }

    // Get solar irradiance data from NREL
    const irradianceData = await fetchNRELIrradianceData(
      params.latitude,
      params.longitude,
      params.tiltAngle,
      params.azimuthAngle,
    )

    // Calculate system specifications
    const systemSpecs = calculateSystemSpecifications(params)

    // Calculate energy production
    const energyProduction = calculateEnergyProduction(params, irradianceData, systemSpecs)

    // Calculate energy consumption
    const energyConsumption = calculateEnergyConsumption(params)

    // Calculate financial analysis
    const financialAnalysis = calculateFinancialAnalysis(params, energyProduction, energyConsumption)

    // Calculate environmental impact
    const environmentalImpact = calculateEnvironmentalImpact(energyProduction)

    // Calculate performance metrics
    const performanceMetrics = calculatePerformanceMetrics(params, energyProduction, systemSpecs)

    // Generate monthly breakdown
    const monthlyBreakdown = generateMonthlyBreakdown(energyProduction, energyConsumption, financialAnalysis, params)

    const results: AdvancedSolarResults = {
      systemSpecifications: systemSpecs,
      energyProduction,
      energyConsumption,
      financialAnalysis,
      environmentalImpact,
      performanceMetrics,
      monthlyBreakdown,
    }

    // Save calculation to database if user is authenticated
    if (user && user.email) {
      await saveAdvancedCalculation(user.email, params, results)
    }

    return results
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    throw new Error(error instanceof Error ? error.message : "Calculation failed")
  }
}

async function fetchNRELIrradianceData(latitude: number, longitude: number, tilt: number, azimuth: number) {
  try {
    const apiKey = process.env.NREL_API_KEY
    if (!apiKey) {
      throw new Error("NREL API key not configured")
    }

    const url = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${apiKey}&lat=${latitude}&lon=${longitude}&tilt=${tilt}&azimuth=${azimuth}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`NREL API error: ${response.status}`)
    }

    const data = await response.json()
    return data.outputs
  } catch (error) {
    console.error("NREL API error:", error)
    // Return default values if API fails
    return {
      avg_ghi: { annual: 4.5 },
      avg_dni: { annual: 5.2 },
      avg_dhi: { annual: 2.1 },
      avg_lat_tilt: { annual: 5.0 },
    }
  }
}

function calculateSystemSpecifications(params: AdvancedSolarParams) {
  const panelWattage = 400 // Standard panel wattage
  const numberOfPanels = Math.ceil((params.systemSize * 1000) / panelWattage)
  const inverterSize = params.systemSize * params.inverterEfficiency
  const panelArea = 2.0 // m² per panel
  const roofAreaNeeded = numberOfPanels * panelArea
  const estimatedWeight = numberOfPanels * 20 // kg per panel

  return {
    recommendedSize: params.systemSize,
    numberOfPanels,
    panelWattage,
    inverterSize,
    roofAreaNeeded,
    estimatedWeight,
  }
}

function calculateEnergyProduction(params: AdvancedSolarParams, irradianceData: any, systemSpecs: any) {
  const peakSunHours = irradianceData.avg_ghi?.annual || 4.5
  const systemEfficiency =
    (params.panelEfficiency / 100) * (params.inverterEfficiency / 100) * (1 - params.systemLosses / 100)
  const shadingAdjustment = 1 - params.shadingFactor / 100

  // Calculate annual production
  const annualProduction = params.systemSize * peakSunHours * 365 * systemEfficiency * shadingAdjustment

  // Calculate monthly production with seasonal variations
  const monthlyProduction: number[] = []
  const seasonalFactors = [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]

  for (let i = 0; i < 12; i++) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i]
    const monthlyProd = (annualProduction / 365) * daysInMonth * seasonalFactors[i]
    monthlyProduction.push(monthlyProd)
  }

  const dailyAverage = annualProduction / 365
  const peakProduction = params.systemSize * 0.8 // 80% of rated capacity
  const firstYearProduction = annualProduction
  const year25Production = annualProduction * Math.pow(1 - params.degradationRate / 100, 24)

  return {
    annualProduction,
    monthlyProduction,
    dailyAverage,
    peakProduction,
    firstYearProduction,
    year25Production,
  }
}

function calculateEnergyConsumption(params: AdvancedSolarParams) {
  const annualConsumption = params.annualUsage

  // Calculate monthly consumption (distribute annual usage)
  const monthlyConsumption: number[] = []
  const seasonalFactors = [1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 1.2, 1.3, 1.1, 0.9, 1.0, 1.1]
  const avgMonthlyUsage = params.annualUsage / 12

  for (let i = 0; i < 12; i++) {
    monthlyConsumption.push(avgMonthlyUsage * seasonalFactors[i])
  }

  const peakDemand = (params.monthlyBill / params.electricityRate) * 1.5 // Estimate peak demand
  const loadFactor = annualConsumption / (peakDemand * 8760) // Annual hours

  return {
    annualConsumption,
    monthlyConsumption,
    peakDemand,
    loadFactor,
  }
}

function calculateFinancialAnalysis(params: AdvancedSolarParams, energyProduction: any, energyConsumption: any) {
  const totalSystemCost = params.installationCost
  const federalTaxCredit = totalSystemCost * (params.federalTaxCredit / 100)
  const stateIncentives = params.stateIncentives
  const utilityRebates = params.utilityRebates
  const netSystemCost = totalSystemCost - federalTaxCredit - stateIncentives - utilityRebates

  // Calculate annual savings
  const annualEnergyOffset = Math.min(energyProduction.annualProduction, energyConsumption.annualConsumption)
  const annualSavings = annualEnergyOffset * params.electricityRate

  // Calculate monthly savings
  const monthlySavings: number[] = []
  for (let i = 0; i < 12; i++) {
    const monthlyOffset = Math.min(energyProduction.monthlyProduction[i], energyConsumption.monthlyConsumption[i])
    const savings = monthlyOffset * params.electricityRate
    monthlySavings.push(savings)
  }

  // Calculate payback period
  const paybackPeriod = netSystemCost / annualSavings

  // Calculate NPV and IRR
  const cashFlows = [-netSystemCost]
  for (let year = 1; year <= 25; year++) {
    const yearlyProduction = energyProduction.annualProduction * Math.pow(1 - params.degradationRate / 100, year - 1)
    const yearlyRate = params.electricityRate * Math.pow(1 + params.escalationRate / 100, year - 1)
    const yearlySavings = Math.min(yearlyProduction, energyConsumption.annualConsumption) * yearlyRate
    const maintenanceCost = params.maintenanceCost * Math.pow(1 + 0.03, year - 1) // 3% inflation
    cashFlows.push(yearlySavings - maintenanceCost)
  }

  const npv = calculateNPV(cashFlows, params.discountRate / 100)
  const irr = calculateIRR(cashFlows)
  const roi25Years = (npv / netSystemCost) * 100
  const lcoe = netSystemCost / (energyProduction.annualProduction * 25)
  const lifetimeSavings = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0)

  return {
    totalSystemCost,
    netSystemCost,
    federalTaxCredit,
    stateIncentives,
    utilityRebates,
    annualSavings,
    monthlySavings,
    paybackPeriod,
    roi25Years,
    npv,
    irr,
    lcoe,
    lifetimeSavings,
  }
}

function calculateEnvironmentalImpact(energyProduction: any) {
  const co2PerKwh = 0.4 // kg CO2 per kWh (grid average)
  const co2OffsetAnnual = energyProduction.annualProduction * co2PerKwh
  const co2OffsetLifetime = co2OffsetAnnual * 25

  const equivalentTrees = co2OffsetLifetime / 22 // kg CO2 per tree per year
  const equivalentCars = co2OffsetLifetime / 4600 // kg CO2 per car per year
  const coalOffset = co2OffsetLifetime / 2.2 // kg CO2 per kg coal

  return {
    co2OffsetAnnual,
    co2OffsetLifetime,
    equivalentTrees,
    equivalentCars,
    coalOffset,
  }
}

function calculatePerformanceMetrics(params: AdvancedSolarParams, energyProduction: any, systemSpecs: any) {
  const capacityFactor = energyProduction.annualProduction / (params.systemSize * 8760)
  const performanceRatio = capacityFactor / 0.2 // Theoretical maximum
  const specificYield = energyProduction.annualProduction / params.systemSize
  const energyYield = energyProduction.annualProduction / systemSpecs.roofAreaNeeded

  return {
    capacityFactor,
    performanceRatio,
    specificYield,
    energyYield,
  }
}

function generateMonthlyBreakdown(
  energyProduction: any,
  energyConsumption: any,
  financialAnalysis: any,
  params: AdvancedSolarParams,
) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return months.map((month, index) => {
    const production = Math.round(energyProduction.monthlyProduction[index])
    const consumption = Math.round(energyConsumption.monthlyConsumption[index])
    const netUsage = Math.max(0, consumption - production)
    const billWithSolar = netUsage * params.electricityRate
    const billWithoutSolar = consumption * params.electricityRate
    const savings = billWithoutSolar - billWithSolar

    return {
      month,
      production,
      consumption,
      netUsage,
      billWithSolar,
      billWithoutSolar,
      savings,
    }
  })
}

function calculateNPV(cashFlows: number[], discountRate: number): number {
  return cashFlows.reduce((npv, cashFlow, index) => {
    return npv + cashFlow / Math.pow(1 + discountRate, index)
  }, 0)
}

function calculateIRR(cashFlows: number[]): number {
  // Simple IRR calculation using Newton-Raphson method
  let rate = 0.1 // Initial guess
  const tolerance = 0.0001
  const maxIterations = 100

  for (let i = 0; i < maxIterations; i++) {
    const npv = calculateNPV(cashFlows, rate)
    const derivative = cashFlows.reduce((sum, cashFlow, index) => {
      return sum - (index * cashFlow) / Math.pow(1 + rate, index + 1)
    }, 0)

    const newRate = rate - npv / derivative

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100 // Return as percentage
    }

    rate = newRate
  }

  return rate * 100 // Return as percentage
}

// Export for use in other modules
export { saveAdvancedCalculation }
