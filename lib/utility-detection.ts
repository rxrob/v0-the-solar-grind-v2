// Utility detection engine that combines ZIP codes, city names, and OCR text analysis
// to automatically identify Texas electric providers and their solar policies

import { getUtilityFromZip, getUtilityFromCity } from "@/data/utility-mapping"
import { getSolarProgram, type SolarProgram } from "@/data/solar-programs"

export interface UtilityDetectionResult {
  detectedUtility: string | null
  solarProgram: SolarProgram | null
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

export function parseAddress(address: string): AddressComponents {
  const cleaned = address.trim()

  // Extract ZIP code
  const zipMatch = cleaned.match(/\b(\d{5})\b/)
  const zipCode = zipMatch ? zipMatch[1] : undefined

  // Extract state
  const stateMatch = cleaned.match(/\b(TX|Texas)\b/i)
  const state = stateMatch ? stateMatch[0].toUpperCase() : undefined

  // Extract city (assumes city comes before state/ZIP)
  let city: string | undefined
  if (stateMatch) {
    const beforeState = cleaned.substring(0, stateMatch.index).trim()
    const cityMatch = beforeState.match(/,\s*([^,]+)$/)
    city = cityMatch ? cityMatch[1].trim() : undefined
  }

  return {
    street: cleaned.split(",")[0]?.trim(),
    city,
    state,
    zipCode,
    fullAddress: cleaned,
  }
}

export function detectUtilityFromAddress(address: string): UtilityDetectionResult {
  const components = parseAddress(address)
  const warnings: string[] = []
  const alternatives: string[] = []

  // Check if address is in Texas
  if (components.state && !components.state.match(/TX|Texas/i)) {
    return {
      detectedUtility: null,
      solarProgram: null,
      confidence: "low",
      method: "fallback",
      alternatives: [],
      warnings: [
        `Address appears to be outside Texas (${components.state}). This tool is designed for Texas utilities only.`,
      ],
    }
  }

  // Method 1: ZIP code lookup (highest confidence)
  if (components.zipCode) {
    const utilityFromZip = getUtilityFromZip(components.zipCode)
    if (utilityFromZip) {
      const solarProgram = getSolarProgram(utilityFromZip)
      return {
        detectedUtility: utilityFromZip,
        solarProgram,
        confidence: "high",
        method: "zip",
        alternatives: [],
        warnings: [],
      }
    } else {
      warnings.push(`ZIP code ${components.zipCode} not found in our database. Falling back to city detection.`)
    }
  }

  // Method 2: City lookup (medium confidence)
  if (components.city) {
    const utilityFromCity = getUtilityFromCity(components.city)
    if (utilityFromCity) {
      const solarProgram = getSolarProgram(utilityFromCity)

      // Add warning for deregulated areas
      if (solarProgram?.type === "deregulated_tdu") {
        warnings.push(
          `${components.city} is in a deregulated area. You'll need to choose a Retail Electric Provider (REP) with a solar plan.`,
        )
      }

      return {
        detectedUtility: utilityFromCity,
        solarProgram,
        confidence: "medium",
        method: "city",
        alternatives: [],
        warnings,
      }
    } else {
      warnings.push(`City "${components.city}" not found in our database.`)
    }
  }

  // Method 3: Regional fallback
  const addressLower = address.toLowerCase()

  // Major metropolitan area detection
  if (
    addressLower.includes("dallas") ||
    addressLower.includes("fort worth") ||
    addressLower.includes("plano") ||
    addressLower.includes("garland")
  ) {
    alternatives.push("Oncor Electric Delivery")
    alternatives.push("Grayson-Collin Electric Cooperative")
    warnings.push("This appears to be in the Dallas-Fort Worth area. Multiple utilities serve this region.")
  } else if (
    addressLower.includes("houston") ||
    addressLower.includes("harris") ||
    addressLower.includes("montgomery")
  ) {
    alternatives.push("CenterPoint Energy")
    warnings.push("This appears to be in the Houston area. CenterPoint Energy is the primary TDU.")
  } else if (addressLower.includes("austin") || addressLower.includes("travis")) {
    alternatives.push("Austin Energy")
    alternatives.push("Oncor Electric Delivery")
    alternatives.push("Pedernales Electric Cooperative (PEC)")
    warnings.push("The Austin area is served by multiple utilities depending on the specific location.")
  } else if (addressLower.includes("san antonio") || addressLower.includes("bexar")) {
    alternatives.push("CPS Energy")
    alternatives.push("Guadalupe Valley Electric Cooperative (GVEC)")
    warnings.push("The San Antonio area has multiple utility providers.")
  }

  return {
    detectedUtility: null,
    solarProgram: null,
    confidence: "low",
    method: "fallback",
    alternatives,
    warnings: [...warnings, "Could not automatically detect utility provider. Please select manually."],
  }
}

export function detectUtilityFromOCR(extractedText: string): UtilityDetectionResult {
  const textLower = extractedText.toLowerCase()
  const warnings: string[] = []
  const alternatives: string[] = []

  // Common utility name patterns in OCR text
  const utilityPatterns = [
    // Electric Cooperatives
    { pattern: /grayson.?collin|gcec/i, utility: "Grayson-Collin Electric Cooperative" },
    { pattern: /coserv|co.?serv|denton.?county/i, utility: "Denton County Electric Cooperative (CoServ)" },
    { pattern: /bluebonnet|bec/i, utility: "Bluebonnet Electric Cooperative" },
    { pattern: /pedernales|pec/i, utility: "Pedernales Electric Cooperative (PEC)" },
    { pattern: /gvec|guadalupe.?valley/i, utility: "Guadalupe Valley Electric Cooperative (GVEC)" },
    { pattern: /hilco/i, utility: "HILCO Electric Cooperative" },
    { pattern: /cherokee.?county/i, utility: "Cherokee County Electric Cooperative" },
    { pattern: /wood.?county/i, utility: "Wood County Electric Cooperative" },
    { pattern: /tri.?county/i, utility: "Tri-County Electric Cooperative" },
    { pattern: /bandera/i, utility: "Bandera Electric Cooperative" },
    { pattern: /medina/i, utility: "Medina Electric Cooperative" },

    // TDUs
    { pattern: /oncor/i, utility: "Oncor Electric Delivery" },
    { pattern: /centerpoint|center.?point/i, utility: "CenterPoint Energy" },
    { pattern: /aep.?texas|aep/i, utility: "AEP Texas" },
    { pattern: /tnmp|texas.?new.?mexico/i, utility: "Texas-New Mexico Power (TNMP)" },

    // Municipal
    { pattern: /austin.?energy/i, utility: "Austin Energy" },
    { pattern: /cps.?energy/i, utility: "CPS Energy" },
    { pattern: /bryan.?texas.?utilities/i, utility: "Bryan Texas Utilities" },

    // IOUs
    { pattern: /el.?paso.?electric/i, utility: "El Paso Electric" },
    { pattern: /xcel.?energy/i, utility: "Xcel Energy" },
  ]

  for (const { pattern, utility } of utilityPatterns) {
    if (pattern.test(textLower)) {
      const solarProgram = getSolarProgram(utility)

      // Add context about utility type
      if (solarProgram?.type === "deregulated_tdu") {
        warnings.push("This is a deregulated area. The TDU handles delivery, but you need a REP for solar buyback.")
      }

      return {
        detectedUtility: utility,
        solarProgram,
        confidence: "high",
        method: "ocr",
        alternatives: [],
        warnings,
      }
    }
  }

  // Fallback: Look for common electric utility keywords
  if (/electric|power|energy|utility/i.test(textLower)) {
    warnings.push("Detected utility bill but could not identify specific provider from text.")
  }

  return {
    detectedUtility: null,
    solarProgram: null,
    confidence: "low",
    method: "ocr",
    alternatives: [],
    warnings: [...warnings, "Could not identify utility provider from bill text."],
  }
}

export function combineDetectionResults(
  addressResult: UtilityDetectionResult,
  ocrResult?: UtilityDetectionResult,
): UtilityDetectionResult {
  const warnings: string[] = []
  const alternatives: string[] = []

  // If OCR detected a utility, prefer it over address detection
  if (ocrResult?.detectedUtility && ocrResult.confidence === "high") {
    // But verify it makes sense with the address
    if (addressResult.detectedUtility && addressResult.detectedUtility !== ocrResult.detectedUtility) {
      warnings.push(
        `Bill shows "${ocrResult.detectedUtility}" but address suggests "${addressResult.detectedUtility}". Using bill information.`,
      )
    }

    return {
      ...ocrResult,
      warnings: [...ocrResult.warnings, ...warnings],
    }
  }

  // If address detection was successful, use it
  if (addressResult.detectedUtility) {
    return {
      ...addressResult,
      alternatives: [...addressResult.alternatives, ...alternatives],
      warnings: [...addressResult.warnings, ...warnings],
    }
  }

  // Combine alternatives from both methods
  const combinedAlternatives = [...new Set([...addressResult.alternatives, ...(ocrResult?.alternatives || [])])]

  const combinedWarnings = [...addressResult.warnings, ...(ocrResult?.warnings || []), ...warnings]

  return {
    detectedUtility: null,
    solarProgram: null,
    confidence: "low",
    method: "fallback",
    alternatives: combinedAlternatives,
    warnings: combinedWarnings,
  }
}

export function suggestUtilitiesForRegion(address: string): string[] {
  const addressLower = address.toLowerCase()

  if (
    addressLower.includes("dallas") ||
    addressLower.includes("collin") ||
    addressLower.includes("denton") ||
    addressLower.includes("fort worth")
  ) {
    return [
      "Oncor Electric Delivery",
      "Grayson-Collin Electric Cooperative",
      "Denton County Electric Cooperative (CoServ)",
      "Wise Electric Cooperative",
    ]
  }

  if (
    addressLower.includes("houston") ||
    addressLower.includes("harris") ||
    addressLower.includes("galveston") ||
    addressLower.includes("montgomery")
  ) {
    return ["CenterPoint Energy"]
  }

  if (addressLower.includes("austin") || addressLower.includes("travis") || addressLower.includes("williamson")) {
    return [
      "Austin Energy",
      "Oncor Electric Delivery",
      "Pedernales Electric Cooperative (PEC)",
      "Bluebonnet Electric Cooperative",
    ]
  }

  if (
    addressLower.includes("san antonio") ||
    addressLower.includes("bexar") ||
    addressLower.includes("comal") ||
    addressLower.includes("guadalupe")
  ) {
    return ["CPS Energy", "Guadalupe Valley Electric Cooperative (GVEC)", "Bandera Electric Cooperative"]
  }

  if (addressLower.includes("corpus christi") || addressLower.includes("nueces") || addressLower.includes("coastal")) {
    return ["AEP Texas", "Nueces Electric Cooperative", "San Patricio Electric Cooperative"]
  }

  return []
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

  const solarProgram = getSolarProgram(selectedUtility)

  if (!solarProgram) {
    warnings.push(`Solar program data not available for "${selectedUtility}".`)
    return { isValid: false, warnings }
  }

  if (solarProgram.programStatus !== "active") {
    warnings.push(`Solar program for "${selectedUtility}" is currently ${solarProgram.programStatus}.`)
  }

  if (solarProgram.type === "deregulated_tdu") {
    warnings.push("This is a deregulated area. You'll need to choose a Retail Electric Provider with solar buyback.")
  }

  return { isValid: true, warnings }
}
