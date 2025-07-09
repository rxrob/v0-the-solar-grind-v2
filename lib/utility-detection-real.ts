import zipToUtilityData from "@/data/zip-to-utility-real.json"
import { texasSolarPrograms, type SolarProgramInfo } from "@/data/texas-solar-programs"

export type { SolarProgramInfo }

export interface UtilityDetectionResult {
  detectedUtility: string | null
  solarProgram: SolarProgramInfo | null
  confidence: "high" | "medium" | "low"
  method: "zip" | "city" | "ocr" | "manual" | "fallback"
  alternatives: string[]
  warnings: string[]
}

export interface AddressComponents {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  fullAddress: string
}

const zipToUtility = zipToUtilityData as Record<string, string>

export function parseAddress(address: string): AddressComponents {
  const cleaned = address.trim()
  const zipMatch = cleaned.match(/\b(\d{5})\b/)
  const zipCode = zipMatch ? zipMatch[1] : undefined
  const stateMatch = cleaned.match(/\b(TX|Texas)\b/i)
  const state = stateMatch ? stateMatch[0].toUpperCase() : undefined
  let city: string | undefined
  if (stateMatch) {
    const beforeState = cleaned.substring(0, stateMatch.index).trim()
    const cityMatch = beforeState.match(/,\s*([^,]+)$/)
    city = cityMatch ? cityMatch[1].trim() : undefined
  }
  return { street: cleaned.split(",")[0]?.trim(), city, state, zipCode, fullAddress: cleaned }
}

export function detectUtilityFromAddress(address: string): UtilityDetectionResult {
  const components = parseAddress(address)
  const warnings: string[] = []
  const alternatives: string[] = []

  if (components.zipCode) {
    const utilityFromZip = zipToUtility[components.zipCode]
    if (utilityFromZip && texasSolarPrograms[utilityFromZip]) {
      return {
        detectedUtility: utilityFromZip,
        solarProgram: texasSolarPrograms[utilityFromZip],
        confidence: "high",
        method: "zip",
        alternatives: [],
        warnings: [],
      }
    }
  }
  return {
    detectedUtility: null,
    solarProgram: null,
    confidence: "low",
    method: "fallback",
    alternatives,
    warnings: ["Could not automatically detect utility provider. Please select manually."],
  }
}

export function detectUtilityFromOCR(extractedText: string): UtilityDetectionResult {
  const textLower = extractedText.toLowerCase()
  const utilityPatterns = [
    { pattern: /grayson.?collin|gcec/i, utility: "Grayson-Collin Electric Cooperative Inc" },
    { pattern: /bluebonnet|bec/i, utility: "Bluebonnet Electric Cooperative Inc" },
    { pattern: /centerpoint|center.?point/i, utility: "CenterPoint Energy" },
    { pattern: /oncor/i, utility: "Oncor Electric Delivery" },
    { pattern: /gvec|guadalupe.?valley/i, utility: "Guadalupe Valley Electric Cooperative Inc" },
    { pattern: /pedernales|pec/i, utility: "Pedernales Electric Cooperative Inc" },
    { pattern: /coserv|denton.?county/i, utility: "Denton County Electric Cooperative Inc" },
  ]

  for (const { pattern, utility } of utilityPatterns) {
    if (pattern.test(textLower) && texasSolarPrograms[utility]) {
      return {
        detectedUtility: utility,
        solarProgram: texasSolarPrograms[utility],
        confidence: "high",
        method: "ocr",
        alternatives: [],
        warnings: [],
      }
    }
  }

  return {
    detectedUtility: null,
    solarProgram: null,
    confidence: "low",
    method: "ocr",
    alternatives: [],
    warnings: ["Could not identify utility provider from bill text."],
  }
}

export function combineDetectionResults(
  addressResult: UtilityDetectionResult,
  ocrResult?: UtilityDetectionResult,
): UtilityDetectionResult {
  if (ocrResult?.detectedUtility && ocrResult.confidence === "high") {
    return ocrResult
  }
  return addressResult
}

export function validateUtilitySelection(
  selectedUtility: string,
  address: string,
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = []
  const addressResult = detectUtilityFromAddress(address)

  if (
    addressResult.detectedUtility &&
    addressResult.detectedUtility !== selectedUtility &&
    addressResult.confidence === "high"
  ) {
    warnings.push(
      `Selected utility "${selectedUtility}" may not serve this address. Auto-detection suggests "${addressResult.detectedUtility}".`,
    )
  }

  if (!texasSolarPrograms[selectedUtility]) {
    warnings.push(`Solar program data not available for "${selectedUtility}".`)
    return { isValid: false, warnings }
  }

  return { isValid: true, warnings }
}

export function calculateMonthlySolarSavings(
  monthlyUsageKwh: number,
  monthlyProductionKwh: number,
  retailRate: number,
  solarProgram: SolarProgramInfo,
) {
  const usageOffset = Math.min(monthlyUsageKwh, monthlyProductionKwh)
  const excessProduction = Math.max(0, monthlyProductionKwh - monthlyUsageKwh)
  const offsetSavings = usageOffset * retailRate

  let exportCredits = 0
  if (solarProgram.rateType === "netMetering") {
    exportCredits = excessProduction * (solarProgram.exportCreditRatePerkWh ?? retailRate)
  } else if (solarProgram.rateType === "avoidedCost" && solarProgram.buybackRatePerkWh) {
    exportCredits = excessProduction * solarProgram.buybackRatePerkWh
  }

  const grossSavings = offsetSavings + exportCredits
  const fees = solarProgram.solarFeeMonthly
  const netSavings = grossSavings - fees

  return {
    grossSavings: Math.round(grossSavings * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    exportCredits: Math.round(exportCredits * 100) / 100,
    fees: fees,
    offsetSavings: Math.round(offsetSavings * 100) / 100,
  }
}

export function getSolarProgram(utilityName: string): SolarProgramInfo | null {
  return texasSolarPrograms[utilityName] || null
}

export function getAllUtilities(): string[] {
  return Object.keys(texasSolarPrograms)
}

export function getUtilitiesByType(): { cooperatives: string[]; tdus: string[] } {
  const cooperatives: string[] = []
  const tdus: string[] = []
  Object.keys(texasSolarPrograms).forEach((utility) => {
    if (utility.toLowerCase().includes("cooperative") || utility.toLowerCase().includes("association")) {
      cooperatives.push(utility)
    } else {
      tdus.push(utility)
    }
  })
  return { cooperatives, tdus }
}
