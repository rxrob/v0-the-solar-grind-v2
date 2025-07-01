import { type NextRequest, NextResponse } from "next/server"
import { generateStandardReport, generateEnhancedReport } from "@/lib/report-generator"
import { getCurrentUser } from "@/app/actions/auth"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { reportType, customerData, calculationData } = body

    if (!reportType || !customerData || !calculationData) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    let htmlReport: string

    if (reportType === "enhanced") {
      // Check if user has pro access
      if (user.subscription_tier !== "pro" && user.subscription_tier !== "enterprise") {
        return NextResponse.json({ error: "Enhanced reports require Pro subscription" }, { status: 403 })
      }
      htmlReport = generateEnhancedReport(customerData, calculationData)
    } else {
      htmlReport = generateStandardReport(customerData, calculationData)
    }

    return NextResponse.json({
      success: true,
      html: htmlReport,
      reportType,
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
