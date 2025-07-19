export interface SystemSizingInputs {
  // Location & Site
  address: string
  latitude: number
  longitude: number
  elevation: number
  climateData?: ClimateAnalysis

  // Roof & Shading
  roofAzimuth: number // degrees (180 = south)
  roofTilt: number // degrees
  roofType: "shingle" | "tile" | "metal" | "flat"
  roofCondition: "excellent" | "good" | "fair" | "needs_replacement"
  obstructions: string[] // ['trees', 'chimneys', 'dormers']

  // Energy & Lifestyle
  monthlyKwhUsage: number
  monthlyElectricityBill: number
  utilityProvider: string
  electricityRate: number // $/kWh
  offsetGoal: number // percentage (100, 80, 60)
  batteryStorage: boolean
  hasEV?: boolean
  hasPool?: boolean
  hasHotTub?: boolean

  // System Preferences (placeholders, not fully used yet)
  panelType?: "standard" | "premium" | "bifacial"
  inverterType?: "string" | "microinverter"
  homeSquareFootage: number
  homeAge: number
  ratePlan: string
  timeOfUseBilling: boolean
}

export interface ClimateAnalysis {
  averageIrradiance: number
  peakSunHours: number
  temperatureCorrectionFactor: number
  weatherAdjustmentFactor: number
  degradationRate: number
  seasonalVariation: number[]
  solarPotential: string
  climateZone: string
}

export interface SystemSizingResult {
  // Input Summary
  inputs: SystemSizingInputs

  // System specifications
  systemSizeKw: number
  panelCount: number
  panelWattage: number
  annualProductionKwh: number
  monthlyProductionKwh: number[]

  // Performance metrics
  performanceRatio: number
  capacityFactor: number
  performanceFactors: {
    irradiance: number
    shading: number
    tiltAndOrientation: number
    systemLosses: number
  }

  // Financial analysis
  systemCost: number
  costPerWatt: number
  federalTaxCredit: number
  netCost: number
  monthlyBillWithSolar: number
  monthlySavings: number
  annualSavings: number
  paybackPeriod: number
  roi25Year: number

  // Environmental impact
  co2OffsetTons: number
  treesEquivalent: number

  // 25-year projections
  yearlyProjections: Array<{
    year: number
    productionKwh: number
    savings: number
    cumulativeSavings: number
  }>

  // Equipment recommendations
  recommendations: {
    panelBrand: string
    panelModel: string
    inverterBrand: string
    inverterModel: string
    batteryModel?: string
  }

  // Warnings
  warnings: string[]
}

const PANEL_SPECS = {
  standard: { wattage: 400, efficiency: 0.2, costPerWatt: 2.8, brand: "Silfab", model: "Prime" },
  premium: { wattage: 430, efficiency: 0.22, costPerWatt: 3.2, brand: "Qcells", model: "G10+" },
  bifacial: { wattage: 450, efficiency: 0.23, costPerWatt: 3.5, brand: "REC", model: "Alpha Pure" },
}

const INVERTER_SPECS = {
  string: { efficiency: 0.97, brand: "SMA", model: "Sunny Boy" },
  microinverter: { efficiency: 0.98, brand: "Enphase", model: "IQ8+" },
}

export function calculateSystemSize(inputs: SystemSizingInputs): SystemSizingResult {
  // 1. Calculate Baseline Annual Energy Needs
  let annualKwhUsage = inputs.monthlyKwhUsage * 12
  if (annualKwhUsage === 0 && inputs.monthlyElectricityBill > 0 && inputs.electricityRate > 0) {
    annualKwhUsage = (inputs.monthlyElectricityBill / inputs.electricityRate) * 12
  }

  // 2. Adjust for Lifestyle
  if (inputs.hasEV) annualKwhUsage += 3000 // Avg. 3000 kWh/year for an EV
  if (inputs.hasPool) annualKwhUsage += 2500 // Avg. 2500 kWh/year for a pool pump
  if (inputs.hasHotTub) annualKwhUsage += 1500 // Avg. 1500 kWh/year for a hot tub

  const targetAnnualProduction = annualKwhUsage * (inputs.offsetGoal / 100)

  // 3. Determine Performance Factors
  const panelSpec = PANEL_SPECS[inputs.panelType || "standard"]
  const inverterSpec = INVERTER_SPECS[inputs.inverterType || "microinverter"]

  const peakSunHours = inputs.climateData?.peakSunHours || 4.5 // Fallback
  const irradianceFactor = peakSunHours / 365 // Convert daily sun hours to an annual factor

  const shadingLoss = calculateShadingLoss(inputs.obstructions)
  const shadingFactor = 1 - shadingLoss / 100

  const tiltAndOrientationFactor =
    calculateTiltAdjustment(inputs.roofTilt, inputs.latitude) * (1 - calculateDirectionalLoss(inputs.roofAzimuth) / 100)

  const systemLosses = 0.14 // Standard 14% loss for wiring, dirt, inverter inefficiency, etc.
  const systemLossesFactor = 1 - systemLosses

  const performanceRatio = shadingFactor * tiltAndOrientationFactor * systemLossesFactor

  // 4. Calculate System Size
  const requiredSystemSizeKw = targetAnnualProduction / (peakSunHours * 365 * performanceRatio)
  const panelCount = Math.ceil((requiredSystemSizeKw * 1000) / panelSpec.wattage)
  const finalSystemSizeKw = (panelCount * panelSpec.wattage) / 1000

  // 5. Calculate Production
  const annualProductionKwh = finalSystemSizeKw * peakSunHours * 365 * performanceRatio
  const monthlyProductionKwh = getDefaultSeasonalPattern().map((multiplier) => (annualProductionKwh / 12) * multiplier)

  // 6. Calculate Financials
  const systemCost = finalSystemSizeKw * 1000 * panelSpec.costPerWatt + (inputs.batteryStorage ? 15000 : 0)
  const federalTaxCredit = systemCost * 0.3
  const netCost = systemCost - federalTaxCredit
  const annualSavings = annualProductionKwh * inputs.electricityRate
  const monthlySavings = annualSavings / 12
  const monthlyBillWithSolar = Math.max(15, inputs.monthlyElectricityBill - monthlySavings) // Assume $15 grid connection fee
  const paybackPeriod = netCost > 0 && annualSavings > 0 ? netCost / annualSavings : 0
  const roi25Year = netCost > 0 ? ((annualSavings * 25 - netCost) / netCost) * 100 : 0

  // 7. Generate 25-Year Projections
  const yearlyProjections = []
  let cumulativeSavings = -netCost
  for (let year = 1; year <= 25; year++) {
    const degradation = Math.pow(1 - 0.005, year - 1) // 0.5% annual degradation
    const production = annualProductionKwh * degradation
    const savings = production * inputs.electricityRate * Math.pow(1.03, year - 1) // 3% utility rate escalation
    cumulativeSavings += savings
    yearlyProjections.push({
      year,
      productionKwh: Math.round(production),
      savings: Math.round(savings),
      cumulativeSavings: Math.round(cumulativeSavings),
    })
  }

  // 8. Environmental Impact
  const co2OffsetTons = annualProductionKwh * 0.000707 // EPA factor
  const treesEquivalent = co2OffsetTons * 16.5 // Equivalent trees planted

  // 9. Recommendations & Warnings
  const recommendations = {
    panelBrand: panelSpec.brand,
    panelModel: panelSpec.model,
    inverterBrand: inverterSpec.brand,
    inverterModel: inverterSpec.model,
    ...(inputs.batteryStorage && { batteryModel: "Tesla Powerwall 3" }),
  }
  const warnings = generateWarnings(inputs, { paybackPeriod, shadingLoss })

  return {
    inputs,
    systemSizeKw: Number.parseFloat(finalSystemSizeKw.toFixed(2)),
    panelCount,
    panelWattage: panelSpec.wattage,
    annualProductionKwh: Math.round(annualProductionKwh),
    monthlyProductionKwh: monthlyProductionKwh.map(Math.round),
    performanceRatio: Number.parseFloat(performanceRatio.toFixed(2)),
    capacityFactor: Number.parseFloat((annualProductionKwh / (finalSystemSizeKw * 8760)).toFixed(2)),
    performanceFactors: {
      irradiance: peakSunHours,
      shading: Number.parseFloat(shadingFactor.toFixed(2)),
      tiltAndOrientation: Number.parseFloat(tiltAndOrientationFactor.toFixed(2)),
      systemLosses: Number.parseFloat(systemLossesFactor.toFixed(2)),
    },
    systemCost: Math.round(systemCost),
    costPerWatt: Number.parseFloat(panelSpec.costPerWatt.toFixed(2)),
    federalTaxCredit: Math.round(federalTaxCredit),
    netCost: Math.round(netCost),
    monthlyBillWithSolar: Math.round(monthlyBillWithSolar),
    monthlySavings: Math.round(monthlySavings),
    annualSavings: Math.round(annualSavings),
    paybackPeriod: Number.parseFloat(paybackPeriod.toFixed(1)),
    roi25Year: Math.round(roi25Year),
    co2OffsetTons: Number.parseFloat(co2OffsetTons.toFixed(2)),
    treesEquivalent: Math.round(treesEquivalent),
    yearlyProjections,
    recommendations,
    warnings,
  }
}

// Helper functions
function calculateShadingLoss(obstructions: string[]): number {
  let loss = 0
  if (obstructions.includes("trees")) loss += 10
  if (obstructions.includes("chimneys")) loss += 3
  if (obstructions.includes("dormers")) loss += 5
  if (obstructions.includes("nearby_buildings")) loss += 12
  return Math.min(loss, 30) // Cap at 30%
}

function calculateTiltAdjustment(roofTilt: number, latitude: number): number {
  const optimalTilt = latitude
  const tiltDifference = Math.abs(roofTilt - optimalTilt)
  return Math.max(0.8, 1 - (tiltDifference / 90) * 0.2)
}

function calculateDirectionalLoss(azimuth: number): number {
  const deviationFromSouth = Math.abs(azimuth - 180)
  if (deviationFromSouth <= 20) return 0
  if (deviationFromSouth <= 45) return 5
  if (deviationFromSouth <= 90) return 15
  return 30
}

function getDefaultSeasonalPattern(): number[] {
  return [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]
}

function generateWarnings(
  inputs: SystemSizingInputs,
  results: { paybackPeriod: number; shadingLoss: number },
): string[] {
  const warnings: string[] = []
  if (inputs.roofCondition === "needs_replacement") {
    warnings.push("Roof replacement is highly recommended before solar installation.")
  }
  if (inputs.roofCondition === "fair") {
    warnings.push("A roof inspection is advised before proceeding.")
  }
  if (results.shadingLoss > 20) {
    warnings.push("High shading will significantly impact production. Consider tree trimming.")
  }
  if (results.paybackPeriod > 15) {
    warnings.push("The financial payback period is longer than average for your area.")
  }
  if (inputs.homeAge > 40) {
    warnings.push("An electrical panel upgrade may be required for a home of this age.")
  }
  return warnings
}
