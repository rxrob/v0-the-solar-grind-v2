export interface CustomerData {
  customerName: string
  customerEmail?: string
  customerPhone?: string
  propertyAddress: string
  propertySquareFeet?: number
  residents?: number
  additionalNotes?: string
}

export interface CalculationData {
  systemSizeKw: number
  panelsNeeded: number
  panelWattage: number
  inverterType: string
  annualProductionKwh: number
  monthlyKwh: number
  currentElectricBill: number
  electricityRate: number
  utilityCompany: string
  systemCost: number
  netCost: number
  annualSavings: number
  monthlySavings: number
  roiYears: number
  co2OffsetTons: number
  treesEquivalent: number
  roofType: string
  roofCondition: string
  roofAge: string
  shadingLevel: string
  hasPool?: boolean
  hasEv?: boolean
  planningAdditions?: boolean
}

export function generateStandardReport(customerData: CustomerData, calculationData: CalculationData): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const federalTaxCredit = calculationData.systemCost * 0.3
  const lifetimeSavings = calculationData.annualSavings * 25 // 25-year projection

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solar Analysis Report - ${customerData.customerName}</title>
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
            margin: 0 auto;
            background: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border-radius: 12px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
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
        
        @keyframes float {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            font-weight: 700;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.8rem;
            color: #1e3c72;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #f0f8ff;
            position: relative;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #1e3c72, #2a5298);
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .info-card {
            background: linear-gradient(135deg, #f8fbff 0%, #e8f4fd 100%);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #2a5298;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .info-card h3 {
            color: #1e3c72;
            font-size: 1.1rem;
            margin-bottom: 8px;
        }
        
        .info-card p {
            font-size: 1.4rem;
            font-weight: 600;
            color: #2a5298;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
        }
        
        .highlight-box h3 {
            font-size: 1.5rem;
            margin-bottom: 15px;
        }
        
        .highlight-box .big-number {
            font-size: 3rem;
            font-weight: 700;
            margin: 10px 0;
        }
        
        .specs-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .specs-table th {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        .specs-table td {
            padding: 15px;
            border-bottom: 1px solid #e8f4fd;
        }
        
        .specs-table tr:nth-child(even) {
            background: #f8fbff;
        }
        
        .specs-table tr:hover {
            background: #e8f4fd;
        }
        
        .environmental-impact {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin: 30px 0;
        }
        
        .environmental-impact h3 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .impact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            text-align: center;
        }
        
        .impact-item {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }
        
        .impact-item .number {
            font-size: 2rem;
            font-weight: 700;
            display: block;
        }
        
        .impact-item .label {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-top: 5px;
        }
        
        .footer {
            background: #f8fbff;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e8f4fd;
        }
        
        .footer p {
            color: #666;
            margin-bottom: 10px;
        }
        
        .disclaimer {
            font-size: 0.8rem;
            color: #888;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
        
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>Solar Analysis Report</h1>
                <p>Professional Solar System Assessment</p>
                <p style="margin-top: 20px; font-size: 0.9rem;">Generated on ${currentDate}</p>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">Customer Information</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Customer Name</h3>
                        <p>${customerData.customerName}</p>
                    </div>
                    ${
                      customerData.customerEmail
                        ? `
                    <div class="info-card">
                        <h3>Email</h3>
                        <p>${customerData.customerEmail}</p>
                    </div>
                    `
                        : ""
                    }
                    ${
                      customerData.customerPhone
                        ? `
                    <div class="info-card">
                        <h3>Phone</h3>
                        <p>${customerData.customerPhone}</p>
                    </div>
                    `
                        : ""
                    }
                    <div class="info-card">
                        <h3>Property Address</h3>
                        <p>${customerData.propertyAddress}</p>
                    </div>
                </div>
            </div>
            
            <div class="highlight-box">
                <h3>Recommended Solar System</h3>
                <div class="big-number">${calculationData.systemSizeKw} kW</div>
                <p>This system will generate approximately ${calculationData.annualProductionKwh.toLocaleString()} kWh annually</p>
            </div>
            
            <div class="section">
                <h2 class="section-title">System Specifications</h2>
                <table class="specs-table">
                    <thead>
                        <tr>
                            <th>Component</th>
                            <th>Specification</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>System Size</td>
                            <td>${calculationData.systemSizeKw} kW</td>
                        </tr>
                        <tr>
                            <td>Number of Panels</td>
                            <td>${calculationData.panelsNeeded} panels</td>
                        </tr>
                        <tr>
                            <td>Panel Wattage</td>
                            <td>${calculationData.panelWattage}W per panel</td>
                        </tr>
                        <tr>
                            <td>Inverter Type</td>
                            <td>${calculationData.inverterType}</td>
                        </tr>
                        <tr>
                            <td>Annual Production</td>
                            <td>${calculationData.annualProductionKwh.toLocaleString()} kWh</td>
                        </tr>
                        <tr>
                            <td>Roof Type</td>
                            <td>${calculationData.roofType}</td>
                        </tr>
                        <tr>
                            <td>Roof Condition</td>
                            <td>${calculationData.roofCondition}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2 class="section-title">Financial Analysis</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>System Cost</h3>
                        <p>$${calculationData.systemCost.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Federal Tax Credit (30%)</h3>
                        <p>-$${federalTaxCredit.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Net Cost</h3>
                        <p>$${calculationData.netCost.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Annual Savings</h3>
                        <p>$${calculationData.annualSavings.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Monthly Savings</h3>
                        <p>$${calculationData.monthlySavings.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Payback Period</h3>
                        <p>${calculationData.roiYears} years</p>
                    </div>
                </div>
                
                <div class="highlight-box">
                    <h3>25-Year Lifetime Savings</h3>
                    <div class="big-number">$${lifetimeSavings.toLocaleString()}</div>
                    <p>Total estimated savings over the system's 25-year lifespan</p>
                </div>
            </div>
            
            <div class="environmental-impact">
                <h3>Environmental Impact</h3>
                <div class="impact-grid">
                    <div class="impact-item">
                        <span class="number">${calculationData.co2OffsetTons}</span>
                        <span class="label">Tons CO₂ Offset Annually</span>
                    </div>
                    <div class="impact-item">
                        <span class="number">${calculationData.treesEquivalent}</span>
                        <span class="label">Trees Planted Equivalent</span>
                    </div>
                    <div class="impact-item">
                        <span class="number">${Math.round(calculationData.co2OffsetTons * 25)}</span>
                        <span class="label">Lifetime CO₂ Offset (Tons)</span>
                    </div>
                    <div class="impact-item">
                        <span class="number">${Math.round(calculationData.co2OffsetTons * 2.2)}</span>
                        <span class="label">Cars Off Road Equivalent</span>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Energy Usage Analysis</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Current Monthly Usage</h3>
                        <p>${calculationData.monthlyKwh.toLocaleString()} kWh</p>
                    </div>
                    <div class="info-card">
                        <h3>Current Monthly Bill</h3>
                        <p>$${calculationData.currentElectricBill.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Electricity Rate</h3>
                        <p>$${calculationData.electricityRate}/kWh</p>
                    </div>
                    <div class="info-card">
                        <h3>Utility Company</h3>
                        <p>${calculationData.utilityCompany}</p>
                    </div>
                </div>
            </div>
            
            ${
              customerData.additionalNotes
                ? `
            <div class="section">
                <h2 class="section-title">Additional Notes</h2>
                <div class="info-card">
                    <p>${customerData.additionalNotes}</p>
                </div>
            </div>
            `
                : ""
            }
        </div>
        
        <div class="footer">
            <p><strong>Solar Grind</strong> - Professional Solar Analysis</p>
            <p>This report is based on current market conditions and available data.</p>
            
            <div class="disclaimer">
                <p><strong>Disclaimer:</strong> This solar analysis is an estimate based on the information provided and current market conditions. Actual results may vary based on weather patterns, energy usage changes, utility rate changes, and other factors. This report is for informational purposes only and does not constitute a binding quote or guarantee. Final system specifications and pricing will be determined during a detailed site assessment.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `
}

export function generateEnhancedReport(customerData: CustomerData, calculationData: CalculationData): string {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const federalTaxCredit = calculationData.systemCost * 0.3
  const lifetimeSavings = calculationData.annualSavings * 25
  const capacityFactor = (calculationData.annualProductionKwh / (calculationData.systemSizeKw * 8760)) * 100
  const performanceRatio = 85 // Typical performance ratio

  // Advanced financial metrics
  const levelizedCostOfEnergy = (calculationData.netCost / (calculationData.annualProductionKwh * 25)) * 100
  const netPresentValue = lifetimeSavings - calculationData.netCost
  const internalRateOfReturn = (calculationData.annualSavings / calculationData.netCost) * 100

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Solar Analysis Report - ${customerData.customerName}</title>
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
            max-width: 900px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 25px 50px rgba(0,0,0,0.15);
            border-radius: 16px;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px 40px;
            text-align: center;
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
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: float 30s infinite linear;
        }
        
        @keyframes float {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 15px;
            font-weight: 700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header .subtitle {
            font-size: 1.3rem;
            opacity: 0.95;
            margin-bottom: 10px;
        }
        
        .header .premium-badge {
            display: inline-block;
            background: linear-gradient(45deg, #ffd700, #ffed4e);
            color: #333;
            padding: 8px 20px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.9rem;
            margin-top: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .content {
            padding: 50px 40px;
        }
        
        .section {
            margin-bottom: 50px;
        }
        
        .section-title {
            font-size: 2rem;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid transparent;
            border-image: linear-gradient(90deg, #667eea, #764ba2) 1;
            position: relative;
        }
        
        .glassmorphism {
            background: rgba(255, 255, 255, 0.25);
            backdrop-filter: blur(10px);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 35px;
        }
        
        .info-card {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            padding: 25px;
            border-radius: 16px;
            border-left: 5px solid #667eea;
            box-shadow: 0 8px 16px rgba(0,0,0,0.08);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .info-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.12);
        }
        
        .info-card h3 {
            color: #667eea;
            font-size: 1.1rem;
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .info-card p {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
        }
        
        .highlight-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            margin: 40px 0;
            box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
            position: relative;
            overflow: hidden;
        }
        
        .highlight-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
            animation: shimmer 3s infinite;
        }
        
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        
        .highlight-box-content {
            position: relative;
            z-index: 1;
        }
        
        .highlight-box h3 {
            font-size: 1.8rem;
            margin-bottom: 20px;
        }
        
        .highlight-box .big-number {
            font-size: 4rem;
            font-weight: 800;
            margin: 15px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .advanced-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .metric-card {
            background: linear-gradient(135deg, #f8fbff 0%, #e8f4fd 100%);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border: 2px solid transparent;
            background-clip: padding-box;
            position: relative;
        }
        
        .metric-card::before {
            content: '';
            position: absolute;
            inset: 0;
            padding: 2px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 12px;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
        }
        
        .metric-card h4 {
            color: #667eea;
            font-size: 0.9rem;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .metric-card .value {
            font-size: 1.8rem;
            font-weight: 700;
            color: #333;
        }
        
        .metric-card .unit {
            font-size: 0.8rem;
            color: #666;
            margin-top: 5px;
        }
        
        .specs-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
        
        .specs-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: left;
            font-weight: 600;
            font-size: 1.1rem;
        }
        
        .specs-table td {
            padding: 18px 20px;
            border-bottom: 1px solid #e8f4fd;
            font-size: 1rem;
        }
        
        .specs-table tr:nth-child(even) {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        }
        
        .specs-table tr:hover {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }
        
        .environmental-impact {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin: 40px 0;
            position: relative;
            overflow: hidden;
        }
        
        .environmental-impact::before {
            content: '🌱';
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 3rem;
            opacity: 0.3;
        }
        
        .environmental-impact h3 {
            font-size: 2rem;
            margin-bottom: 25px;
            text-align: center;
        }
        
        .impact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 25px;
            text-align: center;
        }
        
        .impact-item {
            background: rgba(255,255,255,0.15);
            padding: 25px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .impact-item .number {
            font-size: 2.5rem;
            font-weight: 800;
            display: block;
            margin-bottom: 8px;
        }
        
        .impact-item .label {
            font-size: 0.95rem;
            opacity: 0.95;
            line-height: 1.3;
        }
        
        .financing-section {
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
            padding: 35px;
            border-radius: 16px;
            margin: 35px 0;
            border: 2px solid rgba(255, 215, 0, 0.3);
        }
        
        .financing-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 25px;
        }
        
        .financing-option {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-left: 4px solid #ffd700;
        }
        
        .financing-option h4 {
            color: #333;
            font-size: 1.2rem;
            margin-bottom: 15px;
        }
        
        .financing-option .payment {
            font-size: 1.5rem;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .financing-option .description {
            font-size: 0.9rem;
            color: #666;
            line-height: 1.4;
        }
        
        .warranty-section {
            background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%);
            padding: 35px;
            border-radius: 16px;
            margin: 35px 0;
            border: 2px solid rgba(76, 175, 80, 0.3);
        }
        
        .warranty-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 25px;
        }
        
        .warranty-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
        }
        
        .warranty-item .icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .warranty-item h4 {
            color: #4caf50;
            font-size: 1.1rem;
            margin-bottom: 8px;
        }
        
        .warranty-item .duration {
            font-size: 1.3rem;
            font-weight: 700;
            color: #333;
        }
        
        .market-analysis {
            background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%);
            padding: 35px;
            border-radius: 16px;
            margin: 35px 0;
            border: 2px solid rgba(156, 39, 176, 0.3);
        }
        
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .comparison-table th {
            background: linear-gradient(135deg, #9c27b0 0%, #e91e63 100%);
            color: white;
            padding: 15px;
            text-align: center;
        }
        
        .comparison-table td {
            padding: 12px 15px;
            text-align: center;
            border-bottom: 1px solid #eee;
        }
        
        .comparison-table .highlight {
            background: linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%);
            font-weight: 600;
        }
        
        .footer {
            background: linear-gradient(135deg, #f8fbff 0%, #e8f4fd 100%);
            padding: 40px;
            text-align: center;
            border-top: 1px solid #e8f4fd;
        }
        
        .footer .company-info {
            margin-bottom: 25px;
        }
        
        .footer .company-name {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 10px;
        }
        
        .disclaimer {
            font-size: 0.85rem;
            color: #666;
            margin-top: 25px;
            padding-top: 25px;
            border-top: 2px solid #e8f4fd;
            line-height: 1.5;
        }
        
        @media print {
            body {
                background: white;
            }
            .container {
                box-shadow: none;
            }
            .glassmorphism {
                background: #f8f9fa;
                backdrop-filter: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <h1>Enhanced Solar Analysis</h1>
                <p class="subtitle">Comprehensive Professional Assessment</p>
                <div class="premium-badge">✨ Premium Report</div>
                <p style="margin-top: 20px; font-size: 0.95rem; opacity: 0.9;">Generated on ${currentDate}</p>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">Executive Summary</h2>
                <div class="highlight-box">
                    <div class="highlight-box-content">
                        <h3>Recommended Solar Investment</h3>
                        <div class="big-number">${calculationData.systemSizeKw} kW System</div>
                        <p>This premium solar installation will generate ${calculationData.annualProductionKwh.toLocaleString()} kWh annually, providing substantial energy independence and financial returns for ${customerData.customerName}.</p>
                    </div>
                </div>
                
                <div class="advanced-metrics">
                    <div class="metric-card">
                        <h4>Capacity Factor</h4>
                        <div class="value">${capacityFactor.toFixed(1)}%</div>
                        <div class="unit">System Efficiency</div>
                    </div>
                    <div class="metric-card">
                        <h4>Performance Ratio</h4>
                        <div class="value">${performanceRatio}%</div>
                        <div class="unit">Expected Performance</div>
                    </div>
                    <div class="metric-card">
                        <h4>LCOE</h4>
                        <div class="value">${levelizedCostOfEnergy.toFixed(1)}¢</div>
                        <div class="unit">Per kWh</div>
                    </div>
                    <div class="metric-card">
                        <h4>IRR</h4>
                        <div class="value">${internalRateOfReturn.toFixed(1)}%</div>
                        <div class="unit">Internal Rate of Return</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Customer & Property Profile</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Primary Contact</h3>
                        <p>${customerData.customerName}</p>
                    </div>
                    ${
                      customerData.customerEmail
                        ? `
                    <div class="info-card">
                        <h3>Email Address</h3>
                        <p>${customerData.customerEmail}</p>
                    </div>
                    `
                        : ""
                    }
                    ${
                      customerData.customerPhone
                        ? `
                    <div class="info-card">
                        <h3>Phone Number</h3>
                        <p>${customerData.customerPhone}</p>
                    </div>
                    `
                        : ""
                    }
                    <div class="info-card">
                        <h3>Installation Address</h3>
                        <p>${customerData.propertyAddress}</p>
                    </div>
                    ${
                      customerData.propertySquareFeet
                        ? `
                    <div class="info-card">
                        <h3>Property Size</h3>
                        <p>${customerData.propertySquareFeet.toLocaleString()} sq ft</p>
                    </div>
                    `
                        : ""
                    }
                    ${
                      customerData.residents
                        ? `
                    <div class="info-card">
                        <h3>Household Size</h3>
                        <p>${customerData.residents} residents</p>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">Advanced System Specifications</h2>
                <table class="specs-table">
                    <thead>
                        <tr>
                            <th>Component</th>
                            <th>Specification</th>
                            <th>Performance Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>System Capacity</strong></td>
                            <td>${calculationData.systemSizeKw} kW DC</td>
                            <td>Premium Tier</td>
                        </tr>
                        <tr>
                            <td><strong>Solar Panels</strong></td>
                            <td>${calculationData.panelsNeeded} × ${calculationData.panelWattage}W</td>
                            <td>High Efficiency</td>
                        </tr>
                        <tr>
                            <td><strong>Inverter System</strong></td>
                            <td>${calculationData.inverterType}</td>
                            <td>Industry Leading</td>
                        </tr>
                        <tr>
                            <td><strong>Annual Production</strong></td>
                            <td>${calculationData.annualProductionKwh.toLocaleString()} kWh</td>
                            <td>Optimized Output</td>
                        </tr>
                        <tr>
                            <td><strong>Roof Assessment</strong></td>
                            <td>${calculationData.roofType} - ${calculationData.roofCondition}</td>
                            <td>Suitable for Installation</td>
                        </tr>
                        <tr>
                            <td><strong>Shading Analysis</strong></td>
                            <td>${calculationData.shadingLevel} Impact</td>
                            <td>Optimized Placement</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2 class="section-title">Comprehensive Financial Analysis</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Total Investment</h3>
                        <p>$${calculationData.systemCost.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Federal Tax Credit</h3>
                        <p>-$${federalTaxCredit.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Net Investment</h3>
                        <p>$${calculationData.netCost.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Annual Savings</h3>
                        <p>$${calculationData.annualSavings.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Monthly Savings</h3>
                        <p>$${calculationData.monthlySavings.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Payback Period</h3>
                        <p>${calculationData.roiYears} years</p>
                    </div>
                </div>
                
                <div class="highlight-box">
                    <div class="highlight-box-content">
                        <h3>25-Year Financial Projection</h3>
                        <div class="big-number">$${lifetimeSavings.toLocaleString()}</div>
                        <p>Total lifetime savings with Net Present Value of $${netPresentValue.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            
            <div class="financing-section">
                <h2 class="section-title">Premium Financing Options</h2>
                <p>Multiple pathways to solar ownership designed to maximize your financial benefits:</p>
                
                <div class="financing-options">
                    <div class="financing-option">
                        <h4>💰 Cash Purchase</h4>
                        <div class="payment">$0/month</div>
                        <div class="description">Maximum savings with no interest. Immediate 30% federal tax credit and full ownership benefits.</div>
                    </div>
                    <div class="financing-option">
                        <h4>🏦 Solar Loan</h4>
                        <div class="payment">$${Math.round(calculationData.netCost * 0.005)}/month</div>
                        <div class="description">Low-interest financing with immediate savings. Own your system from day one.</div>
                    </div>
                    <div class="financing-option">
                        <h4>📋 Solar Lease</h4>
                        <div class="payment">$${Math.round(calculationData.monthlySavings * 0.7)}/month</div>
                        <div class="description">No upfront costs. Fixed monthly payment with maintenance included.</div>
                    </div>
                    <div class="financing-option">
                        <h4>⚡ Power Purchase Agreement</h4>
                        <div class="payment">${(calculationData.electricityRate * 0.85).toFixed(3)}¢/kWh</div>
                        <div class="description">Pay only for power produced at a discounted rate. No upfront investment required.</div>
                    </div>
                </div>
            </div>
            
            <div class="warranty-section">
                <h2 class="section-title">Comprehensive Warranty Coverage</h2>
                <p>Industry-leading protection for your solar investment:</p>
                
                <div class="warranty-grid">
                    <div class="warranty-item">
                        <div class="icon">🔋</div>
                        <h4>Solar Panels</h4>
                        <div class="duration">25 Years</div>
                        <p>Performance & Product Warranty</p>
                    </div>
                    <div class="warranty-item">
                        <div class="icon">⚡</div>
                        <h4>Inverters</h4>
                        <div class="duration">25 Years</div>
                        <p>Full Replacement Coverage</p>
                    </div>
                    <div class="warranty-item">
                        <div class="icon">🔧</div>
                        <h4>Installation</h4>
                        <div class="duration">10 Years</div>
                        <p>Workmanship Guarantee</p>
                    </div>
                    <div class="warranty-item">
                        <div class="icon">🏠</div>
                        <h4>Roof Integrity</h4>
                        <div class="duration">10 Years</div>
                        <p>Leak Protection</p>
                    </div>
                </div>
            </div>
            
            <div class="environmental-impact">
                <h3>Environmental Impact & Sustainability</h3>
                <div class="impact-grid">
                    <div class="impact-item">
                        <span class="number">${calculationData.co2OffsetTons}</span>
                        <span class="label">Tons CO₂ Offset<br>Annually</span>
                    </div>
                    <div class="impact-item">
                        <span class="number">${calculationData.treesEquivalent}</span>
                        <span class="label">Trees Planted<br>Equivalent</span>
                    </div>
                    <div class="impact-item">
                        <span class="number">${Math.round(calculationData.co2OffsetTons * 25)}</span>
                        <span class="label">Lifetime CO₂<br>Offset (Tons)</span>
                    </div>
                    <div class="impact-item">
                        <span class="number">${Math.round(calculationData.co2OffsetTons * 2.2)}</span>
                        <span class="label">Cars Off Road<br>Equivalent</span>
                    </div>
                    <div class="impact-item">
                        <span class="number">${Math.round(calculationData.annualProductionKwh * 0.0009)}</span>
                        <span class="label">Tons Coal<br>Avoided</span>
                    </div>
                    <div class="impact-item">
                        <span class="number">${Math.round(calculationData.annualProductionKwh * 0.0004 * 25)}</span>
                        <span class="label">25-Year Carbon<br>Footprint Reduction</span>
                    </div>
                </div>
            </div>
            
            <div class="market-analysis">
                <h2 class="section-title">Market Analysis & Competitive Positioning</h2>
                <p>How your solar investment compares to market alternatives:</p>
                
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>Your System</th>
                            <th>Market Average</th>
                            <th>Advantage</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Cost per Watt</td>
                            <td class="highlight">$${(calculationData.systemCost / (calculationData.systemSizeKw * 1000)).toFixed(2)}</td>
                            <td>$3.20</td>
                            <td>${calculationData.systemCost / (calculationData.systemSizeKw * 1000) < 3.2 ? "✅ Below Market" : "⚠️ Premium"}</td>
                        </tr>
                        <tr>
                            <td>Payback Period</td>
                            <td class="highlight">${calculationData.roiYears} years</td>
                            <td>8-12 years</td>
                            <td>${calculationData.roiYears < 10 ? "✅ Excellent" : calculationData.roiYears < 12 ? "✅ Good" : "⚠️ Extended"}</td>
                        </tr>
                        <tr>
                            <td>System Efficiency</td>
                            <td class="highlight">${capacityFactor.toFixed(1)}%</td>
                            <td>19.5%</td>
                            <td>${capacityFactor > 19.5 ? "✅ Above Average" : "⚠️ Standard"}</td>
                        </tr>
                        <tr>
                            <td>Warranty Coverage</td>
                            <td class="highlight">25 Years</td>
                            <td>20-25 Years</td>
                            <td>✅ Industry Leading</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h2 class="section-title">Energy Usage Profile</h2>
                <div class="info-grid">
                    <div class="info-card">
                        <h3>Current Monthly Usage</h3>
                        <p>${calculationData.monthlyKwh.toLocaleString()} kWh</p>
                    </div>
                    <div class="info-card">
                        <h3>Current Monthly Bill</h3>
                        <p>$${calculationData.currentElectricBill.toLocaleString()}</p>
                    </div>
                    <div class="info-card">
                        <h3>Utility Rate</h3>
                        <p>$${calculationData.electricityRate}/kWh</p>
                    </div>
                    <div class="info-card">
                        <h3>Utility Provider</h3>
                        <p>${calculationData.utilityCompany}</p>
                    </div>
                    <div class="info-card">
                        <h3>Annual Consumption</h3>
                        <p>${(calculationData.monthlyKwh * 12).toLocaleString()} kWh</p>
                    </div>
                    <div class="info-card">
                        <h3>System Coverage</h3>
                        <p>${Math.round((calculationData.annualProductionKwh / (calculationData.monthlyKwh * 12)) * 100)}%</p>
                    </div>
                </div>
            </div>
            
            ${
              customerData.additionalNotes
                ? `
            <div class="section">
                <h2 class="section-title">Project Notes & Considerations</h2>
                <div class="info-card">
                    <p style="font-size: 1rem; line-height: 1.6;">${customerData.additionalNotes}</p>
                </div>
            </div>
            `
                : ""
            }
        </div>
        
        <div class="footer">
            <div class="company-info">
                <div class="company-name">Solar Grind</div>
                <p>Premium Solar Solutions & Professional Analysis</p>
            </div>
            
            <p>This enhanced report provides comprehensive analysis based on current market conditions, advanced modeling, and industry best practices.</p>
            
            <div class="disclaimer">
                <p><strong>Professional Disclaimer:</strong> This enhanced solar analysis represents a comprehensive assessment based on the information provided, current market conditions, advanced performance modeling, and industry best practices. While every effort has been made to ensure accuracy, actual results may vary based on weather patterns, energy usage changes, utility rate fluctuations, equipment performance variations, and other factors beyond our control.</p>
                
                <p><strong>Financial Projections:</strong> All financial projections are estimates based on current utility rates, available incentives, and historical performance data. Actual savings and payback periods may differ. Tax benefits are subject to individual tax situations and should be verified with a tax professional.</p>
                
                <p><strong>Performance Estimates:</strong> System performance estimates are based on industry-standard modeling tools and historical weather data. Actual production may vary due to weather conditions, shading changes, equipment degradation, and maintenance factors.</p>
                
                <p><strong>Next Steps:</strong> This report serves as a preliminary analysis. Final system design, specifications, and pricing will be determined through a detailed site assessment, engineering review, and formal proposal process. All warranties and guarantees are subject to manufacturer and installer terms and conditions.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `
}
