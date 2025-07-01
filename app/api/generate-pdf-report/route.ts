import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would generate a proper PDF
    // For now, we'll return HTML that can be printed as PDF

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Professional Solar Analysis Report</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
              margin-bottom: 10px;
            }
            .section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #2563eb;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
              margin-bottom: 15px;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 20px;
            }
            .metric {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
            .metric-value {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            .metric-label {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
            }
            .table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .table th, .table td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            .table th {
              background: #f1f5f9;
              font-weight: bold;
            }
            .print-button {
              background: #2563eb;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 16px;
              margin: 20px 0;
            }
            .print-button:hover {
              background: #1d4ed8;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🌞 The Solar Grind Pro</div>
            <h1>Professional Solar Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>

          <button class="print-button" onclick="window.print()">📄 Print/Save as PDF</button>

          <div class="section">
            <h2 class="section-title">Executive Summary</h2>
            <div class="grid">
              <div class="metric">
                <div class="metric-value">8.5 kW</div>
                <div class="metric-label">Recommended System Size</div>
              </div>
              <div class="metric">
                <div class="metric-value">$1,800</div>
                <div class="metric-label">Annual Savings</div>
              </div>
              <div class="metric">
                <div class="metric-value">8.5 years</div>
                <div class="metric-label">Payback Period</div>
              </div>
              <div class="metric">
                <div class="metric-value">4.2 tons</div>
                <div class="metric-label">CO₂ Offset/Year</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">System Specifications</h2>
            <table class="table">
              <tr>
                <th>Component</th>
                <th>Specification</th>
              </tr>
              <tr>
                <td>Solar Panels</td>
                <td>21 x 400W Premium Monocrystalline</td>
              </tr>
              <tr>
                <td>Inverter System</td>
                <td>Micro-inverters with monitoring</td>
              </tr>
              <tr>
                <td>Annual Production</td>
                <td>12,500 kWh</td>
              </tr>
              <tr>
                <td>System Efficiency</td>
                <td>22% panel efficiency</td>
              </tr>
              <tr>
                <td>Warranty</td>
                <td>25-year performance guarantee</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">Financial Analysis</h2>
            <table class="table">
              <tr>
                <th>Item</th>
                <th>Amount</th>
              </tr>
              <tr>
                <td>Total System Cost</td>
                <td>$25,500</td>
              </tr>
              <tr>
                <td>Federal Tax Credit (30%)</td>
                <td>-$7,650</td>
              </tr>
              <tr>
                <td>State Incentives</td>
                <td>-$2,000</td>
              </tr>
              <tr>
                <td>Local Rebates</td>
                <td>-$1,500</td>
              </tr>
              <tr>
                <td><strong>Net Investment</strong></td>
                <td><strong>$14,350</strong></td>
              </tr>
              <tr>
                <td>Annual Savings</td>
                <td>$1,800</td>
              </tr>
              <tr>
                <td>25-Year Savings</td>
                <td>$52,000</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">Environmental Impact</h2>
            <div class="grid">
              <div class="metric">
                <div class="metric-value">4.2 tons</div>
                <div class="metric-label">CO₂ Offset Annually</div>
              </div>
              <div class="metric">
                <div class="metric-value">67 trees</div>
                <div class="metric-label">Equivalent Trees Planted</div>
              </div>
              <div class="metric">
                <div class="metric-value">105 tons</div>
                <div class="metric-label">25-Year CO₂ Reduction</div>
              </div>
              <div class="metric">
                <div class="metric-value">100%</div>
                <div class="metric-label">Clean Energy</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Monthly Production Forecast</h2>
            <table class="table">
              <tr>
                <th>Month</th>
                <th>Production (kWh)</th>
                <th>Savings ($)</th>
              </tr>
              <tr><td>January</td><td>850</td><td>$102</td></tr>
              <tr><td>February</td><td>950</td><td>$114</td></tr>
              <tr><td>March</td><td>1,200</td><td>$144</td></tr>
              <tr><td>April</td><td>1,350</td><td>$162</td></tr>
              <tr><td>May</td><td>1,450</td><td>$174</td></tr>
              <tr><td>June</td><td>1,500</td><td>$180</td></tr>
              <tr><td>July</td><td>1,550</td><td>$186</td></tr>
              <tr><td>August</td><td>1,400</td><td>$168</td></tr>
              <tr><td>September</td><td>1,250</td><td>$150</td></tr>
              <tr><td>October</td><td>1,100</td><td>$132</td></tr>
              <tr><td>November</td><td>900</td><td>$108</td></tr>
              <tr><td>December</td><td>800</td><td>$96</td></tr>
            </table>
          </div>

          <div class="section">
            <h2 class="section-title">Next Steps</h2>
            <ol>
              <li><strong>Site Assessment:</strong> Schedule a detailed on-site evaluation</li>
              <li><strong>Custom Design:</strong> Create detailed system layout and specifications</li>
              <li><strong>Permitting:</strong> Handle all required permits and approvals</li>
              <li><strong>Installation:</strong> Professional installation by certified technicians</li>
              <li><strong>Inspection:</strong> Final inspection and utility interconnection</li>
              <li><strong>Monitoring:</strong> Ongoing system monitoring and support</li>
            </ol>
          </div>

          <div class="section">
            <h2 class="section-title">Contact Information</h2>
            <p><strong>The Solar Grind Pro</strong><br>
            Professional Solar Solutions<br>
            Phone: (555) 123-SOLAR<br>
            Email: info@thesolargrind.com<br>
            Web: www.thesolargrind.com</p>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #64748b; font-size: 12px;">
            This report is valid for 30 days from the date of generation. Actual results may vary based on final system design, local conditions, and utility policies.
          </div>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
