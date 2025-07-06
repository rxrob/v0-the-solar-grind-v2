"use server"

import { createServerClient } from "@/lib/supabase-server-client"
import { getCurrentUserReal } from "./auth-real"

interface SolarCalculationParams {
  address: string
  lat: number
  lng: number
  annualUsage: number
  roofArea: number
  roofTilt: number
  roofAzimuth: number
  shadingFactor: number
  systemSize: number
  panelWattage: number
  panelEfficiency: number
  inverterEfficiency: number
  electricityRate: number
  netMeteringRate: number
  installationCost: number
  incentives: number
  degradationRate: number
  analysisYears: number
}

interface AdvancedSolarResults {
  systemSpecs: {
    totalCapacity: number
    numberOfPanels: number
    estimatedArea: number
    inverterSize: number
  }
  energyProduction: {
    annualProduction: number
    monthlyProduction: number[]
    dailyAverage: number
    peakProduction: number
  }
  financialAnalysis: {
    totalCost: number
    netCost: number
    annualSavings: number
    paybackPeriod: number
    roi25Year: number
    netPresentValue: number
    levelizedCostOfEnergy: number
  }
  environmentalImpact: {
    co2OffsetAnnual: number
    co2Offset25Year: number
    treesEquivalent: number
    carsOffRoadEquivalent: number
  }
  monthlyAnalysis: {
    month: string
    production: number
    consumption: number
    netUsage: number
    savings: number
    gridExport: number
  }[]
  performanceMetrics: {
    capacityFactor: number
    performanceRatio: number
    specificYield: number
    energyYield: number
  }
  weatherData: {
    averageSunHours: number
    peakSunHours: number
    temperatureCoefficient: number
    weatherAdjustment: number
  }
}

async function fetchNRELData(lat: number, lng: number) {
  try {
    const response = await fetch(
      `https://developer.nrel.gov/api/solar/solar_resource/v1.json?api_key=${process.env.NREL_API_KEY}&lat=${lat}&lon=${lng}`,
    )

    if (!response.ok) {
      throw new Error(`NREL API error: ${response.status}`)
    }

    const data = await response.json()
    return data.outputs
  } catch (error) {
    console.error("Error fetching NREL data:", error)
    // Return default values if API fails
    return {
      avg_dni: { annual: 5.5 },
      avg_ghi: { annual: 4.5 },
      avg_lat_tilt: { annual: 5.0 },
    }
  }
}

async function fetchPVWattsData(params: SolarCalculationParams) {
  try {
    const pvWattsUrl = new URL("https://developer.nrel.gov/api/pvwatts/v8.json")
    pvWattsUrl.searchParams.set("api_key", process.env.NREL_API_KEY || "")
    pvWattsUrl.searchParams.set("lat", params.lat.toString())
    pvWattsUrl.searchParams.set("lon", params.lng.toString())
    pvWattsUrl.searchParams.set("system_capacity", params.systemSize.toString())
    pvWattsUrl.searchParams.set("azimuth", params.roofAzimuth.toString())
    pvWattsUrl.searchParams.set("tilt", params.roofTilt.toString())
    pvWattsUrl.searchParams.set("array_type", "1")
    pvWattsUrl.searchParams.set("module_type", "1")
    pvWattsUrl.searchParams.set("losses", "14")

    const response = await fetch(pvWattsUrl.toString())

    if (!response.ok) {
      throw new Error(`PVWatts API error: ${response.status}`)
    }

    const data = await response.json()
    return data.outputs
  } catch (error) {
    console.error("Error fetching PVWatts data:", error)
    // Return estimated values if API fails
    const estimatedAnnual = params.systemSize * 1400 // kWh per kW per year (conservative estimate)
    const monthlyEstimate = estimatedAnnual / 12
    return {
      ac_annual: estimatedAnnual,
      ac_monthly: Array(12).fill(monthlyEstimate),
      capacity_factor: 16.5,
      kwh_per_kw: 1400,
    }
  }
}

async function saveAdvancedCalculation(
  userEmail: string,
  params: SolarCalculationParams,
  results: AdvancedSolarResults,
) {
  try {
    const supabase = await createServerClient()

    const { error } = await supabase.from("solar_calculations").insert({
      user_email: userEmail,
      calculation_type: "advanced",
      input_params: params,
      results: results,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving calculation:", error)
    }
  } catch (error) {
    console.error("Error saving advanced calculation:", error)
  }
}

export async function performAdvancedSolarCalculation(params: SolarCalculationParams): Promise<AdvancedSolarResults> {
  try {
    // Get current user
    const user = await getCurrentUserReal()

    // Fetch NREL solar resource data
    const nrelData = await fetchNRELData(params.lat, params.lng)

    // Fetch PVWatts production data
    const pvWattsData = await fetchPVWattsData(params)

    // System specifications
    const numberOfPanels = Math.floor((params.systemSize * 1000) / params.panelWattage)
    const estimatedArea = numberOfPanels * 20 // Assume 20 sq ft per panel
    const inverterSize = params.systemSize * 0.8 // 80% of DC capacity

    // Energy production calculations
    const annualProduction = pvWattsData.ac_annual || params.systemSize * 1400
    const monthlyProduction = pvWattsData.ac_monthly || Array(12).fill(annualProduction / 12)
    const dailyAverage = annualProduction / 365
    const peakProduction = params.systemSize * 0.85 // 85% of rated capacity

    // Calculate monthly consumption (distribute annual usage)
    const monthlyConsumption: number[] = []
    const seasonalFactors = [1.1, 1.0, 0.9, 0.8, 0.7, 0.8, 1.2, 1.3, 1.1, 0.9, 1.0, 1.1]
    const avgMonthlyUsage = params.annualUsage / 12

    for (let i = 0; i < 12; i++) {
      monthlyConsumption.push(avgMonthlyUsage * seasonalFactors[i])
    }

    // Financial calculations
    const totalCost = params.installationCost
    const netCost = totalCost - params.incentives
    const annualSavings = annualProduction * params.electricityRate
    const paybackPeriod = netCost / annualSavings

    // 25-year financial analysis
    const analysisYears = params.analysisYears || 25
    let totalSavings = 0
    let currentProduction = annualProduction

    for (let year = 1; year <= analysisYears; year++) {
      const yearlyProduction = currentProduction * (1 - params.degradationRate / 100)
      const yearlySavings = yearlyProduction * params.electricityRate * Math.pow(1.03, year - 1) // 3% electricity rate increase
      totalSavings += yearlySavings
      currentProduction = yearlyProduction
    }

    const roi25Year = ((totalSavings - netCost) / netCost) * 100
    const discountRate = 0.06 // 6% discount rate
    let npv = -netCost

    for (let year = 1; year <= analysisYears; year++) {
      const yearlyProduction = annualProduction * Math.pow(1 - params.degradationRate / 100, year - 1)
      const yearlySavings = yearlyProduction * params.electricityRate * Math.pow(1.03, year - 1)
      npv += yearlySavings / Math.pow(1 + discountRate, year)
    }

    const levelizedCostOfEnergy = netCost / (annualProduction * analysisYears)

    // Environmental impact
    const co2OffsetAnnual = annualProduction * 0.0007 // metric tons CO2 per kWh
    const co2Offset25Year = co2OffsetAnnual * analysisYears
    const treesEquivalent = co2Offset25Year * 16 // trees planted equivalent
    const carsOffRoadEquivalent = co2Offset25Year / 4.6 // cars off road for a year

    // Monthly analysis
    const monthNames = [
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

    const monthlyAnalysis = monthNames.map((month, index) => {
      const production = monthlyProduction[index] || 0
      const consumption = monthlyConsumption[index] || 0
      const netUsage = consumption - production
      const savings = Math.min(production, consumption) * params.electricityRate
      const gridExport = Math.max(0, production - consumption)

      return {
        month,
        production: Math.round(production),
        consumption: Math.round(consumption),
        netUsage: Math.round(netUsage),
        savings: Math.round(savings * 100) / 100,
        gridExport: Math.round(gridExport),
      }
    })

    // Performance metrics
    const capacityFactor = (annualProduction / (params.systemSize * 8760)) * 100
    const performanceRatio = (capacityFactor / (nrelData.avg_ghi?.annual || 4.5)) * 100
    const specificYield = annualProduction / params.systemSize
    const energyYield = annualProduction

    // Weather data
    const averageSunHours = nrelData.avg_ghi?.annual || 4.5
    const peakSunHours = nrelData.avg_dni?.annual || 5.5
    const temperatureCoefficient = -0.4 // %/°C for typical silicon panels
    const weatherAdjustment = params.shadingFactor

    const results: AdvancedSolarResults = {
      systemSpecs: {
        totalCapacity: params.systemSize,
        numberOfPanels,
        estimatedArea,
        inverterSize: Math.round(inverterSize * 100) / 100,
      },
      energyProduction: {
        annualProduction: Math.round(annualProduction),
        monthlyProduction: monthlyProduction.map((p) => Math.round(p)),
        dailyAverage: Math.round(dailyAverage * 100) / 100,
        peakProduction: Math.round(peakProduction * 100) / 100,
      },
      financialAnalysis: {
        totalCost,
        netCost,
        annualSavings: Math.round(annualSavings),
        paybackPeriod: Math.round(paybackPeriod * 100) / 100,
        roi25Year: Math.round(roi25Year * 100) / 100,
        netPresentValue: Math.round(npv),
        levelizedCostOfEnergy: Math.round(levelizedCostOfEnergy * 1000) / 1000,
      },
      environmentalImpact: {
        co2OffsetAnnual: Math.round(co2OffsetAnnual * 100) / 100,
        co2Offset25Year: Math.round(co2Offset25Year * 100) / 100,
        treesEquivalent: Math.round(treesEquivalent),
        carsOffRoadEquivalent: Math.round(carsOffRoadEquivalent * 100) / 100,
      },
      monthlyAnalysis,
      performanceMetrics: {
        capacityFactor: Math.round(capacityFactor * 100) / 100,
        performanceRatio: Math.round(performanceRatio * 100) / 100,
        specificYield: Math.round(specificYield),
        energyYield: Math.round(energyYield),
      },
      weatherData: {
        averageSunHours: Math.round(averageSunHours * 100) / 100,
        peakSunHours: Math.round(peakSunHours * 100) / 100,
        temperatureCoefficient,
        weatherAdjustment,
      },
    }

    // Save calculation to database if user is logged in
    if (user && user.email) {
      await saveAdvancedCalculation(user.email, params, results)
    }

    return results
  } catch (error) {
    console.error("Advanced solar calculation error:", error)
    throw new Error("Failed to perform advanced solar calculation")
  }
}
