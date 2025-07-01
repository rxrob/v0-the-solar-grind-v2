import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, monthlyBill, roofArea } = body

    // Basic solar calculation logic
    const averageSunHours = 5.5 // Average daily sun hours
    const systemEfficiency = 0.85
    const panelWattage = 400
    const costPerWatt = 3.5

    // Calculate system size based on monthly bill
    const annualUsage = (monthlyBill / 0.12) * 12 // Assuming $0.12/kWh
    const systemSize = annualUsage / (averageSunHours * 365 * systemEfficiency)

    // Calculate other metrics
    const panelCount = Math.ceil((systemSize * 1000) / panelWattage)
    const totalCost = systemSize * 1000 * costPerWatt
    const annualProduction = systemSize * averageSunHours * 365 * systemEfficiency
    const monthlyBillOffset = (annualProduction / 12) * 0.12
    const paybackPeriod = totalCost / (monthlyBillOffset * 12)
    const co2Offset = annualProduction * 0.0007 // tons of CO2 per kWh

    const result = {
      systemSize: Math.round(systemSize * 100) / 100,
      annualProduction: Math.round(annualProduction),
      monthlyBillOffset: Math.round(monthlyBillOffset * 100) / 100,
      totalCost: Math.round(totalCost),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Offset: Math.round(co2Offset * 100) / 100,
      roofArea: roofArea || 1000,
      panelCount,
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Solar calculation error:", error)
    return NextResponse.json({ success: false, error: "Failed to calculate solar metrics" }, { status: 500 })
  }
}
