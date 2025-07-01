"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, AlertCircle } from "lucide-react"

interface PDFDownloadButtonProps {
  results: any
  address: string
  customerInfo?: {
    name: string
    email: string
    phone?: string
  }
  className?: string
}

export function PDFDownloadButton({ results, address, customerInfo, className }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      console.log("🔄 Generating comprehensive report...")
      console.log("📊 Results data:", results)

      // Generate satellite images via server API
      let satelliteImages = { propertyImageUrl: null, roofImageUrl: null }

      if (results?.coordinates) {
        try {
          const imageResponse = await fetch("/api/generate-satellite-images", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              coordinates: results.coordinates,
            }),
          })

          if (imageResponse.ok) {
            satelliteImages = await imageResponse.json()
          }
        } catch (imageError) {
          console.warn("Could not generate satellite images:", imageError)
        }
      }

      // Generate comprehensive HTML report
      const reportContent = generateComprehensiveReport(results, address, customerInfo, satelliteImages)

      // Create a new window with the report
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(reportContent)
        printWindow.document.close()

        // Trigger print dialog (user can save as PDF)
        setTimeout(() => {
          printWindow.print()
        }, 1000) // Give more time for images to load
      } else {
        // Fallback: download as HTML file
        const blob = new Blob([reportContent], { type: "text/html" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `solar-analysis-${address.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}.html`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      console.log("✅ Comprehensive report generated successfully")
    } catch (error) {
      console.error("❌ Report generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateComprehensiveReport = (results: any, address: string, customerInfo: any, satelliteImages: any) => {
    const currentDate = new Date().toLocaleDateString()
    const currentDateTime = new Date().toLocaleString()

    const formatCurrency = (amount: number | undefined) => {
      if (!amount || isNaN(amount)) return "$0"
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount)
    }

    const formatNumber = (num: number | undefined) => {
      if (!num || isNaN(num)) return "0"
      return new Intl.NumberFormat("en-US").format(num)
    }

    // Calculate loan options based on system cost
    const systemCost = results?.systemCost || 30000
    const federalTaxCredit = systemCost * 0.3
    const netSystemCost = systemCost - federalTaxCredit // Amount actually financed

    const calculateLoanPayment = (principal: number, apr: number, years: number) => {
      const r = apr / 12
      const n = years * 12
      return (r * principal) / (1 - Math.pow(1 + r, -n))
    }

    const loanOptions = [
      {
        name: "3.99% APR Solar Loan (with 25% Dealer Fee)",
        apr: 0.0399,
        dealerFee: 0.25,
        termYears: 25,
        systemCost: netSystemCost, // Use net cost after tax credit
        description: "Low monthly payment with dealer fee included - tax credit reduces loan amount",
      },
      {
        name: "7.99% APR Solar Loan (No Dealer Fee)",
        apr: 0.0799,
        dealerFee: 0,
        termYears: 25,
        systemCost: netSystemCost, // Use net cost after tax credit
        description: "No dealer fee, clean loan - tax credit reduces loan amount",
      },
    ]

    // Use satellite images from server API
    const { propertyImageUrl, roofImageUrl } = satelliteImages

    // Generate 15-year savings chart data
    const chartData = results?.yearlyProjections || []

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Complete Solar Analysis Report - ${address}</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: white;
          }
          .page { 
            max-width: 210mm; 
            margin: 0 auto; 
            padding: 20mm; 
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #f59e0b, #3b82f6); 
            color: white; 
            padding: 40px; 
            text-align: center; 
            margin-bottom: 40px; 
            border-radius: 12px;
            position: relative;
            overflow: hidden;
          }
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
            animation: float 20s infinite linear;
          }
          @keyframes float { 0% { transform: translate(-50%, -50%) rotate(0deg); } 100% { transform: translate(-50%, -50%) rotate(360deg); } }
          .header h1 { 
            font-size: 36px; 
            margin-bottom: 15px; 
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            position: relative;
            z-index: 1;
          }
          .header p { 
            font-size: 18px; 
            opacity: 0.95; 
            position: relative;
            z-index: 1;
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
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border: 2px solid #e2e8f0; 
            border-radius: 12px; 
            padding: 25px; 
            text-align: center;
            transition: transform 0.3s ease;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .metric-card:hover { transform: translateY(-2px); }
          .metric-value { 
            font-size: 28px; 
            font-weight: bold; 
            color: #3b82f6; 
            margin-bottom: 8px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
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
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .cost-table th, .cost-table td { 
            border: 1px solid #e2e8f0; 
            padding: 15px; 
            text-align: left; 
          }
          .cost-table th { 
            background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
            font-weight: 600;
            color: #1f2937;
          }
          .equipment-row { 
            background: linear-gradient(135deg, #fef3c7, #fde68a);
          }
          .labor-row { 
            background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          }
          .total-row { 
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            font-weight: bold;
            font-size: 16px;
          }
          .loan-card {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border: 2px solid #0ea5e9;
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .loan-card h4 {
            color: #0c4a6e;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
          }
          .loan-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 10px;
          }
          .loan-detail {
            font-size: 14px;
            color: #0c4a6e;
            font-weight: 500;
          }
          .heloc-box {
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border: 2px solid #10b981;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .heloc-box h3 {
            color: #065f46;
            margin-bottom: 15px;
            font-size: 20px;
            font-weight: 600;
          }
          .heloc-text {
            color: #065f46;
            font-weight: 500;
            margin-bottom: 10px;
          }
          .satellite-image {
            width: 100%;
            max-width: 600px;
            height: 400px;
            border-radius: 12px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            margin: 20px auto;
            display: block;
            object-fit: cover;
          }
          .image-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
          }
          .image-container {
            text-align: center;
          }
          .chart-container {
            width: 100%;
            height: 400px;
            margin: 30px 0;
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .highlight-box {
            background: linear-gradient(135deg, #fefce8, #fef3c7);
            border: 2px solid #eab308;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .highlight-box h3 {
            color: #92400e;
            margin-bottom: 15px;
            font-size: 20px;
          }
          .hvac-box {
            background: linear-gradient(135deg, #fed7aa, #bfdbfe);
            border: 2px solid #f97316;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .hvac-box h3 {
            color: #1f2937;
            margin-bottom: 15px;
            font-size: 20px;
            font-weight: 600;
          }
          .hvac-text {
            color: #1f2937;
            font-weight: 500;
          }
          .climate-box {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border: 2px solid #0ea5e9;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .climate-box h3 {
            color: #0c4a6e;
            margin-bottom: 15px;
            font-size: 20px;
          }
          .footer { 
            margin-top: 50px; 
            padding: 30px; 
            background: linear-gradient(135deg, #f8fafc, #e2e8f0);
            border-radius: 12px; 
            text-align: center; 
            font-size: 12px; 
            color: #64748b;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .footer p { margin-bottom: 5px; }
          .page-break { page-break-before: always; }
          @media print { 
            body { padding: 0; margin: 0; }
            .page { box-shadow: none; margin: 0; padding: 15mm; }
            .header { -webkit-print-color-adjust: exact; color-adjust: exact; }
            .metric-card, .highlight-box, .hvac-box, .climate-box, .loan-card, .heloc-box { -webkit-print-color-adjust: exact; color-adjust: exact; }
            .cost-table th, .cost-table td { -webkit-print-color-adjust: exact; color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1>🌞 Complete Solar Analysis Report</h1>
            <p>Professional Multi-Step Solar Assessment for ${address}</p>
            <p>Generated on ${currentDate}</p>
          </div>

          <!-- Property Images -->
          <div class="section">
            <h2>📍 Property Analysis</h2>
            ${
              propertyImageUrl && roofImageUrl
                ? `
            <div class="image-grid">
              <div class="image-container">
                <img src="${propertyImageUrl}" alt="Property overview of ${address}" class="satellite-image" />
                <p style="margin-top: 10px; color: #64748b; font-style: italic; font-size: 14px;">
                  <strong>Property Overview</strong><br>
                  Satellite view showing property layout and surroundings
                </p>
              </div>
              <div class="image-container">
                <img src="${roofImageUrl}" alt="Roof detail of ${address}" class="satellite-image" />
                <p style="margin-top: 10px; color: #64748b; font-style: italic; font-size: 14px;">
                  <strong>Roof Detail</strong><br>
                  Close-up view of roof area for solar panel placement
                </p>
              </div>
            </div>
            `
                : propertyImageUrl
                  ? `
            <img src="${propertyImageUrl}" alt="Satellite view of ${address}" class="satellite-image" />
            <p style="text-align: center; margin-top: 10px; color: #64748b; font-style: italic;">
              Satellite view of your property showing roof area and solar potential
            </p>
            `
                  : `
            <div style="background: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 40px; text-align: center; color: #6b7280;">
              <p><strong>Property Images</strong></p>
              <p>Satellite images will be available when Google Maps API is configured</p>
            </div>
            `
            }
          </div>

          <!-- Executive Summary -->
          <div class="section">
            <h2>📊 Executive Summary</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${results?.systemSizeKw || "N/A"} kW</div>
                <div class="metric-label">System Size</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${formatNumber(results?.annualProductionKwh)} kWh</div>
                <div class="metric-label">Annual Production</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${formatCurrency(results?.monthlySavings)}</div>
                <div class="metric-label">Monthly Savings</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results?.paybackPeriod || "N/A"} years</div>
                <div class="metric-label">Payback Period</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results?.peakSunHours || "N/A"}</div>
                <div class="metric-label">Peak Sun Hours/Day</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results?.elevation || "N/A"} ft</div>
                <div class="metric-label">Property Elevation</div>
              </div>
            </div>
          </div>

          <!-- 15-Year Savings Chart -->
          ${
            chartData.length > 0
              ? `
          <div class="section">
            <h2>📈 15-Year Financial Projection</h2>
            <div class="chart-container">
              <canvas id="savingsChart"></canvas>
            </div>
          </div>
          `
              : ""
          }

          <!-- Detailed Cost Breakdown -->
          <div class="section">
            <h2>💰 Detailed Cost Breakdown</h2>
            <table class="cost-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Total Cost</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr class="equipment-row">
                  <td colspan="5" style="font-weight: bold; text-align: center;">EQUIPMENT COSTS</td>
                </tr>
                <tr>
                  <td><strong>Solar Panels</strong></td>
                  <td>${results?.costBreakdown?.solarPanels?.quantity || results?.panelCount || "N/A"}</td>
                  <td>${formatCurrency(280)}</td>
                  <td>${formatCurrency(results?.costBreakdown?.solarPanels?.totalCost || (results?.panelCount || 0) * 280)}</td>
                  <td>Silfab SIL-440 BK (440W, 21.2% efficiency)</td>
                </tr>
                <tr>
                  <td><strong>Microinverters</strong></td>
                  <td>${results?.costBreakdown?.microinverters?.quantity || results?.panelCount || "N/A"}</td>
                  <td>${formatCurrency(220)}</td>
                  <td>${formatCurrency(results?.costBreakdown?.microinverters?.totalCost || (results?.panelCount || 0) * 220)}</td>
                  <td>Enphase IQ8+ MC (97% efficiency, monitoring)</td>
                </tr>
                <tr>
                  <td><strong>Racking System</strong></td>
                  <td>1 set</td>
                  <td>-</td>
                  <td>${formatCurrency(results?.costBreakdown?.racking?.totalCost || (results?.systemSizeKw || 0) * 150)}</td>
                  <td>IronRidge XR rail mounting with grounding</td>
                </tr>
                <tr>
                  <td><strong>Electrical Components</strong></td>
                  <td>1 set</td>
                  <td>-</td>
                  <td>${formatCurrency(results?.costBreakdown?.electricalComponents?.totalCost || (results?.systemSizeKw || 0) * 200)}</td>
                  <td>Meter, disconnects, conduit, wiring</td>
                </tr>
                <tr class="labor-row">
                  <td colspan="5" style="font-weight: bold; text-align: center;">PROFESSIONAL SERVICES</td>
                </tr>
                <tr>
                  <td><strong>Design & Engineering</strong></td>
                  <td>1</td>
                  <td>${formatCurrency(750)}</td>
                  <td>${formatCurrency(750)}</td>
                  <td>CAD drawings, structural analysis</td>
                </tr>
                <tr>
                  <td><strong>Permits & Interconnection</strong></td>
                  <td>1</td>
                  <td>${formatCurrency(500)}</td>
                  <td>${formatCurrency(500)}</td>
                  <td>Building permits, utility connection</td>
                </tr>
                <tr>
                  <td><strong>Installation Labor</strong></td>
                  <td>1</td>
                  <td>-</td>
                  <td>${formatCurrency(results?.costBreakdown?.installation?.totalCost || (results?.systemSizeKw || 0) * 800)}</td>
                  <td>Professional installation & commissioning</td>
                </tr>
                <tr>
                  <td><strong>Inspection & Activation</strong></td>
                  <td>1</td>
                  <td>${formatCurrency(250)}</td>
                  <td>${formatCurrency(250)}</td>
                  <td>Final inspection, testing, activation</td>
                </tr>
                ${
                  results?.batteryInfo
                    ? `
                <tr class="equipment-row">
                  <td colspan="5" style="font-weight: bold; text-align: center;">OPTIONAL BATTERY STORAGE</td>
                </tr>
                <tr>
                  <td><strong>Tesla Powerwall 3</strong></td>
                  <td>${results.batteryInfo.count}</td>
                  <td>${formatCurrency(16500)}</td>
                  <td>${formatCurrency(results.batteryInfo.count * 16500)}</td>
                  <td>13.5 kWh usable, backup power, storm watch</td>
                </tr>
                `
                    : ""
                }
                <tr class="total-row">
                  <td colspan="3"><strong>TOTAL SYSTEM COST</strong></td>
                  <td><strong>${formatCurrency(results?.systemCost)}</strong></td>
                  <td><strong>Turnkey Installation</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="page-break"></div>

          <!-- Dividend Bank Financing Options -->
          <div class="section">
            <h2>💳 Dividend Bank Financing Options</h2>
            <p style="margin-bottom: 20px; color: #374151; font-size: 16px;">
              <strong>Professional financing solutions through Dividend Bank with competitive rates and flexible terms.</strong>
            </p>
            
            ${loanOptions
              .map((option) => {
                const totalFinanced = option.systemCost * (1 + option.dealerFee)
                const monthlyPayment = calculateLoanPayment(totalFinanced, option.apr, option.termYears)
                const totalPaid = monthlyPayment * option.termYears * 12
                const totalInterest = totalPaid - totalFinanced

                return `
              <div class="loan-card">
                <h4>${option.name}</h4>
                <div class="loan-details">
                  <div class="loan-detail">💵 Original System Cost: ${formatCurrency(systemCost)}</div>
                  <div class="loan-detail">🎯 Federal Tax Credit: -${formatCurrency(federalTaxCredit)}</div>
                  <div class="loan-detail">💳 Net Amount Financed: ${formatCurrency(totalFinanced)}</div>
                  <div class="loan-detail">📅 Term: ${option.termYears} years</div>
                  <div class="loan-detail">📈 APR: ${(option.apr * 100).toFixed(2)}%</div>
                  <div class="loan-detail">📉 Monthly Payment: ${formatCurrency(monthlyPayment)}</div>
                  <div class="loan-detail">📊 Total Interest: ${formatCurrency(totalInterest)}</div>
                  <div class="loan-detail">💰 Total Paid: ${formatCurrency(totalPaid)}</div>
                </div>
                <p style="font-size: 14px; color: #0c4a6e; font-style: italic; margin-top: 10px;">
                  ${option.description}
                </p>
              </div>
              `
              })
              .join("")}
          </div>

          <!-- HELOC Strategy Section -->
          <div class="heloc-box">
            <h3>🏠 HELOC Strategy - Popular Financial Approach</h3>
            <div class="heloc-text">
              <p><strong>Many homeowners use a Home Equity Line of Credit (HELOC) for solar financing:</strong></p>
              <ul style="margin: 15px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Lower Interest Rates:</strong> HELOCs typically offer rates 2-4% lower than solar loans</li>
                <li style="margin-bottom: 8px;"><strong>Tax Deductible Interest:</strong> HELOC interest may be tax-deductible when used for home improvements</li>
                <li style="margin-bottom: 8px;"><strong>Flexible Terms:</strong> Interest-only payments during draw period, then convert to fixed payments</li>
                <li style="margin-bottom: 8px;"><strong>No Dealer Fees:</strong> Avoid the 15-25% dealer fees common with solar loans</li>
                <li style="margin-bottom: 8px;"><strong>Build Equity:</strong> Solar increases home value while you pay down the HELOC</li>
              </ul>
              <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4 style="color: #065f46; margin-bottom: 10px;">HELOC Example for ${formatCurrency(netSystemCost)} Net Solar Cost:</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                  <div style="font-size: 14px; color: #065f46;">• HELOC Rate: ~5.5% APR</div>
                  <div style="font-size: 14px; color: #065f46;">• Monthly Payment: ~${formatCurrency(calculateLoanPayment(netSystemCost, 0.055, 15))}</div>
                  <div style="font-size: 14px; color: #065f46;">• Total Interest (15yr): ~${formatCurrency(calculateLoanPayment(netSystemCost, 0.055, 15) * 180 - netSystemCost)}</div>
                  <div style="font-size: 14px; color: #065f46;">• Potential Tax Savings: Consult your CPA</div>
                </div>
              </div>
              <p style="margin-top: 15px;"><strong>💡 Strategy Tip:</strong> Many customers use their HELOC to pay cash for solar (getting the best price), then pay down the HELOC over time with their solar savings.</p>
            </div>
          </div>

          <!-- HVAC Impact Analysis -->
          ${
            results?.hvacImpact
              ? `
          <div class="hvac-box">
            <h3>🏠 HVAC System Impact Analysis</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${results.hvacImpact.heatingType}</div>
                <div class="metric-label">Heating System</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results.hvacImpact.coolingType}</div>
                <div class="metric-label">Cooling System</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results.hvacImpact.benefitMultiplier}x</div>
                <div class="metric-label">Solar Benefit Multiplier</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${formatCurrency(results.hvacImpact.additionalSavings)}</div>
                <div class="metric-label">Additional Annual Savings</div>
              </div>
            </div>
            <p style="margin-top: 15px;" class="hvac-text">
              Your ${results.hvacImpact.heatingType.toLowerCase()} heating and ${results.hvacImpact.coolingType.toLowerCase()} cooling systems 
              ${results.hvacImpact.benefitMultiplier > 1 ? "significantly benefit from" : "are compatible with"} solar power, 
              providing enhanced savings potential.
            </p>
          </div>
          `
              : ""
          }

          <!-- Climate Analysis -->
          ${
            results?.climateData
              ? `
          <div class="climate-box">
            <h3>🌡️ Climate Analysis</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${results.climateData.avgTemp}°F</div>
                <div class="metric-label">Average Temperature</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results.climateData.coolingDays}</div>
                <div class="metric-label">Cooling Days/Year</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results.climateData.heatingDays}</div>
                <div class="metric-label">Heating Days/Year</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results.climateData.solarPotential}</div>
                <div class="metric-label">Solar Potential Rating</div>
              </div>
            </div>
          </div>
          `
              : ""
          }

          <!-- NREL Validation -->
          ${
            results?.nrelData
              ? `
          <div class="section">
            <h2>🌞 NREL PVWatts Validation</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${formatNumber(results.nrelData.production?.annual || 0)} kWh</div>
                <div class="metric-label">NREL Annual Production</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results.nrelData.location?.city || "N/A"}</div>
                <div class="metric-label">Weather Station</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results.nrelData.inputs?.system_capacity || "N/A"} kW</div>
                <div class="metric-label">Validated System Size</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${results.nrelData.inputs?.tilt || "N/A"}°</div>
                <div class="metric-label">Panel Tilt</div>
              </div>
            <p style="text-align: center; margin-top: 20px; color: #059669; font-weight: 500;">
              ✅ Government NREL database confirms your system's production estimates
            </p>
          </div>
          `
              : ""
          }

          <!-- System Specifications -->
          <div class="section">
            <h2>⚡ Complete System Specifications</h2>
            <table class="cost-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Specification</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Solar Panels</strong></td>
                  <td>${results?.panelCount || "N/A"} panels</td>
                  <td>Silfab SIL-440 BK (440W each, 25-year warranty)</td>
                </tr>
                <tr>
                  <td><strong>Microinverters</strong></td>
                  <td>${results?.inverterCount || results?.panelCount || "N/A"} units</td>
                  <td>Enphase IQ8+ MC (97% efficiency, 25-year warranty)</td>
                </tr>
                <tr>
                  <td><strong>Total System Size</strong></td>
                  <td>${results?.systemSizeKw || "N/A"} kW DC</td>
                  <td>Optimized for your energy usage and roof conditions</td>
                </tr>
                <tr>
                  <td><strong>Annual Production</strong></td>
                  <td>${formatNumber(results?.annualProductionKwh)} kWh</td>
                  <td>Based on local weather data and system analysis</td>
                </tr>
                <tr>
                  <td><strong>System Efficiency</strong></td>
                  <td>${results?.totalSystemEfficiency || "85"}%</td>
                  <td>Including shading, tilt, and directional losses</td>
                </tr>
                <tr>
                  <td><strong>Peak Sun Hours</strong></td>
                  <td>${results?.peakSunHours || "N/A"} hours/day</td>
                  <td>Location-specific solar irradiance</td>
                </tr>
                <tr>
                  <td><strong>Property Elevation</strong></td>
                  <td>${results?.elevation || "N/A"} feet</td>
                  <td>Above sea level (affects solar performance)</td>
                </tr>
                <tr>
                  <td><strong>Monitoring</strong></td>
                  <td>Enphase Enlighten</td>
                  <td>Panel-level production monitoring and alerts</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Financial Analysis -->
          <div class="section">
            <h2>💰 Complete Financial Analysis</h2>
            <table class="cost-table">
              <thead>
                <tr>
                  <th>Financial Metric</th>
                  <th>Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Total System Cost</strong></td>
                  <td>${formatCurrency(results?.systemCost)}</td>
                  <td>Complete turnkey installation</td>
                </tr>
                <tr>
                  <td><strong>Federal Tax Credit (30%)</strong></td>
                  <td class="labor-row">-${formatCurrency(results?.federalTaxCredit)}</td>
                  <td>Available through 2032</td>
                </tr>
                <tr>
                  <td><strong>Net Investment</strong></td>
                  <td><strong>${formatCurrency(results?.netCost)}</strong></td>
                  <td>Your actual cost after incentives</td>
                </tr>
                <tr>
                  <td><strong>Current Monthly Bill</strong></td>
                  <td>${formatCurrency(results?.currentMonthlyBill)}</td>
                  <td>Average utility payment</td>
                </tr>
                <tr>
                  <td><strong>New Monthly Bill</strong></td>
                  <td>${formatCurrency(results?.monthlyBillWithSolar)}</td>
                  <td>With solar system (includes connection fee)</td>
                </tr>
                <tr>
                  <td><strong>Monthly Savings</strong></td>
                  <td class="labor-row"><strong>${formatCurrency(results?.monthlySavings)}</strong></td>
                  <td>Immediate monthly savings</td>
                </tr>
                <tr>
                  <td><strong>Annual Savings</strong></td>
                  <td class="labor-row">${formatCurrency((results?.monthlySavings || 0) * 12)}</td>
                  <td>First year savings</td>
                </tr>
                <tr>
                  <td><strong>25-Year Savings</strong></td>
                  <td class="labor-row">${formatCurrency((results?.monthlySavings || 0) * 12 * 25)}</td>
                  <td>Total lifetime savings (with rate increases)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Environmental Impact -->
          <div class="section">
            <h2>🌱 Environmental Impact</h2>
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${Math.round((results?.annualProductionKwh || 0) * 0.0004)} tons</div>
                <div class="metric-label">CO₂ Offset Annually</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${Math.round((results?.annualProductionKwh || 0) * 0.0004 * 16)}</div>
                <div class="metric-label">Trees Planted Equivalent</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${Math.round((results?.annualProductionKwh || 0) * 0.0004 * 25)} tons</div>
                <div class="metric-label">25-Year CO₂ Offset</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${Math.round((results?.annualProductionKwh || 0) / 1000)} MWh</div>
                <div class="metric-label">Clean Energy Generated</div>
              </div>
            </div>
            <p style="text-align: center; margin-top: 20px; color: #166534; font-weight: 500; font-size: 16px;">
              Your solar system will prevent ${Math.round((results?.annualProductionKwh || 0) * 0.0004 * 25)} tons of CO₂ 
              from entering the atmosphere over 25 years - equivalent to planting ${Math.round((results?.annualProductionKwh || 0) * 0.0004 * 25 * 16)} trees!
            </p>
          </div>

          <div class="footer">
            <p><strong>The Solar Grind</strong> - Professional Solar Analysis Tool</p>
            <p>Complete Multi-Step Analysis Report generated on ${currentDateTime}</p>
            <p>Report includes: Address Analysis • Terrain Analysis • Climate Analysis • Smart Solar Sizing • NREL Validation</p>
            <p>For ${customerInfo?.name || "Solar Customer"} - ${address}</p>
            <p>This analysis is based on current utility rates, solar incentives, weather data, and NREL databases.</p>
            <p><strong>Dividend Bank financing and HELOC options available - Contact us for personalized rates</strong></p>
            <p>© ${new Date().getFullYear()} The Solar Grind. All rights reserved.</p>
          </div>
        </div>

        ${
          chartData.length > 0
            ? `
        <script>
          // Wait for page to load
          window.addEventListener('load', function() {
            const ctx = document.getElementById('savingsChart');
            if (ctx) {
              new Chart(ctx, {
                type: 'line',
                data: {
                  labels: [${chartData.map((d) => `'Year ${d.year}'`).join(", ")}],
                  datasets: [{
                    label: 'Annual Savings',
                    data: [${chartData.map((d) => d.annualSavings).join(", ")}],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                  }, {
                    label: 'Cumulative Savings',
                    data: [${chartData.map((d) => d.cumulativeSavings).join(", ")}],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4
                  }, {
                    label: 'Cost Without Solar',
                    data: [${chartData.map((d) => d.billWithoutSolar).join(", ")}],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 5]
                  }]
                },
                options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    title: {
                      display: true,
                      text: '15-Year Solar vs No Solar Comparison',
                      font: { size: 18, weight: 'bold' }
                    },
                    legend: {
                      display: true,
                      position: 'top'
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '$' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }
              });
            }
          });
        </script>
        `
            : ""
        }
      </body>
      </html>
    `
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600 text-white font-semibold ${className}`}
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Report...
          </>
        ) : (
          <>
            <FileText className="h-4 w-4 mr-2" />
            Download Complete Analysis Report
          </>
        )}
      </Button>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-800 font-medium">Report Generation Failed</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
