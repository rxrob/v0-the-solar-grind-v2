"use server"

interface FormData {
  state: string
  houseSquareFeet: string
  monthlyElectricBill: string
  monthlyKwhUsage: string
  electricityRate: string
  hasPool: boolean
  hasEV: boolean
  hasAddition: boolean
  roofType: string
  roofAge: string
  roofCondition: string
  shadingLevel: string
  systemSize: string
  panelType: string
  financing: string
  primaryGoal: string
  timeline: string
  additionalNotes: string
}

interface CalculationResult {
  systemSize: number
  annualProduction: number
  monthlyProduction: number
  firstYearSavings: number
  twentyYearSavings: number
  paybackPeriod: number
  co2Offset: number
  treesEquivalent: number
  roofUtilization: number
  availableRoofArea: number
  estimatedCost: number
  monthlyPayment: number
  netMonthlySavings: number
  roi: number
  stateName: string
  peakSunHours: number
}

// State solar data with peak sun hours and average electricity rates
const US_STATES = {
  AL: { name: "Alabama", sunHours: 4.23, rate: 0.1299 },
  AK: { name: "Alaska", sunHours: 2.5, rate: 0.2337 },
  AZ: { name: "Arizona", sunHours: 6.57, rate: 0.1285 },
  AR: { name: "Arkansas", sunHours: 4.69, rate: 0.1067 },
  CA: { name: "California", sunHours: 5.38, rate: 0.2068 },
  CO: { name: "Colorado", sunHours: 5.0, rate: 0.1368 },
  CT: { name: "Connecticut", sunHours: 3.86, rate: 0.211 },
  DE: { name: "Delaware", sunHours: 4.17, rate: 0.1372 },
  FL: { name: "Florida", sunHours: 5.27, rate: 0.1198 },
  GA: { name: "Georgia", sunHours: 4.74, rate: 0.1188 },
  HI: { name: "Hawaii", sunHours: 5.59, rate: 0.3315 },
  ID: { name: "Idaho", sunHours: 4.2, rate: 0.1015 },
  IL: { name: "Illinois", sunHours: 4.0, rate: 0.1287 },
  IN: { name: "Indiana", sunHours: 4.21, rate: 0.1398 },
  IA: { name: "Iowa", sunHours: 4.26, rate: 0.1231 },
  KS: { name: "Kansas", sunHours: 4.96, rate: 0.1368 },
  KY: { name: "Kentucky", sunHours: 4.2, rate: 0.1087 },
  LA: { name: "Louisiana", sunHours: 4.92, rate: 0.0987 },
  ME: { name: "Maine", sunHours: 3.56, rate: 0.1644 },
  MD: { name: "Maryland", sunHours: 4.2, rate: 0.1372 },
  MA: { name: "Massachusetts", sunHours: 3.84, rate: 0.2285 },
  MI: { name: "Michigan", sunHours: 3.78, rate: 0.1598 },
  MN: { name: "Minnesota", sunHours: 4.53, rate: 0.1368 },
  MS: { name: "Mississippi", sunHours: 4.54, rate: 0.1198 },
  MO: { name: "Missouri", sunHours: 4.73, rate: 0.1087 },
  MT: { name: "Montana", sunHours: 4.0, rate: 0.1087 },
  NE: { name: "Nebraska", sunHours: 4.9, rate: 0.1087 },
  NV: { name: "Nevada", sunHours: 6.41, rate: 0.1198 },
  NH: { name: "New Hampshire", sunHours: 3.64, rate: 0.1987 },
  NJ: { name: "New Jersey", sunHours: 4.0, rate: 0.1598 },
  NM: { name: "New Mexico", sunHours: 6.77, rate: 0.1287 },
  NY: { name: "New York", sunHours: 3.79, rate: 0.1887 },
  NC: { name: "North Carolina", sunHours: 4.71, rate: 0.1198 },
  ND: { name: "North Dakota", sunHours: 4.53, rate: 0.1087 },
  OH: { name: "Ohio", sunHours: 3.93, rate: 0.1287 },
  OK: { name: "Oklahoma", sunHours: 5.59, rate: 0.1087 },
  OR: { name: "Oregon", sunHours: 3.72, rate: 0.1087 },
  PA: { name: "Pennsylvania", sunHours: 3.91, rate: 0.1398 },
  RI: { name: "Rhode Island", sunHours: 3.85, rate: 0.2285 },
  SC: { name: "South Carolina", sunHours: 4.64, rate: 0.1287 },
  SD: { name: "South Dakota", sunHours: 4.59, rate: 0.1287 },
  TN: { name: "Tennessee", sunHours: 4.45, rate: 0.1087 },
  TX: { name: "Texas", sunHours: 5.26, rate: 0.1198 },
  UT: { name: "Utah", sunHours: 5.26, rate: 0.1087 },
  VT: { name: "Vermont", sunHours: 3.61, rate: 0.1887 },
  VA: { name: "Virginia", sunHours: 4.5, rate: 0.1198 },
  WA: { name: "Washington", sunHours: 3.06, rate: 0.1087 },
  WV: { name: "West Virginia", sunHours: 3.89, rate: 0.1198 },
  WI: { name: "Wisconsin", sunHours: 4.29, rate: 0.1487 },
  WY: { name: "Wyoming", sunHours: 5.0, rate: 0.1087 },
}

export async function calculateSolarSavings(formData: FormData): Promise<CalculationResult> {
  // Get state data
  const stateData = US_STATES[formData.state as keyof typeof US_STATES]
  if (!stateData) {
    throw new Error("Invalid state selected")
  }

  // Parse input values
  const houseSquareFeet = Number.parseInt(formData.houseSquareFeet)
  const monthlyKwhUsage = Number.parseInt(formData.monthlyKwhUsage)
  const electricityRate = Number.parseFloat(formData.electricityRate) / 100 // Convert cents to dollars
  const monthlyBill = Number.parseFloat(formData.monthlyElectricBill)

  // Calculate available roof area (typically 50% of house square footage)
  const availableRoofArea = Math.round(houseSquareFeet * 0.5)

  // Adjust usage for additional features
  let adjustedMonthlyUsage = monthlyKwhUsage
  if (formData.hasPool) adjustedMonthlyUsage *= 1.2
  if (formData.hasEV) adjustedMonthlyUsage *= 1.3
  if (formData.hasAddition) adjustedMonthlyUsage *= 1.15

  // Calculate annual usage
  const annualKwhUsage = adjustedMonthlyUsage * 12

  // Determine system size needed (kW)
  // Formula: Annual usage / (Peak sun hours * 365 * system efficiency)
  const systemEfficiency = 0.85 // Account for inverter losses, shading, etc.
  let systemSize = annualKwhUsage / (stateData.sunHours * 365 * systemEfficiency)

  // Apply shading adjustments
  const shadingMultipliers = {
    none: 1.0,
    minimal: 0.95,
    moderate: 0.85,
    heavy: 0.75,
  }
  const shadingMultiplier = shadingMultipliers[formData.shadingLevel as keyof typeof shadingMultipliers] || 0.85
  systemSize = systemSize / shadingMultiplier

  // Round to reasonable system size
  systemSize = Math.round(systemSize * 2) / 2 // Round to nearest 0.5 kW

  // Calculate annual production
  const annualProduction = Math.round(systemSize * stateData.sunHours * 365 * systemEfficiency * shadingMultiplier)
  const monthlyProduction = Math.round(annualProduction / 12)

  // Calculate roof utilization
  // Assume 400W panels, each taking ~20 sq ft
  const panelsNeeded = Math.ceil((systemSize * 1000) / 400)
  const panelArea = panelsNeeded * 20
  const roofUtilization = (panelArea / availableRoofArea) * 100

  // Calculate costs based on panel type
  const panelCosts = {
    monocrystalline: 3.5, // $/W
    polycrystalline: 3.0,
    "thin-film": 2.5,
  }
  const costPerWatt = panelCosts[formData.panelType as keyof typeof panelCosts] || 3.0
  const estimatedCost = Math.round(systemSize * 1000 * costPerWatt)

  // Calculate savings
  const annualSavings = Math.round(annualProduction * electricityRate)
  const firstYearSavings = annualSavings

  // Calculate 20-year savings with 3% annual electricity rate increase
  let twentyYearSavings = 0
  let currentRate = electricityRate
  for (let year = 1; year <= 20; year++) {
    twentyYearSavings += annualProduction * currentRate
    currentRate *= 1.03 // 3% annual increase
  }
  twentyYearSavings = Math.round(twentyYearSavings)

  // Calculate payback period
  const paybackPeriod = estimatedCost / annualSavings

  // Calculate financing details
  let monthlyPayment = 0
  if (formData.financing === "loan") {
    // Assume 6% APR, 20-year loan
    const loanAmount = estimatedCost * 0.8 // 20% down
    const monthlyRate = 0.06 / 12
    const numPayments = 20 * 12
    monthlyPayment = Math.round(
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1),
    )
  } else if (formData.financing === "lease") {
    monthlyPayment = Math.round(systemSize * 150) // ~$150/kW for lease
  } else if (formData.financing === "ppa") {
    monthlyPayment = Math.round(monthlyProduction * electricityRate * 0.8) // 20% discount on PPA
  }

  const netMonthlySavings = Math.round(annualSavings / 12 - monthlyPayment)

  // Calculate environmental impact
  const co2Offset = Math.round(annualProduction * 0.92) // 0.92 lbs CO2 per kWh
  const treesEquivalent = Math.round(co2Offset / 48) // 48 lbs CO2 per tree per year

  // Calculate ROI
  const roi = ((twentyYearSavings - estimatedCost) / estimatedCost) * 100

  return {
    systemSize,
    annualProduction,
    monthlyProduction,
    firstYearSavings,
    twentyYearSavings,
    paybackPeriod,
    co2Offset,
    treesEquivalent,
    roofUtilization,
    availableRoofArea,
    estimatedCost,
    monthlyPayment,
    netMonthlySavings,
    roi,
    stateName: stateData.name,
    peakSunHours: stateData.sunHours,
  }
}
