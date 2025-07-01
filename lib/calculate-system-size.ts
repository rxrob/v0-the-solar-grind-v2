export interface SystemSizingInputs {
  // Home Info
  zipCode: string
  homeSquareFootage: number
  homeAge: number
  roofAzimuth: number // degrees (180 = south)
  roofTilt: number // degrees
  roofType: "shingle" | "tile" | "metal" | "flat"
  roofCondition: "excellent" | "good" | "fair" | "needs_replacement"
  obstructions: string[] // ['trees', 'chimneys', 'dormers']

  // Usage Info
  monthlyKwhUsage: number
  monthlyElectricityBill: number
  seasonalPatterns?: number[] // 12 months of usage multipliers

  // Billing
  utilityProvider: string
  ratePlan: string
  timeOfUseBilling: boolean
  electricityRate: number // $/kWh

  // Preferences
  offsetGoal: number // percentage (100, 80, 60)
  batteryStorage: boolean // Tesla Powerwall 3

  // Location data (from previous steps)
  address: string
  latitude: number
  longitude: number
  elevation?: number

  // Energy usage
  annualUsage?: number

  // Property details
  roofArea?: number
  roofOrientation?: string
  shadingLevel?: string

  // System preferences
  panelType?: string
  panelWattage?: number
  inverterType?: string
  batteryBackup?: boolean
  batteryCapacity?: number

  // Financial
  utilityRateEscalation?: number
  systemCostPerWatt?: number
  federalTaxCredit?: number
  stateIncentives?: number

  // Climate data (from Step 4)
  climateData?: ClimateAnalysis
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

export interface SystemCostBreakdown {
  // Equipment Costs
  solarPanels: {
    quantity: number
    unitCost: number
    totalCost: number
    description: string
  }
  microinverters: {
    quantity: number
    unitCost: number
    totalCost: number
    description: string
  }
  racking: {
    totalCost: number
    description: string
  }
  electricalComponents: {
    totalCost: number
    description: string
  }

  // Professional Services
  design: {
    totalCost: number
    description: string
  }
  permits: {
    totalCost: number
    description: string
  }
  installation: {
    totalCost: number
    description: string
  }
  inspection: {
    totalCost: number
    description: string
  }

  // Optional
  battery?: {
    quantity: number
    unitCost: number
    totalCost: number
    description: string
  }

  // Totals
  equipmentSubtotal: number
  laborSubtotal: number
  totalSystemCost: number
  pricePerWatt: number
}

export interface SystemSizingResult {
  // System specifications
  systemSizeKw: number
  panelCount: number
  panelWattage: number
  inverterCount: number
  annualProductionKwh: number
  monthlyProductionKwh: number

  // Performance metrics
  peakSunHours: number
  systemEfficiency: number
  capacityFactor: number
  performanceRatio: number

  // Financial analysis
  systemCost: number
  costPerWatt: number
  federalTaxCredit: number
  netCost: number
  currentMonthlyBill: number
  monthlyBillWithSolar: number
  monthlySavings: number
  annualSavings: number
  paybackPeriod: number

  // Environmental impact
  co2OffsetTons: number
  treesEquivalent: number

  // Detailed cost breakdown
  costBreakdown: {
    solarPanels: { quantity: number; unitCost: number; totalCost: number }
    microinverters: { quantity: number; unitCost: number; totalCost: number }
    racking: { totalCost: number }
    electricalComponents: { totalCost: number }
    installation: { totalCost: number }
    permits: { totalCost: number }
    battery?: { quantity: number; unitCost: number; totalCost: number }
  }

  // 15-year projections
  yearlyProjections: Array<{
    year: number
    annualSavings: number
    cumulativeSavings: number
    billWithoutSolar: number
    billWithSolar: number
    systemValue: number
  }>

  // Equipment recommendations
  recommendations: {
    panelBrand: string
    panelModel: string
    inverterBrand: string
    inverterModel: string
    rackingSystem: string
    monitoringSystem: string
    warranty: {
      panels: string
      inverters: string
      workmanship: string
    }
  }

  // Site analysis
  siteAnalysis: {
    roofSuitability: string
    shadingAssessment: string
    structuralRequirements: string
    electricalUpgrades: string
    permittingComplexity: string
  }
}

export function calculateSystemSize(inputs: SystemSizingInputs): SystemSizingResult {
  // 1. Standard equipment specifications
  const panelSpecs = {
    wattage: inputs.panelWattage || 440,
    brand: "Silfab",
    model: "SIL-440 BK",
    efficiency: 21.2,
    dimensions: "82.7 x 41.4 inches",
  }

  const inverterSpecs = {
    model: inputs.inverterType || "Enphase IQ8+ MC",
    efficiency: 0.975, // 97.5% efficiency
    maxPanelsPerInverter: 1, // Microinverters - one per panel
  }

  // 2. Use climate data if available, otherwise use defaults
  const avgDailySunHours = inputs.climateData?.peakSunHours || calculatePeakSunHours(inputs.latitude, inputs.longitude)
  const temperatureCorrection = inputs.climateData?.temperatureCorrectionFactor || 1.0
  const weatherAdjustment = inputs.climateData?.weatherAdjustmentFactor || 1.0
  const seasonalPattern =
    inputs.climateData?.seasonalVariation || inputs.seasonalPatterns || getDefaultSeasonalPattern()

  const panelEfficiencyFactor = 0.78 // Higher with microinverters

  // 3. Calculate base system size needed
  const targetMonthlyKwh = inputs.monthlyKwhUsage * (inputs.offsetGoal / 100)
  const baseSizeKw = targetMonthlyKwh / avgDailySunHours / 30 / panelEfficiencyFactor

  // 4. Calculate performance adjustments
  const shadingLoss = calculateShadingLoss(inputs.obstructions)
  const tiltAdjustment = calculateTiltAdjustment(inputs.roofTilt || inputs.latitude, inputs.latitude)
  const directionalLoss = calculateDirectionalLoss(inputs.roofAzimuth)
  const inverterEfficiency = inverterSpecs.efficiency

  // 5. Apply climate adjustments
  const climateAdjustment = temperatureCorrection * weatherAdjustment

  // 6. Adjust system size for losses (microinverters handle shading better)
  const shadingAdjustment = inputs.batteryStorage ? 0.7 : 0.8 // Microinverters reduce shading impact
  const effectiveShadingLoss = shadingLoss * shadingAdjustment

  const totalSystemEfficiency =
    (1 - effectiveShadingLoss / 100) *
    tiltAdjustment *
    (1 - directionalLoss / 100) *
    inverterEfficiency *
    climateAdjustment

  const adjustedSizeKw = baseSizeKw / totalSystemEfficiency

  // 7. Calculate panel count (round to nearest panel)
  const panelCount = Math.ceil((adjustedSizeKw * 1000) / panelSpecs.wattage)
  const finalSystemSizeKw = (panelCount * panelSpecs.wattage) / 1000

  // 8. Calculate inverter count (1:1 with microinverters)
  const inverterCount = panelCount

  // 9. Calculate annual production with climate data
  const annualProductionKwh = finalSystemSizeKw * avgDailySunHours * 365 * totalSystemEfficiency

  // 10. Calculate monthly production (with climate-based seasonal adjustments)
  const monthlyProductionKwh = calculateMonthlyProduction(annualProductionKwh, seasonalPattern)

  // 11. Calculate detailed cost breakdown at $3.55/W
  const costBreakdown = calculateDetailedSystemCost(finalSystemSizeKw, panelCount, inputs.batteryStorage)
  const systemCost = costBreakdown.totalSystemCost

  const federalTaxCredit = (inputs.federalTaxCredit || 0.3) * systemCost // 30% federal tax credit
  const netCost = systemCost - federalTaxCredit - (inputs.stateIncentives || 0)
  const annualSavings = annualProductionKwh * inputs.electricityRate
  const paybackPeriod = netCost / annualSavings

  // 12. Calculate actual offset percentage
  const offsetPercentage = Math.min((annualProductionKwh / (inputs.monthlyKwhUsage * 12)) * 100, 100)

  // 13. Battery information
  const batteryInfo = inputs.batteryStorage
    ? {
        model: "Tesla Powerwall 3",
        capacity: "13.5 kWh usable",
        count: calculatePowerwallCount(inputs.monthlyKwhUsage),
      }
    : undefined

  // 14. Calculate bill comparison and 15-year projections
  const billComparison = calculateBillComparison(
    inputs.monthlyElectricityBill,
    inputs.monthlyKwhUsage,
    annualProductionKwh,
    inputs.electricityRate,
    netCost,
    inputs.climateData?.degradationRate || 0.5,
  )

  // 15. Generate recommendations and warnings
  const recommendations = generateRecommendations(inputs, {
    systemSizeKw: finalSystemSizeKw,
    shadingLoss: effectiveShadingLoss,
    directionalLoss,
    paybackPeriod,
    offsetPercentage,
    monthlySavings: billComparison.monthlySavings,
    climateData: inputs.climateData,
  })

  const warnings = generateWarnings(inputs, {
    roofCondition: inputs.roofCondition,
    shadingLoss: effectiveShadingLoss,
    directionalLoss,
    paybackPeriod,
    climateData: inputs.climateData,
  })

  // Performance metrics
  const capacityFactor = annualProductionKwh / (finalSystemSizeKw * 8760)
  const performanceRatio = totalSystemEfficiency

  // Environmental impact
  const co2OffsetTons = Math.round(annualProductionKwh * 0.0004 * 100) / 100
  const treesEquivalent = Math.round(co2OffsetTons * 16)

  // Site analysis
  const siteAnalysis = {
    roofSuitability: assessRoofSuitability(inputs),
    shadingAssessment: assessShading(inputs.shadingLevel),
    structuralRequirements: "Standard residential installation",
    electricalUpgrades: assessElectricalUpgrades(finalSystemSizeKw),
    permittingComplexity: "Standard residential permitting",
  }

  return {
    // System Specifications
    systemSizeKw: Math.round(finalSystemSizeKw * 10) / 10,
    panelCount,
    panelWattage: panelSpecs.wattage,
    inverterCount,
    annualProductionKwh: Math.round(annualProductionKwh),
    monthlyProductionKwh: monthlyProductionKwh.map((m) => Math.round(m)),

    // Performance metrics
    peakSunHours: Math.round(avgDailySunHours * 10) / 10,
    systemEfficiency: Math.round(totalSystemEfficiency * 100) / 100,
    capacityFactor: Math.round(capacityFactor * 100) / 100,
    performanceRatio: Math.round(performanceRatio * 100) / 100,

    // Financial Analysis
    systemCost: Math.round(systemCost),
    costPerWatt: Math.round((systemCost / (finalSystemSizeKw * 1000)) * 100) / 100,
    federalTaxCredit: Math.round(federalTaxCredit),
    netCost: Math.round(netCost),
    currentMonthlyBill: billComparison.currentMonthlyBill,
    monthlyBillWithSolar: billComparison.monthlyBillWithSolar,
    monthlySavings: billComparison.monthlySavings,
    annualSavings: Math.round(annualSavings),
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,

    // Environmental impact
    co2OffsetTons,
    treesEquivalent,

    // Detailed cost breakdown
    costBreakdown,

    // 15-year projections
    yearlyProjections: billComparison.yearlyProjections,

    // Equipment recommendations
    recommendations,

    // Site analysis
    siteAnalysis,
  }
}

function calculateDetailedSystemCost(
  systemSizeKw: number,
  panelCount: number,
  batteryStorage: boolean,
): SystemCostBreakdown {
  // Equipment Costs
  const solarPanels = {
    quantity: panelCount,
    unitCost: 280, // $280 per Silfab 440W panel
    totalCost: panelCount * 280,
    description: "Silfab SIL-440 BK Solar Panels (440W, 21.2% efficiency)",
  }

  const microinverters = {
    quantity: panelCount,
    unitCost: 220, // $220 per Enphase IQ8+ MC
    totalCost: panelCount * 220,
    description: "Enphase IQ8+ MC Microinverters (97% efficiency, panel-level monitoring)",
  }

  const racking = {
    totalCost: Math.round(systemSizeKw * 150), // $150/kW for racking system
    description: "IronRidge XR rail mounting system with grounding hardware",
  }

  const electricalComponents = {
    totalCost: Math.round(systemSizeKw * 200), // $200/kW for electrical
    description: "Production meter, disconnect switches, conduit, wiring, and electrical components",
  }

  // Professional Services
  const design = {
    totalCost: 750, // Fixed design cost
    description: "Engineering design, CAD drawings, and structural analysis",
  }

  const permits = {
    totalCost: 1250, // Fixed permit cost
    description: "Building permits, utility interconnection, and inspection fees",
  }

  const installation = {
    totalCost: Math.round(systemSizeKw * 800), // $800/kW for installation labor
    description: "Professional installation, roof work, electrical connections, and commissioning",
  }

  const inspection = {
    totalCost: 250, // Fixed inspection cost
    description: "Final inspection, testing, and system activation",
  }

  // Calculate subtotals
  const equipmentSubtotal =
    solarPanels.totalCost + microinverters.totalCost + racking.totalCost + electricalComponents.totalCost
  const laborSubtotal = design.totalCost + permits.totalCost + installation.totalCost + inspection.totalCost

  // Optional battery storage
  let battery: SystemCostBreakdown["battery"] | undefined
  if (batteryStorage) {
    const powerwallCount = calculatePowerwallCount(systemSizeKw * 100) // Rough estimate
    battery = {
      quantity: powerwallCount,
      unitCost: 16500, // $16,500 per Powerwall 3 installed
      totalCost: powerwallCount * 16500,
      description: "Tesla Powerwall 3 (13.5 kWh usable, backup power, storm watch)",
    }
  }

  const totalSystemCost = equipmentSubtotal + laborSubtotal + (battery?.totalCost || 0)
  const pricePerWatt = totalSystemCost / (systemSizeKw * 1000)

  return {
    solarPanels,
    microinverters,
    racking,
    electricalComponents,
    design,
    permits,
    installation,
    inspection,
    battery,
    equipmentSubtotal,
    laborSubtotal,
    totalSystemCost,
    pricePerWatt: Math.round(pricePerWatt * 100) / 100,
  }
}

function calculateBillComparison(
  currentMonthlyBill: number,
  monthlyKwhUsage: number,
  annualProductionKwh: number,
  electricityRate: number,
  systemCost: number,
  degradationRate = 0.5,
) {
  const monthlyProductionKwh = annualProductionKwh / 12
  const remainingUsageKwh = Math.max(0, monthlyKwhUsage - monthlyProductionKwh)
  const monthlyBillWithSolar = Math.max(15, remainingUsageKwh * electricityRate + 15) // $15 connection fee
  const monthlySavings = currentMonthlyBill - monthlyBillWithSolar

  // Calculate 15-year projections with utility rate escalation
  const yearlyProjections = []
  let cumulativeSavings = -systemCost // Start with negative (investment cost)

  for (let year = 1; year <= 15; year++) {
    // Calculate escalated electricity rate (3.5% annual increase)
    const escalatedRate = electricityRate * Math.pow(1.035, year - 1)

    // Calculate panel degradation (panels produce less over time)
    const panelEfficiency = 1 - (degradationRate / 100) * (year - 1)
    const adjustedProduction = annualProductionKwh * panelEfficiency
    const adjustedMonthlyProduction = adjustedProduction / 12
    const adjustedRemainingUsage = Math.max(0, monthlyKwhUsage - adjustedMonthlyProduction)

    // Bills without solar (full usage at escalated rate)
    const billWithoutSolar = (monthlyKwhUsage * escalatedRate + 15) * 12

    // Bills with solar (remaining usage at escalated rate + connection fee)
    const billWithSolar = (adjustedRemainingUsage * escalatedRate + 15) * 12

    // Annual savings
    const annualSavings = billWithoutSolar - billWithSolar

    // Cumulative savings (including initial investment)
    cumulativeSavings += annualSavings

    yearlyProjections.push({
      year,
      annualSavings: Math.round(annualSavings),
      cumulativeSavings: Math.round(cumulativeSavings),
      billWithoutSolar: Math.round(billWithoutSolar),
      billWithSolar: Math.round(billWithSolar),
      systemValue: Math.round(systemCost * (1 - year * 0.08)), // Simplified depreciation
    })
  }

  return {
    currentMonthlyBill: Math.round(currentMonthlyBill),
    monthlyBillWithSolar: Math.round(monthlyBillWithSolar),
    monthlySavings: Math.round(monthlySavings),
    yearlyProjections,
  }
}

function calculateShadingLoss(obstructions: string[]): number {
  let shadingLoss = 0

  if (obstructions.includes("trees")) shadingLoss += 8
  if (obstructions.includes("chimneys")) shadingLoss += 3
  if (obstructions.includes("dormers")) shadingLoss += 5
  if (obstructions.includes("nearby_buildings")) shadingLoss += 12
  if (obstructions.includes("power_lines")) shadingLoss += 2

  return Math.min(shadingLoss, 25) // Cap at 25% max shading loss
}

function calculateTiltAdjustment(roofTilt: number, latitude: number): number {
  // Optimal tilt is approximately equal to latitude
  const optimalTilt = latitude
  const tiltDifference = Math.abs(roofTilt - optimalTilt)

  // Calculate adjustment factor (1.0 = optimal, decreases with deviation)
  if (tiltDifference <= 15) return 1.0
  if (tiltDifference <= 30) return 0.95
  if (tiltDifference <= 45) return 0.88
  return 0.8
}

function calculateDirectionalLoss(azimuth: number): number {
  // South (180°) is optimal (0% loss)
  const deviationFromSouth = Math.abs(azimuth - 180)

  if (deviationFromSouth <= 15) return 0 // Perfect south
  if (deviationFromSouth <= 30) return 2 // SE/SW
  if (deviationFromSouth <= 45) return 5 // ESE/WSW
  if (deviationFromSouth <= 90) return 15 // E/W
  if (deviationFromSouth <= 135) return 25 // ENE/WNW
  return 35 // North-facing
}

function calculatePowerwallCount(monthlyKwh: number): number {
  // Tesla Powerwall 3 has 13.5 kWh usable capacity
  // Recommend 1 Powerwall for every 1000 kWh monthly usage
  const dailyKwh = monthlyKwh / 30
  const backupHours = 8 // 8 hours of backup power
  const neededCapacity = (dailyKwh / 24) * backupHours

  return Math.max(1, Math.ceil(neededCapacity / 13.5))
}

function calculateMonthlyProduction(annualKwh: number, seasonalPattern: number[]): number[] {
  return seasonalPattern.map((multiplier) => (annualKwh / 12) * multiplier)
}

function getDefaultSeasonalPattern(): number[] {
  // Seasonal solar production multipliers (Jan-Dec)
  return [0.7, 0.8, 1.0, 1.2, 1.3, 1.4, 1.4, 1.3, 1.1, 0.9, 0.7, 0.6]
}

function generateRecommendations(inputs: SystemSizingInputs, results: any): any {
  const recommendations: any = {}

  if (results.offsetPercentage >= 95) {
    recommendations.panelBrand = "Silfab"
    recommendations.panelModel = "SIL-440 BK"
    recommendations.inverterBrand = "Enphase"
    recommendations.inverterModel = "IQ8+ MC"
    recommendations.rackingSystem = "IronRidge XR Rail System"
    recommendations.monitoringSystem = "Enphase Enlighten"
    recommendations.warranty = {
      panels: "25-year product and performance warranty",
      inverters: "25-year warranty with Enphase",
      workmanship: "10-year installation warranty",
    }
  }

  return recommendations
}

function generateWarnings(inputs: SystemSizingInputs, results: any): string[] {
  const warnings: string[] = []

  if (inputs.roofCondition === "needs_replacement") {
    warnings.push("⚠️ Roof replacement recommended before installing Silfab panels")
  } else if (inputs.roofCondition === "fair") {
    warnings.push("⚠️ Roof inspection recommended before Silfab panel installation")
  }

  if (results.shadingLoss > 20) {
    warnings.push("⚠️ High shading detected - even with IQ8+ microinverters, production may be reduced")
  }

  if (results.directionalLoss > 25) {
    warnings.push("⚠️ Poor roof orientation - consider alternative installation locations")
  }

  if (results.paybackPeriod > 15) {
    warnings.push("⚠️ Long payback period - solar may not be financially beneficial at this location")
  }

  if (inputs.homeAge > 30) {
    warnings.push("⚠️ Older home - electrical panel upgrade may be required for Enphase microinverters")
  }

  // Climate-based warnings
  if (results.climateData) {
    if (results.climateData.solarPotential === "Poor" || results.climateData.solarPotential === "Fair") {
      warnings.push("⚠️ Climate analysis shows limited solar potential - consider system optimization")
    }
    if (results.climateData.degradationRate > 0.6) {
      warnings.push("⚠️ Climate conditions may cause higher panel degradation - factor into long-term planning")
    }
  }

  return warnings
}

function calculatePeakSunHours(latitude: number, longitude: number): number {
  // Simplified peak sun hours calculation based on latitude
  // This would typically use NREL data or more sophisticated calculations
  const absLatitude = Math.abs(latitude)

  if (absLatitude < 25) return 6.5 // Tropical regions
  if (absLatitude < 35) return 5.8 // Subtropical regions
  if (absLatitude < 45) return 5.2 // Temperate regions
  return 4.5 // Northern regions
}

function assessRoofSuitability(inputs: SystemSizingInputs): string {
  const orientation = inputs.roofOrientation?.toLowerCase()

  if (orientation?.includes("south")) {
    return "Excellent - South-facing roof is ideal for solar"
  } else if (orientation?.includes("east") || orientation?.includes("west")) {
    return "Good - East/West orientation still provides good solar production"
  } else if (orientation?.includes("north")) {
    return "Poor - North-facing roofs are not recommended for solar"
  }

  return "Assessment needed - Professional site evaluation recommended"
}

function assessShading(shadingLevel?: string): string {
  switch (shadingLevel?.toLowerCase()) {
    case "none":
      return "Excellent - No shading obstacles detected"
    case "minimal":
      return "Good - Minor shading during morning/evening hours"
    case "moderate":
      return "Fair - Some shading from trees or buildings"
    case "heavy":
      return "Poor - Significant shading will reduce system performance"
    default:
      return "Assessment needed - Professional shading analysis recommended"
  }
}

function assessElectricalUpgrades(systemSize: number): string {
  if (systemSize < 8) {
    return "Standard installation - No electrical upgrades typically required"
  } else if (systemSize < 12) {
    return "May require electrical panel evaluation"
  } else {
    return "Likely requires electrical panel upgrade for larger system"
  }
}
