import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { generateSolarReport } from "@/lib/report-generator"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerName,
      customerEmail,
      customerPhone,
      propertyAddress,
      monthlyBill,
      systemSize,
      annualProduction,
      annualSavings,
      paybackPeriod,
      co2Reduction,
      installationCost,
      incentives,
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !propertyAddress || !monthlyBill) {
      return NextResponse.json(
        {
          error: "Missing required fields: customerName, customerEmail, propertyAddress, monthlyBill",
        },
        { status: 400 },
      )
    }

    // Generate the report
    const reportData = {
      customerName,
      customerEmail,
      customerPhone,
      propertyAddress,
      monthlyBill: Number.parseFloat(monthlyBill),
      systemSize: Number.parseFloat(systemSize) || 0,
      annualProduction: Number.parseFloat(annualProduction) || 0,
      annualSavings: Number.parseFloat(annualSavings) || 0,
      paybackPeriod: Number.parseFloat(paybackPeriod) || 0,
      co2Reduction: Number.parseFloat(co2Reduction) || 0,
      installationCost: Number.parseFloat(installationCost) || 0,
      incentives: Number.parseFloat(incentives) || 0,
      generatedAt: new Date().toISOString(),
      reportId: `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    const htmlReport = generateSolarReport(reportData)

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from("solar_calculations")
      .insert({
        user_id: user.id,
        address: propertyAddress,
        monthly_bill: reportData.monthlyBill,
        system_size: reportData.systemSize,
        annual_production: reportData.annualProduction,
        annual_savings: reportData.annualSavings,
        payback_period: reportData.paybackPeriod,
        calculation_type: "report_generation",
        report_data: reportData,
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving report:", saveError)
      // Continue without saving if there's an error
    }

    return NextResponse.json({
      success: true,
      report: htmlReport,
      reportData,
      savedReport: savedReport || null,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
