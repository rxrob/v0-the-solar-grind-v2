"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

interface BasicSolarInput {
  address: string
  monthlyBill: number
  roofArea: number
  electricityRate?: number
  customerName?: string
  customerEmail?: string
  customerPhone?: string
}

interface BasicSolarResult {
  success: boolean
  error?: string
  data?: {
    systemSize: number
    annualProduction: number
    monthlySavings: number
    annualSavings: number
    paybackPeriod: number
    co2Offset: number
    numberOfPanels: number
    roofCoverage: number
    installationCost: number
    twentyYearSavings: number
    federalTaxCredit: number
    netCost: number
    monthlyPayment: number
    peakSunHours: number
  }
}

export async function calculateBasicSolarSystem(input: BasicSolarInput): Promise<BasicSolarResult> {
  try {
    // Basic solar calculation logic
    const electricityRate = input.electricityRate || 0.12 // $0.12 per kWh default
    const systemEfficiency = 0.85 // 85% efficiency
    const panelWattage = 400 // 400W panels
    const costPerWatt = 3.5 // $3.50 per watt installed
    const peakSunHours = 5.5 // Average peak sun hours
    const federalTaxCreditRate = 0.3 // 30% federal tax credit

    // Calculate annual electricity consumption
    const annualConsumption = (input.monthlyBill / electricityRate) * 12 // kWh per year

    // Calculate required system size
    const systemSize = annualConsumption / (peakSunHours * 365 * systemEfficiency) // kW

    // Calculate number of panels needed
    const numberOfPanels = Math.ceil((systemSize * 1000) / panelWattage)

    // Calculate actual system size based on panels
    const actualSystemSize = (numberOfPanels * panelWattage) / 1000 // kW

    // Calculate annual production
    const annualProduction = actualSystemSize * peakSunHours * 365 * systemEfficiency // kWh

    // Calculate savings
    const annualSavings = annualProduction * electricityRate
    const monthlySavings = annualSavings / 12

    // Calculate installation cost
    const installationCost = actualSystemSize * 1000 * costPerWatt

    // Calculate federal tax credit
    const federalTaxCredit = installationCost * federalTaxCreditRate

    // Calculate net cost after tax credit
    const netCost = installationCost - federalTaxCredit

    // Calculate payback period
    const paybackPeriod = netCost / annualSavings

    // Calculate 20-year savings
    const twentyYearSavings = annualSavings * 20 - netCost

    // Calculate monthly payment (assuming 20-year loan at 4.5% APR)
    const loanTerm = 20 * 12 // 20 years in months
    const monthlyRate = 0.045 / 12 // 4.5% APR monthly
    const monthlyPayment =
      (netCost * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))) / (Math.pow(1 + monthlyRate, loanTerm) - 1)

    // Calculate CO2 offset (pounds per year)
    const co2Offset = annualProduction * 0.92 // 0.92 lbs CO2 per kWh

    // Calculate roof coverage
    const panelArea = numberOfPanels * 21.5 // 21.5 sq ft per panel
    const roofCoverage = (panelArea / input.roofArea) * 100

    const result = {
      systemSize: Math.round(actualSystemSize * 100) / 100,
      annualProduction: Math.round(annualProduction),
      monthlySavings: Math.round(monthlySavings * 100) / 100,
      annualSavings: Math.round(annualSavings * 100) / 100,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Offset: Math.round(co2Offset),
      numberOfPanels,
      roofCoverage: Math.round(roofCoverage * 10) / 10,
      installationCost: Math.round(installationCost),
      twentyYearSavings: Math.round(twentyYearSavings),
      federalTaxCredit: Math.round(federalTaxCredit),
      netCost: Math.round(netCost),
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      peakSunHours: Math.round(peakSunHours * 10) / 10,
    }

    // Save calculation to database if user is authenticated
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

      if (!userError && user) {
        await supabase.from("solar_calculations").insert({
          user_id: user.id,
          calculation_type: "basic",
          address: input.address,
          monthly_bill: input.monthlyBill,
          roof_area: input.roofArea,
          electricity_rate: electricityRate,
          system_size: result.systemSize,
          annual_production: result.annualProduction,
          annual_savings: result.annualSavings,
          installation_cost: result.installationCost,
          net_cost: result.netCost,
          payback_period: result.paybackPeriod,
          customer_name: input.customerName,
          customer_email: input.customerEmail,
          customer_phone: input.customerPhone,
          created_at: new Date().toISOString(),
        })
      }
    } catch (dbError) {
      console.error("Error saving basic calculation:", dbError)
      // Don't fail the calculation if database save fails
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    console.error("Basic solar calculation error:", error)
    return {
      success: false,
      error: "An error occurred during calculation",
    }
  }
}

export async function getBasicCalculationHistory() {
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
      .eq("calculation_type", "basic")
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Error fetching basic calculation history:", error)
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
    console.error("Error fetching basic calculation history:", error)
    return {
      success: false,
      error: "An error occurred while fetching calculation history",
    }
  }
}

// Add this export alias at the end of the file
export const calculateBasicSolar = calculateBasicSolarSystem
