import type { SolarCalculationResult } from "@/types/solar"

export interface EnhancedReportData {
  customerName: string
  customerEmail: string
  customerPhone?: string
  propertyAddress: string
  calculationResults: SolarCalculationResult
  analysisDate: string
  reportId: string
  propertyDetails?: {
    sqft?: number
    residents?: number
    roofType?: string
    roofCondition?: string
    shadingLevel?: string
    roofAge?: string
  }
  utilityCompany?: string
  hasPool?: boolean
  hasEV?: boolean
  planningAdditions?: boolean
}

export function generateEnhancedSolarReport(data: EnhancedReportData): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    propertyAddress,
    calculationResults,
    analysisDate,
    reportId,
    propertyDetails,
    utilityCompany,
    hasPool,
    hasEV,
    planningAdditions,
  } = data

  const {
    systemSizeKw,
    panelsNeeded,
    panelWattage,
    annualProductionKwh,
    systemCost,
    netCost,
    annualSavings,
    monthlySavings,
    roiYears,
    co2OffsetTons,
    treesEquivalent,
    peakSunHours,
    monthlyKwh,
    electricityRate,
  } = calculationResults

  // Calculate additional metrics
  const capacityFactor = ((annualProductionKwh / (systemSizeKw * 8760)) * 100).toFixed(1)
  const performanceRatio = (capacityFactor > 20 ? 85 : 80).toFixed(1)
  const systemEfficiency = (((panelWattage * panelsNeeded * 0.85) / (systemSizeKw * 1000)) * 100).toFixed(1)
  const costPerWatt = (systemCost / (systemSizeKw * 1000)).toFixed(2)
  const productionPerPanel = (annualProductionKwh / panelsNeeded).toFixed(0)
  const twentyFiveYearSavings = (annualSavings * 25 * 0.95).toFixed(0) // Account for degradation
  const monthlyProduction = (annualProductionKwh / 12).toFixed(0)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Solar Analysis Report - ${customerName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 900px;
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
            padding: 50px 40px;
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
            font-size: 3em;
            margin-bottom: 15px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.3em;
            opacity: 0.95;
            font-weight: 300;
        }
        
        .premium-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            border: 1px solid rgba(255,255,255,0.3);
        }
        
        .report-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 30px 40px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .report-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
        }
        
        .info-item {
            background: rgba(255,255,255,0.8);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #667eea;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .info-label {
            font-weight: 700;
            color: #495057;
            font-size: 0.85em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        
        .info-value {
            font-size: 1.15em;
            color: #212529;
            font-weight: 600;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 50px;
        }
        
        .section h2 {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 2.2em;
            margin-bottom: 25px;
            font-weight: 700;
            position: relative;
        }
        
        .section h2::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 60px;
            height: 4px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
        }
        
        .executive-summary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 20px;
            margin: 30px 0;
            position: relative;
            overflow: hidden;
        }
        
        .executive-summary::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 200px;
            height: 200px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
            transform: translate(50%, -50%);
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 25px;
            position: relative;
            z-index: 1;
        }
        
        .summary-item {
            text-align: center;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .summary-value {
            font-size: 2.5em;
            font-weight: 800;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .summary-label {
            opacity: 0.95;
            font-size: 1.1em;
            font-weight: 500;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .metric-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            padding: 30px;
            border-radius: 16px;
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
            height: 4px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
        }
        
        .metric-value {
            font-size: 2.2em;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 8px;
        }
        
        .metric-label {
            color: #6c757d;
            font-weight: 600;
            font-size: 1.05em;
        }
        
        .metric-description {
            color: #868e96;
            font-size: 0.9em;
            margin-top: 8px;
            line-height: 1.4;
        }
        
        .performance-section {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            padding: 35px;
            border-radius: 20px;
            border: 1px solid #90caf9;
            margin: 30px 0;
        }
        
        .environmental-section {
            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
            padding: 35px;
            border-radius: 20px;
            border: 1px solid #81c784;
            margin: 30px 0;
        }
        
        .financial-section {
            background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
            padding: 35px;
            border-radius: 20px;
            border: 1px solid #ffb74d;
            margin: 30px 0;
        }
        
        .section-title {
            font-size: 1.5em;
            font-weight: 700;
            margin-bottom: 20px;
            color: #333;
        }
        
        .specs-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .specs-table th,
        .specs-table td {
            padding: 15px 20px;
            text-align: left;
            border-bottom: 1px solid #f1f3f4;
        }
        
        .specs-table th {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
            font-size: 0.95em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .specs-table tr:hover {
            background: #f8f9fa;
        }
        
        .warranty-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 25px;
        }
        
        .warranty-item {
            background: rgba(255,255,255,0.9);
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #28a745;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .warranty-title {
            font-weight: 700;
            color: #28a745;
            margin-bottom: 8px;
        }
        
        .warranty-details {
            color: #495057;
            font-size: 0.95em;
            line-height: 1.4;
        }
        
        .financing-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            margin-top: 25px;
        }
        
        .financing-option {
            background: rgba(255,255,255,0.9);
            padding: 25px;
            border-radius: 15px;
            border: 2px solid #e9ecef;
            transition: all 0.3s ease;
        }
        
        .financing-option:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .financing-title {
            font-size: 1.3em;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .financing-details {
            color: #495057;
            line-height: 1.5;
        }
        
        .financing-highlight {
            background: #667eea;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: 600;
            display: inline-block;
            margin-top: 10px;
        }
        
        .footer {
            background: linear-gradient(135deg, #343a40 0%, #495057 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .footer-content {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .footer h3 {
            font-size: 1.5em;
            margin-bottom: 15px;
            font-weight: 700;
        }
        
        .footer p {
            margin-bottom: 15px;
            opacity: 0.9;
        }
        
        .disclaimer {
            font-size: 0.85em;
            opacity: 0.8;
            margin-top: 30px;
            line-height: 1.5;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .chart-placeholder {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            height: 300px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            font-weight: 600;
            border: 2px dashed #dee2e6;
            margin: 20px 0;
        }
        
        @media print {
            body { background: white; }
            .container { box-shadow: none; margin: 0; }
            .metric-card:hover { transform: none; }
            .financing-option:hover { transform: none; border-color: #e9ecef; }
        }
        
        @media (max-width: 768px) {
            .container { margin: 10px; }
            .header { padding: 30px 20px; }
            .content { padding: 20px; }
            .header h1 { font-size: 2.2em; }
            .section h2 { font-size: 1.8em; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="premium-badge">ENHANCED REPORT</div>
            <div class="header-content">
                <h1>Solar Analysis Report</h1>
                <p>Professional Solar Energy Assessment & Financial Analysis</p>
            </div>
        </div>
        
        <div class="report-info">
            <div class="report-info-grid">
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
                    <div class="info-label">Analysis Date</div>
                    <div class="info-value">${analysisDate}</div>
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
                <div class="executive-summary">
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-value">$${monthlySavings.toLocaleString()}</div>
                            <div class="summary-label">Monthly Savings</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">$${annualSavings.toLocaleString()}</div>
                            <div class="summary-label">Annual Savings</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${roiYears}</div>
                            <div class="summary-label">Payback Period (Years)</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${systemSizeKw}</div>
                            <div class="summary-label">System Size (kW)</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">${capacityFactor}%</div>
                            <div class="summary-label">Capacity Factor</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-value">$${twentyFiveYearSavings}</div>
                            <div class="summary-label">25-Year Savings</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Advanced Performance Metrics</h2>
                <div class="performance-section">
                    <div class="section-title">System Performance Analysis</div>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">${capacityFactor}%</div>
                            <div class="metric-label">Capacity Factor</div>
                            <div class="metric-description">Ratio of actual vs. theoretical maximum energy output</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${performanceRatio}%</div>
                            <div class="metric-label">Performance Ratio</div>
                            <div class="metric-description">System efficiency accounting for real-world conditions</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${systemEfficiency}%</div>
                            <div class="metric-label">System Efficiency</div>
                            <div class="metric-description">Overall system conversion efficiency</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">$${costPerWatt}</div>
                            <div class="metric-label">Cost per Watt</div>
                            <div class="metric-description">System cost normalized per watt of capacity</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${productionPerPanel}</div>
                            <div class="metric-label">kWh per Panel/Year</div>
                            <div class="metric-description">Annual energy production per solar panel</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${monthlyProduction}</div>
                            <div class="metric-label">Monthly Production (kWh)</div>
                            <div class="metric-description">Average monthly energy generation</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Detailed System Specifications</h2>
                <table class="specs-table">
                    <thead>
                        <tr>
                            <th>Specification</th>
                            <th>Value</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>System Size</strong></td>
                            <td>${systemSizeKw} kW DC</td>
                            <td>Total system capacity</td>
                        </tr>
                        <tr>
                            <td><strong>Number of Panels</strong></td>
                            <td>${panelsNeeded} panels</td>
                            <td>High-efficiency monocrystalline</td>
                        </tr>
                        <tr>
                            <td><strong>Panel Wattage</strong></td>
                            <td>${panelWattage}W each</td>
                            <td>Premium tier solar panels</td>
                        </tr>
                        <tr>
                            <td><strong>Annual Production</strong></td>
                            <td>${annualProductionKwh.toLocaleString()} kWh</td>
                            <td>First year estimated production</td>
                        </tr>
                        <tr>
                            <td><strong>Peak Sun Hours</strong></td>
                            <td>${peakSunHours} hours/day</td>
                            <td>Average daily solar irradiance</td>
                        </tr>
                        <tr>
                            <td><strong>Current Usage</strong></td>
                            <td>${monthlyKwh} kWh/month</td>
                            <td>Based on utility bill analysis</td>
                        </tr>
                        <tr>
                            <td><strong>System Coverage</strong></td>
                            <td>${((annualProductionKwh / (monthlyKwh * 12)) * 100).toFixed(0)}%</td>
                            <td>Percentage of usage covered by solar</td>
                        </tr>
                        ${
                          utilityCompany
                            ? `
                        <tr>
                            <td><strong>Utility Company</strong></td>
                            <td>${utilityCompany}</td>
                            <td>Current electricity provider</td>
                        </tr>
                        `
                            : ""
                        }
                    </tbody>
                </table>
            </div>
            
            ${
              propertyDetails
                ? `
            <div class="section">
                <h2>Site Assessment</h2>
                <div class="performance-section">
                    <div class="section-title">Property Analysis</div>
                    <div class="metrics-grid">
                        ${
                          propertyDetails.sqft
                            ? `
                        <div class="metric-card">
                            <div class="metric-value">${propertyDetails.sqft.toLocaleString()}</div>
                            <div class="metric-label">Property Size (sq ft)</div>
                            <div class="metric-description">Total property square footage</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          propertyDetails.residents
                            ? `
                        <div class="metric-card">
                            <div class="metric-value">${propertyDetails.residents}</div>
                            <div class="metric-label">Residents</div>
                            <div class="metric-description">Number of people in household</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          propertyDetails.roofType
                            ? `
                        <div class="metric-card">
                            <div class="metric-value">${propertyDetails.roofType.replace("_", " ").toUpperCase()}</div>
                            <div class="metric-label">Roof Type</div>
                            <div class="metric-description">Roof material and structure</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          propertyDetails.roofCondition
                            ? `
                        <div class="metric-card">
                            <div class="metric-value">${propertyDetails.roofCondition.toUpperCase()}</div>
                            <div class="metric-label">Roof Condition</div>
                            <div class="metric-description">Current roof state assessment</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          propertyDetails.shadingLevel
                            ? `
                        <div class="metric-card">
                            <div class="metric-value">${propertyDetails.shadingLevel.toUpperCase()}</div>
                            <div class="metric-label">Shading Level</div>
                            <div class="metric-description">Site shading analysis</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          propertyDetails.roofAge
                            ? `
                        <div class="metric-card">
                            <div class="metric-value">${propertyDetails.roofAge}</div>
                            <div class="metric-label">Roof Age</div>
                            <div class="metric-description">Years since roof installation</div>
                        </div>
                        `
                            : ""
                        }
                    </div>
                    
                    <div class="section-title" style="margin-top: 30px;">Additional Considerations</div>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">${hasPool ? "YES" : "NO"}</div>
                            <div class="metric-label">Swimming Pool</div>
                            <div class="metric-description">Pool equipment increases energy usage</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${hasEV ? "YES" : "NO"}</div>
                            <div class="metric-label">Electric Vehicle</div>
                            <div class="metric-description">EV charging impacts system sizing</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${planningAdditions ? "YES" : "NO"}</div>
                            <div class="metric-label">Planned Additions</div>
                            <div class="metric-description">Future home expansions considered</div>
                        </div>
                    </div>
                </div>
            </div>
            `
                : ""
            }
            
            <div class="section">
                <h2>Financial Analysis</h2>
                <div class="financial-section">
                    <div class="section-title">Investment Overview</div>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">$${systemCost.toLocaleString()}</div>
                            <div class="metric-label">Total System Cost</div>
                            <div class="metric-description">Before incentives and rebates</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">$${netCost.toLocaleString()}</div>
                            <div class="metric-label">Net Investment</div>
                            <div class="metric-description">After 30% federal tax credit</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${((annualSavings / netCost) * 100).toFixed(1)}%</div>
                            <div class="metric-label">Annual ROI</div>
                            <div class="metric-description">Return on investment percentage</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">$${(electricityRate * 100).toFixed(1)}¢</div>
                            <div class="metric-label">Current Rate</div>
                            <div class="metric-description">Per kWh electricity cost</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">$${(annualSavings * 10).toLocaleString()}</div>
                            <div class="metric-label">10-Year Savings</div>
                            <div class="metric-description">Cumulative savings projection</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">$${twentyFiveYearSavings}</div>
                            <div class="metric-label">25-Year Savings</div>
                            <div class="metric-description">Lifetime system savings</div>
                        </div>
                    </div>
                    
                    <div class="section-title" style="margin-top: 30px;">Financing Options</div>
                    <div class="financing-options">
                        <div class="financing-option">
                            <div class="financing-title">Cash Purchase</div>
                            <div class="financing-details">
                                <p><strong>Total Investment:</strong> $${netCost.toLocaleString()}</p>
                                <p><strong>Monthly Savings:</strong> $${monthlySavings}</p>
                                <p><strong>Payback Period:</strong> ${roiYears} years</p>
                                <p>Maximize your savings with full ownership and all available incentives.</p>
                                <div class="financing-highlight">Best Long-term Value</div>
                            </div>
                        </div>
                        <div class="financing-option">
                            <div class="financing-title">Solar Loan (20 years)</div>
                            <div class="financing-details">
                                <p><strong>Down Payment:</strong> $0 - $${(netCost * 0.2).toLocaleString()}</p>
                                <p><strong>Est. Monthly Payment:</strong> $${Math.round(netCost * 0.006)}</p>
                                <p><strong>Net Monthly Savings:</strong> $${Math.max(0, monthlySavings - Math.round(netCost * 0.006))}</p>
                                <p>Start saving immediately with low-interest solar financing.</p>
                                <div class="financing-highlight">Immediate Savings</div>
                            </div>
                        </div>
                        <div class="financing-option">
                            <div class="financing-title">Solar Lease/PPA</div>
                            <div class="financing-details">
                                <p><strong>Down Payment:</strong> $0</p>
                                <p><strong>Est. Monthly Payment:</strong> $${Math.round(monthlySavings * 0.8)}</p>
                                <p><strong>Immediate Savings:</strong> $${Math.round(monthlySavings * 0.2)}</p>
                                <p>Go solar with no upfront costs and predictable monthly payments.</p>
                                <div class="financing-highlight">No Money Down</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Environmental Impact</h2>
                <div class="environmental-section">
                    <div class="section-title">Sustainability Benefits</div>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">${co2OffsetTons}</div>
                            <div class="metric-label">Annual CO₂ Offset (tons)</div>
                            <div class="metric-description">Equivalent to removing a car from the road</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${treesEquivalent}</div>
                            <div class="metric-label">Trees Planted Equivalent</div>
                            <div class="metric-description">Annual environmental benefit</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${(co2OffsetTons * 25).toFixed(0)}</div>
                            <div class="metric-label">25-Year CO₂ Offset (tons)</div>
                            <div class="metric-description">Lifetime carbon footprint reduction</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${(treesEquivalent * 25).toFixed(0)}</div>
                            <div class="metric-label">Lifetime Tree Equivalent</div>
                            <div class="metric-description">25-year environmental impact</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${(annualProductionKwh * 0.0007 * 25).toFixed(1)}</div>
                            <div class="metric-label">Coal Avoided (tons)</div>
                            <div class="metric-description">25-year coal consumption offset</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${Math.round((annualProductionKwh * 25) / 1000)}</div>
                            <div class="metric-label">Clean Energy (MWh)</div>
                            <div class="metric-description">25-year clean energy production</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Warranty & Performance Guarantees</h2>
                <div class="performance-section">
                    <div class="section-title">Comprehensive Coverage</div>
                    <div class="warranty-grid">
                        <div class="warranty-item">
                            <div class="warranty-title">Solar Panel Warranty</div>
                            <div class="warranty-details">
                                <strong>25-Year Performance:</strong> 85% power output guarantee<br>
                                <strong>12-Year Product:</strong> Manufacturing defects coverage<br>
                                <strong>Linear Degradation:</strong> Maximum 0.55% annually
                            </div>
                        </div>
                        <div class="warranty-item">
                            <div class="warranty-title">Inverter Warranty</div>
                            <div class="warranty-details">
                                <strong>12-Year Standard:</strong> Full replacement coverage<br>
                                <strong>25-Year Extended:</strong> Available upgrade option<br>
                                <strong>Monitoring:</strong> Real-time performance tracking
                            </div>
                        </div>
                        <div class="warranty-item">
                            <div class="warranty-title">Installation Warranty</div>
                            <div class="warranty-details">
                                <strong>10-Year Workmanship:</strong> Installation quality guarantee<br>
                                <strong>Roof Penetration:</strong> Leak-proof installation<br>
                                <strong>System Performance:</strong> Production guarantee
                            </div>
                        </div>
                        <div class="warranty-item">
                            <div class="warranty-title">Monitoring & Maintenance</div>
                            <div class="warranty-details">
                                <strong>25-Year Monitoring:</strong> System performance tracking<br>
                                <strong>Annual Inspection:</strong> Professional system check<br>
                                <strong>Cleaning Service:</strong> Optional maintenance package
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>Market Analysis</h2>
                <div class="financial-section">
                    <div class="section-title">Competitive Positioning</div>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">$${costPerWatt}</div>
                            <div class="metric-label">Cost per Watt</div>
                            <div class="metric-description">Market average: $2.85/W (Excellent value)</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${capacityFactor}%</div>
                            <div class="metric-label">Capacity Factor</div>
                            <div class="metric-description">National average: 24.5% (Above average)</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${roiYears} yrs</div>
                            <div class="metric-label">Payback Period</div>
                            <div class="metric-description">Market average: 8-12 years (Competitive)</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${performanceRatio}%</div>
                            <div class="metric-label">Performance Ratio</div>
                            <div class="metric-description">Industry standard: 75-85% (Excellent)</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-content">
                <h3>The Solar Grind</h3>
                <p><strong>Professional Solar Analysis & Design</strong></p>
                <p>Report generated on ${analysisDate} | Report ID: ${reportId}</p>
                <p>This enhanced analysis provides comprehensive technical and financial insights for your solar investment decision.</p>
                
                <div class="disclaimer">
                    <p><strong>Important Disclaimer:</strong> This enhanced analysis is based on current utility rates, available incentives, estimated solar production, and market data. Actual results may vary based on weather conditions, system performance, changes in utility rates, equipment specifications, installation factors, and other variables. Performance projections include estimated system degradation over time. Financial projections assume current electricity rates and available incentives, which may change. This report is for informational purposes only and should not be considered as financial or investment advice. Please consult with qualified solar professionals for detailed system design, final pricing, and installation specifications. All warranty information is subject to manufacturer terms and conditions.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `
}
