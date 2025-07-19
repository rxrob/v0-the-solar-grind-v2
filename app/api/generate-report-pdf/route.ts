import { NextResponse } from "next/server"
import chromium from "chrome-aws-lambda"

// This helper function generates the full HTML report on the server.
const generateReportHtml = (results: any, address: string, customerInfo: any, satelliteImages: any) => {
  const currentDate = new Date().toLocaleDateString()
  const currentDateTime = new Date().toLocaleString()

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || isNaN(amount)) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || isNaN(num)) return "0"
    return new Intl.NumberFormat("en-US").format(num)
  }

  const systemCost = results?.systemCost || 30000
  const federalTaxCredit = systemCost * 0.3
  const netSystemCost = systemCost - federalTaxCredit

  const calculateLoanPayment = (principal: number, apr: number, years: number) => {
    if (principal <= 0 || apr <= 0 || years <= 0) return 0
    const r = apr / 12
    const n = years * 12
    if (r === 0) return principal / n
    return (r * principal) / (1 - Math.pow(1 + r, -n))
  }

  const loanOptions = [
    {
      name: "3.99% APR Solar Loan (with 25% Dealer Fee)",
      apr: 0.0399,
      dealerFee: 0.25,
      termYears: 25,
      systemCost: netSystemCost,
      description: "Low monthly payment with dealer fee included - tax credit reduces loan amount",
    },
    {
      name: "7.99% APR Solar Loan (No Dealer Fee)",
      apr: 0.0799,
      dealerFee: 0,
      termYears: 25,
      systemCost: netSystemCost,
      description: "No dealer fee, clean loan - tax credit reduces loan amount",
    },
  ]

  const { propertyImageUrl, roofImageUrl } = satelliteImages

  const chartData = results?.yearlyProjections || []

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>MySolarAI Proposal - ${address}</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: white;
            -webkit-print-color-adjust: exact;
          }
          .page { 
            width: 8.5in;
            min-height: 11in;
            margin: 0 auto; 
            padding: 0.5in; 
            background: white;
            display: flex;
            flex-direction: column;
          }
          .header { 
            background: linear-gradient(135deg, #f59e0b, #3b82f6); 
            color: white; 
            padding: 40px; 
            text-align: center; 
            margin-bottom: 40px; 
            border-radius: 12px;
          }
          .header h1 { 
            font-size: 36px; 
            margin-bottom: 15px; 
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .header p { 
            font-size: 18px; 
            opacity: 0.95; 
          }
          .section { 
            margin-bottom: 40px; 
            page-break-inside: avoid;
          }
          .section h2 { 
            color: #1f2937; 
            border-bottom: 3px solid #3b82f6; 
            padding-bottom: 15px; 
            margin-bottom: 25px; 
            font-size: 24px;
            font-weight: 600;
          }
          .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
          }
          .metric-card { 
            background: #f8fafc;
            border: 1px solid #e2e8f0; 
            border-radius: 12px; 
            padding: 25px; 
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .metric-value { 
            font-size: 28px; 
            font-weight: bold; 
            color: #3b82f6; 
            margin-bottom: 8px;
          }
          .metric-label { 
            font-size: 14px; 
            color: #64748b;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .cost-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            border-radius: 8px;
            overflow: hidden;
          }
          .cost-table th, .cost-table td { 
            border: 1px solid #e2e8f0; 
            padding: 15px; 
            text-align: left; 
          }
          .cost-table th { 
            background: #f1f5f9;
            font-weight: 600;
            color: #1f2937;
          }
          .total-row { 
            background: #dbeafe;
            font-weight: bold;
            font-size: 16px;
          }
          .satellite-image {
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.1);
            margin-bottom: 10px;
          }
          .image-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          .chart-container {
            width: 100%;
            height: 400px;
            margin: 30px 0;
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .footer { 
            margin-top: auto; 
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center; 
            font-size: 12px; 
            color: #64748b;
          }
          .page-break { page-break-before: always; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1>ION Solar Proposal</h1>
            <p>Custom Solar Analysis for ${address}</p>
            <p>Generated on ${currentDate}</p>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <div class="metrics-grid">
              <div class="metric-card"><div class="metric-value">${results?.systemSizeKw || "N/A"} kW</div><div class="metric-label">System Size</div></div>
              <div class="metric-card"><div class="metric-value">${formatNumber(results?.annualProductionKwh)} kWh</div><div class="metric-label">Annual Production</div></div>
              <div class="metric-card"><div class="metric-value">${formatCurrency(results?.monthlySavings)}</div><div class="metric-label">Est. Monthly Savings</div></div>
              <div class="metric-card"><div class="metric-value">${results?.paybackPeriod || "N/A"} yrs</div><div class="metric-label">Payback Period</div></div>
            </div>
          </div>
          
          <div class="section">
            <h2>Property & Roof Analysis</h2>
            <div class="image-grid">
              ${propertyImageUrl ? `<img src="${propertyImageUrl}" alt="Property overview" class="satellite-image" />` : "<div>Image not available</div>"}
              ${roofImageUrl ? `<img src="${roofImageUrl}" alt="Roof detail" class="satellite-image" />` : "<div>Image not available</div>"}
            </div>
          </div>

          <div class="section">
            <h2>Financial Analysis</h2>
            <table class="cost-table">
              <tr><th>Total System Cost</th><td>${formatCurrency(results?.systemCost)}</td></tr>
              <tr><th>Federal Tax Credit (30%)</th><td>-${formatCurrency(results?.federalTaxCredit)}</td></tr>
              <tr class="total-row"><th>Net Investment</th><td>${formatCurrency(results?.netCost)}</td></tr>
              <tr><th>25-Year Gross Savings</th><td>${formatCurrency((results?.monthlySavings || 0) * 12 * 25)}</td></tr>
            </table>
          </div>

          <div class="footer">
            <p><strong>ION Solar</strong> - Licensed, Bonded & Insured • CSLB #1234567</p>
            <p>This proposal is valid for 30 days. Final design and pricing may vary based on site survey.</p>
            <p>Report for ${customerInfo?.name || "Valued Customer"} at ${address} | Generated ${currentDateTime}</p>
          </div>
        </div>
      </body>
      </html>
    `
}

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  try {
    const { results, address, customerInfo } = await req.json()

    if (!results || !address) {
      return NextResponse.json({ error: "Missing required report data." }, { status: 400 })
    }

    let satelliteImages = { propertyImageUrl: null, roofImageUrl: null }
    if (results?.coordinates) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        const imageResponse = await fetch(`${baseUrl}/api/property-images`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coordinates: results.coordinates }),
        })
        if (imageResponse.ok) {
          satelliteImages = await imageResponse.json()
        }
      } catch (e) {
        console.warn("Could not generate satellite images on server:", e)
      }
    }

    const html = generateReportHtml(results, address, customerInfo, satelliteImages)

    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
    })

    await browser.close()

    const safeAddress = address.replace(/[^a-zA-Z0-9]/g, "-")
    const filename = `ION-Solar-Proposal-${safeAddress}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("❌ PDF generation error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
    return NextResponse.json({ error: `Failed to generate PDF: ${errorMessage}` }, { status: 500 })
  }
}
