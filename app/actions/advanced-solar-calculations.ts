"use server"

import { getCurrentUserReal } from "./auth-real"

interface AdvancedSolarParams {
  address: string
  systemSize: number
  panelType: string
  inverterType: string
  roofType: string
  shading: string
  tilt: number
  azimuth: number
  electricityRate: number
  annualUsage: number
  installationCost: number
  incentives: number
  financingOption: string
  loanTerm?: number
  interestRate?: number
}

interface AdvancedSolarResults {
  basicResults: {
    annualProduction: number
    monthlyProduction: number[]
    dailyAverage: number
    peakProduction: number
    co2Offset: number
  }
  financialAnalysis: {
    totalSystemCost: number
    netSystemCost: number
    annualSavings: number
    paybackPeriod: number
    roi25Year: number
    netPresentValue: number
    monthlyPayment?: number
    totalInterest?: number
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
  yearlyProjection: {
    year: number
    production: number
    degradation: number
    savings: number
    cumulativeSavings: number
  }[]
  environmentalImpact: {
    co2OffsetAnnual: number
    co2Offset25Year: number
    treesEquivalent: number
    carsOffRoadEquivalent: number
  }
  recommendations: string[]
}

export async function performAdvancedSolarCalculation(params: AdvancedSolarParams): Promise<AdvancedSolarResults> {
  try {
    // Get current user for tracking
    const user = await getCurrentUserReal()

    // Panel efficiency factors
    const panelEfficiencyMap = {
      monocrystalline: 0.22,
      polycrystalline: 0.18,
      "thin-film": 0.12,
    }

    // Inverter efficiency factors
    const inverterEfficiencyMap = {
      "string-inverter": 0.95,
      "power-optimizer": 0.97,
      "micro-inverter": 0.96,
    }

    // Shading factors
    const shadingFactorMap = {
      none: 1.0,
      minimal: 0.95,
      moderate: 0.85,
      heavy: 0.7,
    }

    // Get location-specific data (simplified for demo)
    const locationData = await getLocationSolarData(params.address)

    // Calculate system specifications
    const panelEfficiency = panelEfficiencyMap[params.panelType as keyof typeof panelEfficiencyMap] || 0.2
    const inverterEfficiency = inverterEfficiencyMap[params.inverterType as keyof typeof inverterEfficiencyMap] || 0.95
    const shadingFactor = shadingFactorMap[params.shading as keyof typeof shadingFactorMap] || 0.9

    // Calculate tilt and azimuth factors
    const tiltFactor = calculateTiltFactor(params.tilt, locationData.latitude)
    const azimuthFactor = calculateAzimuthFactor(params.azimuth)

    // Calculate annual production
    const baseProduction = params.systemSize * locationData.averageSunHours * 365
    const adjustedProduction =
      baseProduction * panelEfficiency * inverterEfficiency * shadingFactor * tiltFactor * azimuthFactor

    // Calculate monthly production with seasonal variations
    const monthlyConsumption: number[] = []
    const seasonalFactors = [1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 1.2, 1.3, 1.1, 0.9, 1.0, 1.1]
    const avgMonthlyUsage = params.annualUsage / 12

    for (let i = 0; i < 12; i++) {
      monthlyConsumption.push(avgMonthlyUsage * seasonalFactors[i])
    }

    const monthlyProduction: number[] = []
    const monthlyProductionFactors = [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]

    for (let i = 0; i < 12; i++) {
      const monthlyProd = (adjustedProduction / 12) * monthlyProductionFactors[i]
      monthlyProduction.push(Math.round(monthlyProd))
    }

    // Calculate financial analysis
    const totalSystemCost = params.installationCost
    const netSystemCost = totalSystemCost - params.incentives
    const annualSavings = Math.min(
      adjustedProduction * params.electricityRate,
      params.annualUsage * params.electricityRate,
    )
    const paybackPeriod = netSystemCost / annualSavings

    // Calculate financing details if applicable
    let monthlyPayment = 0
    let totalInterest = 0

    if (params.financingOption === "loan" && params.loanTerm && params.interestRate) {
      const monthlyRate = params.interestRate / 100 / 12
      const numPayments = params.loanTerm * 12
      monthlyPayment =
        (netSystemCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
      totalInterest = monthlyPayment * numPayments - netSystemCost
    }

    // Calculate NPV and ROI
    const discountRate = 0.06 // 6% discount rate
    let npv = -netSystemCost
    for (let year = 1; year <= 25; year++) {
      const yearlyBenefit = annualSavings * Math.pow(0.995, year - 1) // 0.5% annual degradation
      npv += yearlyBenefit / Math.pow(1 + discountRate, year)
    }

    const roi25Year = ((npv + netSystemCost) / netSystemCost) * 100

    // Generate monthly breakdown
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthlyBreakdown = monthNames.map((month, index) => {
      const production = monthlyProduction[index]
      const consumption = monthlyConsumption[index]
      const netUsage = Math.max(0, consumption - production)
      const billWithSolar = netUsage * params.electricityRate
      const billWithoutSolar = consumption * params.electricityRate
      const savings = billWithoutSolar - billWithSolar

      return {
        month,
        production: Math.round(production),
        consumption: Math.round(consumption),
        netUsage: Math.round(netUsage),
        billWithSolar: Math.round(billWithSolar * 100) / 100,
        billWithoutSolar: Math.round(billWithoutSolar * 100) / 100,
        savings: Math.round(savings * 100) / 100,
      }
    })

    // Generate 25-year projection
    const yearlyProjection = []
    let cumulativeSavings = 0

    for (let year = 1; year <= 25; year++) {
      const degradationFactor = Math.pow(0.995, year - 1)
      const yearProduction = Math.round(adjustedProduction * degradationFactor)
      const yearSavings = Math.min(yearProduction * params.electricityRate, params.annualUsage * params.electricityRate)
      cumulativeSavings += yearSavings

      yearlyProjection.push({
        year,
        production: yearProduction,
        degradation: Math.round((1 - degradationFactor) * 100 * 10) / 10,
        savings: Math.round(yearSavings),
        cumulativeSavings: Math.round(cumulativeSavings),
      })
    }

    // Calculate environmental impact
    const co2OffsetAnnual = adjustedProduction * 0.0007 // metric tons CO2 per kWh
    const co2Offset25Year = co2OffsetAnnual * 25 * 0.9 // Account for degradation
    const treesEquivalent = Math.round(co2Offset25Year * 16) // Trees planted equivalent
    const carsOffRoadEquivalent = Math.round(co2Offset25Year / 4.6) // Cars off road for 1 year

    // Generate recommendations
    const recommendations = generateRecommendations(params, {
      paybackPeriod,
      roi25Year,
      shadingFactor,
      tiltFactor,
      azimuthFactor,
    })

    const results: AdvancedSolarResults = {
      basicResults: {
        annualProduction: Math.round(adjustedProduction),
        monthlyProduction: monthlyProduction.map((p: number) => Math.round(p)),
        dailyAverage: Math.round(adjustedProduction / 365),
        peakProduction: Math.round(params.systemSize * 1000), // Peak watts
        co2Offset: Math.round(co2OffsetAnnual * 1000) / 1000,
      },
      financialAnalysis: {
        totalSystemCost,
        netSystemCost,
        annualSavings: Math.round(annualSavings),
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        roi25Year: Math.round(roi25Year * 10) / 10,
        netPresentValue: Math.round(npv),
        monthlyPayment: monthlyPayment > 0 ? Math.round(monthlyPayment * 100) / 100 : undefined,
        totalInterest: totalInterest > 0 ? Math.round(totalInterest) : undefined,
      },
      monthlyBreakdown,
      yearlyProjection,
      environmentalImpact: {
        co2OffsetAnnual: Math.round(co2OffsetAnnual * 1000) / 1000,
        co2Offset25Year: Math.round(co2Offset25Year * 1000) / 1000,
        treesEquivalent,
        carsOffRoadEquivalent,
      },
      recommendations,
    }

    // Save calculation to database if user is authenticated
    if (user && user.email) {
      await saveAdvancedCalculation(user.email, params, results)
    }

    return results
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    throw new Error("Failed to perform advanced solar calculation")
  }
}

async function getLocationSolarData(address: string) {
  // Simplified location data - in production, this would call NREL API
  return {
    latitude: 40.7128,
    longitude: -74.006,
    averageSunHours: 4.5,
    peakSunHours: 5.2,
  }
}

function calculateTiltFactor(tilt: number, latitude: number): number {
  // Simplified tilt calculation
  const optimalTilt = latitude
  const tiltDifference = Math.abs(tilt - optimalTilt)

  if (tiltDifference <= 15) return 1.0
  if (tiltDifference <= 30) return 0.95
  if (tiltDifference <= 45) return 0.85
  return 0.75
}

function calculateAzimuthFactor(azimuth: number): number {
  // Optimal azimuth is 180 (south-facing)
  const azimuthDifference = Math.abs(azimuth - 180)

  if (azimuthDifference <= 15) return 1.0
  if (azimuthDifference <= 30) return 0.95
  if (azimuthDifference <= 45) return 0.9
  if (azimuthDifference <= 90) return 0.8
  return 0.6
}

function generateRecommendations(
  params: AdvancedSolarParams,
  analysis: {
    paybackPeriod: number
    roi25Year: number
    shadingFactor: number
    tiltFactor: number
    azimuthFactor: number
  },
): string[] {
  const recommendations: string[] = []

  if (analysis.paybackPeriod < 8) {
    recommendations.push("Excellent investment opportunity with quick payback period")
  } else if (analysis.paybackPeriod > 12) {
    recommendations.push("Consider increasing system size or exploring additional incentives")
  }

  if (analysis.roi25Year > 200) {
    recommendations.push("Outstanding long-term return on investment")
  }

  if (analysis.shadingFactor < 0.9) {
    recommendations.push("Consider tree trimming or panel relocation to reduce shading impact")
  }

  if (analysis.tiltFactor < 0.95) {
    recommendations.push("Optimize panel tilt angle for better performance")
  }

  if (analysis.azimuthFactor < 0.95) {
    recommendations.push("Consider south-facing orientation for optimal energy production")
  }

  if (params.panelType === "thin-film") {
    recommendations.push("Consider upgrading to monocrystalline panels for better efficiency")
  }

  if (params.inverterType === "string-inverter" && analysis.shadingFactor < 0.9) {
    recommendations.push("Consider power optimizers or micro-inverters for shaded installations")
  }

  return recommendations
}

async function saveAdvancedCalculation(userEmail: string, params: AdvancedSolarParams, results: AdvancedSolarResults) {
  try {
    // In production, this would save to database
    console.log("Saving advanced calculation for user:", userEmail)
    console.log("Calculation results:", {
      address: params.address,
      systemSize: params.systemSize,
      annualProduction: results.basicResults.annualProduction,
      annualSavings: results.financialAnalysis.annualSavings,
      paybackPeriod: results.financialAnalysis.paybackPeriod,
    })
  } catch (error) {
    console.error("Error saving advanced calculation:", error)
  }
}
