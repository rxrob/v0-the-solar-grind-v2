"use server"

import type { CalculationResult } from "@/types"

export async function calculateSolar(
  address: string,
  monthlyBill: number,
  roofArea?: number,
): Promise<CalculationResult> {
  try {
    // Basic solar calculation logic
    const averageSunHours = 5.5
    const systemEfficiency = 0.85
    const panelWattage = 400
    const costPerWatt = 3.5

    const annualUsage = (monthlyBill / 0.12) * 12
    const systemSize = annualUsage / (averageSunHours * 365 * systemEfficiency)

    const panelCount = Math.ceil((systemSize * 1000) / panelWattage)
    const totalCost = systemSize * 1000 * costPerWatt
    const annualProduction = systemSize * averageSunHours * 365 * systemEfficiency
    const monthlyBillOffset = (annualProduction / 12) * 0.12
    const paybackPeriod = totalCost / (monthlyBillOffset * 12)
    const co2Offset = annualProduction * 0.0007

    return {
      systemSize: Math.round(systemSize * 100) / 100,
      annualProduction: Math.round(annualProduction),
      monthlyBillOffset: Math.round(monthlyBillOffset * 100) / 100,
      totalCost: Math.round(totalCost),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Offset: Math.round(co2Offset * 100) / 100,
      roofArea: roofArea || 1000,
      panelCount,
    }
  } catch (error) {
    console.error("Solar calculation error:", error)
    throw new Error("Failed to calculate solar metrics")
  }
}
