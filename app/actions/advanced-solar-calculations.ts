"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { cookies } from "next/headers"

interface AdvancedSolarParams {
  address: string
  lat: number
  lng: number
  systemSize: number
  panelType: string
  inverterType: string
  roofType: string
  shading: string
  tilt: number
  azimuth: number
  annualUsage: number
  electricityRate: number
  netMeteringRate: number
  installationCost: number
  incentives: number
  financingOption: string
  loanTerm: number
  loanRate: number
  degradationRate: number
  maintenanceCost: number
  insuranceCost: number
  propertyTaxRate: number
}

interface AdvancedSolarResults {
  systemDetails: {
    systemSize: number
    panelCount: number
    panelType: string
    inverterType: string
    roofType: string
    tilt: number
    azimuth: number
    shading: string
  }
  energyProduction: {
    annualProduction: number
    monthlyProduction: number[]
    dailyAverage: number
    peakProduction: number
    capacityFactor: number
    performanceRatio: number
  }
  energyConsumption: {
    annualUsage: number
    monthlyConsumption: number[]
    netUsage: number[]
    excessProduction: number[]
  }
  financialAnalysis: {
    totalSystemCost: number
    netSystemCost: number
    annualSavings: number
    monthlySavings: number[]
    paybackPeriod: number
    roi25Year: number
    netPresentValue: number
    levelizedCostOfEnergy: number
    totalSavings25Year: number
  }
  environmentalImpact: {
    co2OffsetAnnual: number
    co2Offset25Year: number
    treesEquivalent: number
    coalOffset: number
  }
  weatherData: {
    sunHours: number
    irradiance: number
    temperature: number
    weatherAdjustment: number
  }
  recommendations: string[]
  warnings: string[]
}

async function fetchNRELData(lat: number, lng: number, systemSize: number, tilt: number, azimuth: number) {
  try {
    const nrelApiKey = process.env.NREL_API_KEY
    if (!nrelApiKey) {
      throw new Error("NREL API key not configured")
    }

    // Fetch PVWatts data
    const pvwattsUrl = `https://developer.nrel.gov/api/pvwatts/v6.json?api_key=${nrelApiKey}&lat=${lat}&lon=${lng}&system_capacity=${systemSize}&azimuth=${azimuth}&tilt=${tilt}&array_type=1&module_type=1&losses=14`

    const pvwattsResponse = await fetch(pvwattsUrl)
    if (!pvwattsResponse.ok) {
      throw new Error(`NREL PVWatts API error: ${pvwattsResponse.status}`)
    }

    const pvwattsData = await pvwattsResponse.json()

    // Fetch solar resource data
    const solarUrl = `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${nrelApiKey}&lat=${lat}&lon=${lng}`

    const solarResponse = await fetch(solarUrl)
    if (!solarResponse.ok) {
      throw new Error(`NREL Solar Resource API error: ${solarResponse.status}`)
    }

    const solarData = await solarResponse.json()

    return {
      pvwatts: pvwattsData,
      solar: solarData,
    }
  } catch (error) {
    console.error("NREL API error:", error)
    // Return fallback data
    return {
      pvwatts: {
        outputs: {
          ac_annual: systemSize * 1400, // Fallback: 1400 kWh per kW
          ac_monthly: Array(12).fill((systemSize * 1400) / 12),
          capacity_factor: 16.5,
          performance_ratio: 0.85,
        },
      },
      solar: {
        outputs: {
          avg_dni: { annual: 5.5 },
          avg_ghi: { annual: 4.8 },
          avg_lat_tilt: { annual: 5.2 },
        },
      },
    }
  }
}

async function saveAdvancedCalculation(userEmail: string, params: AdvancedSolarParams, results: AdvancedSolarResults) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const { error } = await supabase.from("solar_calculations").insert({
      user_email: userEmail,
      calculation_type: "advanced",
      input_data: params,
      results: results,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving calculation:", error)
    }
  } catch (error) {
    console.error("Error saving calculation:", error)
  }
}

export async function performAdvancedSolarCalculation(params: AdvancedSolarParams): Promise<AdvancedSolarResults> {
  try {
    // Get current user
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Fetch NREL data
    const nrelData = await fetchNRELData(params.lat, params.lng, params.systemSize, params.tilt, params.azimuth)

    // Extract data from NREL response
    const annualProduction = nrelData.pvwatts.outputs.ac_annual || params.systemSize * 1400
    const monthlyProductionRaw = nrelData.pvwatts.outputs.ac_monthly || Array(12).fill(annualProduction / 12)
    const capacityFactor = nrelData.pvwatts.outputs.capacity_factor || 16.5
    const performanceRatio = nrelData.pvwatts.outputs.performance_ratio || 0.85

    // Calculate system details
    const panelWattage =
      params.panelType === "monocrystalline" ? 400 : params.panelType === "polycrystalline" ? 350 : 300
    const panelCount = Math.ceil((params.systemSize * 1000) / panelWattage)

    // Apply shading and orientation adjustments
    let shadingFactor = 1.0
    switch (params.shading) {
      case "heavy":
        shadingFactor = 0.7
        break
      case "moderate":
        shadingFactor = 0.85
        break
      case "light":
        shadingFactor = 0.95
        break
      default:
        shadingFactor = 1.0
    }

    // Orientation adjustment
    let orientationFactor = 1.0
    if (params.azimuth >= 135 && params.azimuth <= 225) {
      orientationFactor = 1.0 // South-facing
    } else if (params.azimuth >= 90 && params.azimuth <= 270) {
      orientationFactor = 0.9 // East/West-facing
    } else {
      orientationFactor = 0.7 // North-facing
    }

    // Tilt adjustment
    let tiltFactor = 1.0
    const optimalTilt = Math.abs(params.lat)
    const tiltDifference = Math.abs(params.tilt - optimalTilt)
    if (tiltDifference <= 15) {
      tiltFactor = 1.0
    } else if (tiltDifference <= 30) {
      tiltFactor = 0.95
    } else {
      tiltFactor = 0.85
    }

    // Apply all adjustment factors
    const adjustedAnnualProduction = annualProduction * shadingFactor * orientationFactor * tiltFactor

    // Calculate monthly production with adjustments
    const monthlyConsumption: number[] = []
    const seasonalFactors = [1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 1.2, 1.3, 1.1, 0.9, 1.0, 1.1]
    const avgMonthlyUsage = params.annualUsage / 12

    for (let i = 0; i < 12; i++) {
      monthlyConsumption.push(avgMonthlyUsage * seasonalFactors[i])
    }

    const monthlyProduction: number[] = monthlyProductionRaw.map((production: number, index: number) => {
      return production * shadingFactor * orientationFactor * tiltFactor * seasonalFactors[index]
    })

    // Calculate net usage and excess production
    const netUsage = monthlyConsumption.map((consumption, index) => {
      return Math.max(0, consumption - monthlyProduction[index])
    })

    const excessProduction = monthlyProduction.map((production, index) => {
      return Math.max(0, production - monthlyConsumption[index])
    })

    // Financial calculations
    const totalSystemCost = params.installationCost
    const netSystemCost = totalSystemCost - params.incentives

    // Calculate monthly savings
    const monthlySavings = monthlyProduction.map((production: number, index: number) => {
      const consumptionOffset = Math.min(production, monthlyConsumption[index])
      const excessCredit = Math.max(0, production - monthlyConsumption[index]) * params.netMeteringRate
      return consumptionOffset * params.electricityRate + excessCredit
    })

    const annualSavings = monthlySavings.reduce((sum, saving) => sum + saving, 0)

    // Financing calculations
    let monthlyPayment = 0
    if (params.financingOption === "loan") {
      const monthlyRate = params.loanRate / 100 / 12
      const numPayments = params.loanTerm * 12
      monthlyPayment =
        (netSystemCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
    }

    // Calculate payback period
    const netAnnualSavings = annualSavings - (params.maintenanceCost + params.insuranceCost)
    const paybackPeriod =
      params.financingOption === "cash"
        ? netSystemCost / netAnnualSavings
        : netSystemCost / (netAnnualSavings - monthlyPayment * 12)

    // 25-year analysis
    const years = 25
    let totalSavings25Year = 0
    let npvCalculation = 0
    const discountRate = 0.06 // 6% discount rate

    for (let year = 1; year <= years; year++) {
      const degradationFactor = Math.pow(1 - params.degradationRate / 100, year - 1)
      const yearlyProduction = adjustedAnnualProduction * degradationFactor
      const yearlySavings = yearlyProduction * params.electricityRate - params.maintenanceCost - params.insuranceCost

      totalSavings25Year += yearlySavings
      npvCalculation += yearlySavings / Math.pow(1 + discountRate, year)
    }

    const netPresentValue = npvCalculation - netSystemCost
    const roi25Year = ((totalSavings25Year - netSystemCost) / netSystemCost) * 100

    // LCOE calculation
    const totalEnergyProduced25Year = Array.from(
      { length: years },
      (_, year) => adjustedAnnualProduction * Math.pow(1 - params.degradationRate / 100, year),
    ).reduce((sum, production) => sum + production, 0)

    const levelizedCostOfEnergy = netSystemCost / totalEnergyProduced25Year

    // Environmental impact
    const co2OffsetAnnual = adjustedAnnualProduction * 0.0004 // 0.4 kg CO2 per kWh
    const co2Offset25Year = co2OffsetAnnual * years * (1 - ((params.degradationRate / 100) * years) / 2)
    const treesEquivalent = co2Offset25Year / 21 // 21 kg CO2 per tree per year
    const coalOffset = co2Offset25Year / 820 // 820 kg CO2 per ton of coal

    // Weather data
    const sunHours = nrelData.solar.outputs?.avg_ghi?.annual || 5.0
    const irradiance = nrelData.solar.outputs?.avg_dni?.annual || 5.5
    const temperature = 25 // Default temperature
    const weatherAdjustment = capacityFactor / 20 // Normalize to percentage

    // Generate recommendations
    const recommendations: string[] = []
    const warnings: string[] = []

    if (params.tilt < optimalTilt - 15 || params.tilt > optimalTilt + 15) {
      recommendations.push(`Consider adjusting tilt angle to ${Math.round(optimalTilt)}° for optimal performance`)
    }

    if (params.azimuth < 135 || params.azimuth > 225) {
      recommendations.push("Consider south-facing orientation for maximum energy production")
    }

    if (params.shading !== "none") {
      recommendations.push("Consider tree trimming or system relocation to reduce shading impact")
    }

    if (paybackPeriod > 15) {
      warnings.push(
        "Payback period exceeds 15 years - consider reducing system size or exploring additional incentives",
      )
    }

    if (params.systemSize > params.annualUsage / 1200) {
      warnings.push("System may be oversized for your energy usage - consider reducing capacity")
    }

    const results: AdvancedSolarResults = {
      systemDetails: {
        systemSize: params.systemSize,
        panelCount,
        panelType: params.panelType,
        inverterType: params.inverterType,
        roofType: params.roofType,
        tilt: params.tilt,
        azimuth: params.azimuth,
        shading: params.shading,
      },
      energyProduction: {
        annualProduction: Math.round(adjustedAnnualProduction),
        monthlyProduction: monthlyProduction.map((p: number) => Math.round(p)),
        dailyAverage: Math.round(adjustedAnnualProduction / 365),
        peakProduction: Math.round(params.systemSize * 5), // Assuming 5 hours peak sun
        capacityFactor: Math.round(capacityFactor * 10) / 10,
        performanceRatio: Math.round(performanceRatio * 100) / 100,
      },
      energyConsumption: {
        annualUsage: params.annualUsage,
        monthlyConsumption: monthlyConsumption.map((c: number) => Math.round(c)),
        netUsage: netUsage.map((u: number) => Math.round(u)),
        excessProduction: excessProduction.map((e: number) => Math.round(e)),
      },
      financialAnalysis: {
        totalSystemCost,
        netSystemCost,
        annualSavings: Math.round(annualSavings),
        monthlySavings: monthlySavings.map((s: number) => Math.round(s)),
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        roi25Year: Math.round(roi25Year * 10) / 10,
        netPresentValue: Math.round(netPresentValue),
        levelizedCostOfEnergy: Math.round(levelizedCostOfEnergy * 1000) / 1000,
        totalSavings25Year: Math.round(totalSavings25Year),
      },
      environmentalImpact: {
        co2OffsetAnnual: Math.round(co2OffsetAnnual),
        co2Offset25Year: Math.round(co2Offset25Year),
        treesEquivalent: Math.round(treesEquivalent),
        coalOffset: Math.round(coalOffset * 10) / 10,
      },
      weatherData: {
        sunHours: Math.round(sunHours * 10) / 10,
        irradiance: Math.round(irradiance * 10) / 10,
        temperature,
        weatherAdjustment: Math.round(weatherAdjustment * 10) / 10,
      },
      recommendations,
      warnings,
    }

    // Save calculation to database if user is authenticated
    if (user?.email) {
      await saveAdvancedCalculation(user.email, params, results)
    }

    return results
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    throw new Error("Failed to perform advanced solar calculation")
  }
}
