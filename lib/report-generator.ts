export interface ReportData {
  customerName: string
  customerEmail: string
  customerPhone?: string
  propertyAddress: string
  monthlyBill: number
  systemSize: number
  annualProduction: number
  annualSavings: number
  paybackPeriod: number
  co2Reduction: number
  installationCost: number
  incentives: number
  generatedAt: string
  reportId: string
}

export function generateSolarReport(data: ReportData): string {
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
    generatedAt,
    reportId,
  } = data

  const netCost = installationCost - incentives
  const monthlySavings = Math.round(annualSavings / 12)
  const twentyFiveYearSavings = Math.round(annualSavings * 25)
  const treesEquivalent = Math.round(co2Reduction * 16)
  const carsOffRoad = Math.round(co2Reduction / 4.6)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solar Analysis Report - ${customerName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 800px;
            margin: 20px auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .report-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 30px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .info-item {
            background: rgba(255,255,255,0.8);
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .info-label {
            font-weight: 600;
            color: #495057;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }
        
        .info-value {
            font-size: 1.1em;
            color: #212529;
            font-weight: 500;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 1.8em;
            margin-bottom: 20px;
            font-weight: 700;
            position: relative;
        }
        
        .section h2::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 50px;
            height: 3px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            padding: 25px;
            border-radius: 15px;
            border: 1px solid #e9ecef;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 5px;
        }
        
        .metric-label {
            color: #6c757d;
            font-weight: 600;
            font-size: 1em;
        }
        
        .metric-description {
            color: #868e96;
            font-size: 0.85em;
            margin-top: 5px;
            line-height: 1.4;
        }
        
        .summary-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }
        
        .summary-section::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 150px;
            height: 150px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(50%, -50%);
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            position: relative;
            z-index: 1;
        }
        
        .summary-item {
            text-align: center;
            padding: 15px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .summary-value {
            font-size: 2em;
            font-weight: 800;
            margin-bottom: 5px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .summary-label {
            opacity: 0.9;
            font-size: 1em;
            font-weight: 500;
        }
        
        .footer {
            background: linear-gradient(135deg, #343a40 0%, #495057 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer h3 {
            font-size: 1.3em;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .footer p {
            margin-bottom: 10px;
            opacity: 0.9;
        }
        
        .disclaimer {
            font-size: 0.8em;
            opacity: 0.8;
            margin-top: 20px;
            line-height: 1.5;
            padding: 15px;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        @media print {
            body { background: white; }
            .container { box-shadow: none; margin: 0; }
            .metric-card:hover { transform: none; }
        }
        
        @media (max-width: 768px) {
            .container { margin: 10px; }
            .header { padding: 25px 20px; }
            .content { padding: 20px; }
            .header h1 { font-size: 2em; }
            .section h2 { font-size: 1.5em; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>Solar Analysis Report</h1>
                <p>Professional Solar Energy Assessment</p>
            </div>
        </div>
        
        <div class="report-info">
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Customer</div>
                    <div class="info-value">${customerName}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${customerEmail}</div>
                </div>
                ${
                  customerPhone
                    ? `
                <div class="info-item">
                    <div class="info-label">Phone</div>
                    <div class="info-value">${customerPhone}</div>
                </div>
                `
                    : ""
                }
                <div class="info-item">
                    <div class="info-label">Property Address</div>
                    <div class="info-value">${propertyAddress}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Report Date</div>
                    <div class="info-value">${new Date(generatedAt).toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Report ID</div>
                    <div class="info-value">${reportId}</div>
                </div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Executive Summary</h2>
                <div class="summary-section">
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-value">$${monthlySavings}</div>
                            <div class="summary-label">Monthly Savings</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">$${annualSavings.toLocaleString()}</div>
                            <div class="summary-label">Annual Savings</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${paybackPeriod}</div>
                            <div class="summary-label">Payback Period (Years)</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${systemSize}</div>
                            <div class="summary-label">System Size (kW)</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>System Specifications</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${systemSize} kW</div>
                        <div class="metric-label">System Size</div>
                        <div class="metric-description">Total solar panel capacity</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${annualProduction.toLocaleString()}</div>
                        <div class="metric-label">Annual Production (kWh)</div>
                        <div class="metric-description">Estimated yearly energy generation</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Math.ceil(systemSize * 2.5)}</div>
                        <div class="metric-label">Solar Panels</div>
                        <div class="metric-description">Estimated number of panels needed</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Math.round((annualProduction / ((monthlyBill * 12) / 0.12)) * 100)}%</div>
                        <div class="metric-label">Energy Offset</div>
                        <div class="metric-description">Percentage of usage covered by solar</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Financial Analysis</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">$${installationCost.toLocaleString()}</div>
                        <div class="metric-label">System Cost</div>
                        <div class="metric-description">Total installation cost before incentives</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${incentives.toLocaleString()}</div>
                        <div class="metric-label">Tax Credits & Incentives</div>
                        <div class="metric-description">Federal and state incentives available</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${netCost.toLocaleString()}</div>
                        <div class="metric-label">Net Investment</div>
                        <div class="metric-description">Final cost after all incentives</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">$${twentyFiveYearSavings.toLocaleString()}</div>
                        <div class="metric-label">25-Year Savings</div>
                        <div class="metric-description">Total savings over system lifetime</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Environmental Impact</h2>
                <div class="metrics-grid">
                    <div class="metric-card">
                        <div class="metric-value">${co2Reduction}</div>
                        <div class="metric-label">CO₂ Reduction (tons/year)</div>
                        <div class="metric-description">Annual carbon footprint reduction</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${treesEquivalent}</div>
                        <div class="metric-label">Trees Planted Equivalent</div>
                        <div class="metric-description">Environmental benefit equivalent</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${carsOffRoad}</div>
                        <div class="metric-label">Cars Off Road Equivalent</div>
                        <div class="metric-description">Annual emission reduction impact</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${Math.round(co2Reduction * 25)}</div>
                        <div class="metric-label">25-Year CO₂ Reduction</div>
                        <div class="metric-description">Lifetime environmental impact (tons)</div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <h3>The Solar Grind V2</h3>
            <p><strong>Professional Solar Analysis & Installation Services</strong></p>
            <p>Report generated on ${new Date(generatedAt).toLocaleDateString()} | Report ID: ${reportId}</p>
            <p>This analysis is based on current utility rates, available incentives, and estimated solar production.</p>
            
            <div class="disclaimer">
                <p><strong>Disclaimer:</strong> This analysis is based on estimated values and current market conditions. Actual results may vary based on weather conditions, system performance, changes in utility rates, and other factors. Please consult with a qualified solar professional for detailed system design and final pricing.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `
}

export default generateSolarReport
