import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import jsPDF from "jspdf"

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
      propertyAddress,
      systemSize,
      annualProduction,
      annualSavings,
      paybackPeriod,
      co2Reduction,
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !propertyAddress) {
      return NextResponse.json(
        {
          error: "Missing required fields: customerName, customerEmail, propertyAddress",
        },
        { status: 400 },
      )
    }

    // Create PDF
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(40, 116, 166)
    doc.text("Solar Analysis Report", 20, 30)

    // Customer Information
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text("Customer Information", 20, 50)
    doc.setFontSize(12)
    doc.text(`Name: ${customerName}`, 20, 65)
    doc.text(`Email: ${customerEmail}`, 20, 75)
    doc.text(`Property: ${propertyAddress}`, 20, 85)

    // System Details
    doc.setFontSize(14)
    doc.text("System Analysis", 20, 110)
    doc.setFontSize(12)
    doc.text(`System Size: ${systemSize} kW`, 20, 125)
    doc.text(`Annual Production: ${annualProduction} kWh`, 20, 135)
    doc.text(`Annual Savings: $${annualSavings}`, 20, 145)
    doc.text(`Payback Period: ${paybackPeriod} years`, 20, 155)
    doc.text(`CO2 Reduction: ${co2Reduction} tons/year`, 20, 165)

    // Financial Summary
    doc.setFontSize(14)
    doc.text("Financial Summary", 20, 190)
    doc.setFontSize(12)
    doc.text(`Monthly Savings: $${Math.round(Number.parseFloat(annualSavings) / 12)}`, 20, 205)
    doc.text(`25-Year Savings: $${Math.round(Number.parseFloat(annualSavings) * 25)}`, 20, 215)

    // Environmental Impact
    doc.setFontSize(14)
    doc.text("Environmental Impact", 20, 240)
    doc.setFontSize(12)
    doc.text(`Trees Equivalent: ${Math.round(Number.parseFloat(co2Reduction) * 16)} trees`, 20, 255)
    doc.text(`Cars Off Road: ${Math.round(Number.parseFloat(co2Reduction) / 4.6)} cars`, 20, 265)

    // Footer
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 280)
    doc.text("The Solar Grind V2 - Professional Solar Analysis", 20, 290)

    // Convert to base64
    const pdfBase64 = doc.output("datauristring")

    // Save report to database
    const reportData = {
      customerName,
      customerEmail,
      propertyAddress,
      systemSize: Number.parseFloat(systemSize) || 0,
      annualProduction: Number.parseFloat(annualProduction) || 0,
      annualSavings: Number.parseFloat(annualSavings) || 0,
      paybackPeriod: Number.parseFloat(paybackPeriod) || 0,
      co2Reduction: Number.parseFloat(co2Reduction) || 0,
      generatedAt: new Date().toISOString(),
      reportId: `PDF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    const { data: savedReport, error: saveError } = await supabase
      .from("solar_calculations")
      .insert({
        user_id: user.id,
        address: propertyAddress,
        monthly_bill: 0, // Not provided for PDF generation
        system_size: reportData.systemSize,
        annual_production: reportData.annualProduction,
        annual_savings: reportData.annualSavings,
        payback_period: reportData.paybackPeriod,
        calculation_type: "pdf_report",
        report_data: reportData,
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving PDF report:", saveError)
      // Continue without saving if there's an error
    }

    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      reportData,
      savedReport: savedReport || null,
    })
  } catch (error) {
    console.error("Error generating PDF report:", error)
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 })
  }
}
