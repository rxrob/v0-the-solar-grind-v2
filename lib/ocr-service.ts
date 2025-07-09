interface OCRResult {
  success: boolean
  data?: {
    monthlyUsage?: number
    monthlyBill?: number
    electricityRate?: number
    utilityProvider?: string
    confidence: number
    extractedText: string
    extractionMethod: string
  }
  error?: string
  progress?: number
}

interface OCRProgress {
  stage: string
  progress: number
  message: string
}

// Enhanced patterns for better extraction
const USAGE_PATTERNS = [
  // Standard kWh patterns
  /(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)\s*kWh/gi,
  /kWh\s*:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /usage:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)\s*kWh/gi,
  /consumed:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)\s*kWh/gi,

  // Alternative patterns without "kWh"
  /electricity\s*usage:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /energy\s*used:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /total\s*usage:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /current\s*usage:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,

  // Meter reading differences
  /meter\s*reading.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /present\s*reading.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /current\s*reading.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,

  // Table-like patterns
  /(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:kwh|kw\s*h|kilowatt)/gi,
  /(?:kwh|kw\s*h|kilowatt).*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,

  // Fallback patterns for numbers near energy-related words
  /energy.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /electric.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /power.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,

  // Units variations
  /(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:kwhr|kw-hr|kw\/hr)/gi,
  /(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)\s*kilowatt\s*hours?/gi,

  // Billing period patterns
  /billing\s*period.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /service\s*period.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,

  // Generic number patterns near usage indicators
  /usage.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /consumed.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
  /used.*?(\d{1,4}(?:,\d{3})*(?:\.\d{1,2})?)/gi,
]

const BILL_PATTERNS = [
  // Standard currency patterns
  /\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/g,
  /(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)\s*\$/g,
  /total.*?\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /amount.*?\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /due.*?\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /balance.*?\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /current.*?\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /charges.*?\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,

  // Without currency symbol
  /total\s*amount:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /amount\s*due:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /total\s*due:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /current\s*charges:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /bill\s*amount:?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,

  // Specific billing terms
  /electricity\s*charges:?\s*\$?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /energy\s*charges:?\s*\$?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
  /service\s*charges:?\s*\$?\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)/gi,
]

const RATE_PATTERNS = [
  // Direct rate patterns
  /(\d+\.?\d*)\s*¢?\s*\/?\s*kWh/gi,
  /(\d+\.?\d*)\s*cents?\s*\/?\s*kWh/gi,
  /rate:?\s*\$?\s*(\d+\.?\d*)\s*\/?\s*kWh/gi,
  /price:?\s*\$?\s*(\d+\.?\d*)\s*\/?\s*kWh/gi,
  /\$\s*(\d+\.?\d*)\s*per\s*kWh/gi,
  /(\d+\.?\d*)\s*\$\s*\/\s*kWh/gi,

  // Tier pricing
  /first.*?(\d+\.?\d*)\s*¢?\s*\/?\s*kWh/gi,
  /tier.*?(\d+\.?\d*)\s*¢?\s*\/?\s*kWh/gi,
]

const UTILITY_PATTERNS = [
  // Common utility companies
  /(?:pacific\s*gas\s*&?\s*electric|pg&e)/gi,
  /(?:southern\s*california\s*edison|sce)/gi,
  /(?:san\s*diego\s*gas\s*&?\s*electric|sdg&e)/gi,
  /(?:consolidated\s*edison|con\s*ed)/gi,
  /(?:florida\s*power\s*&?\s*light|fpl)/gi,
  /(?:duke\s*energy)/gi,
  /(?:american\s*electric\s*power|aep)/gi,
  /(?:exelon)/gi,
  /(?:national\s*grid)/gi,
  /(?:dominion\s*energy)/gi,
  /(?:xcel\s*energy)/gi,
  /(?:entergy)/gi,
  /(?:pse&g)/gi,
  /(?:commonwealth\s*edison|comed)/gi,
  /(?:detroit\s*edison|dte)/gi,
  /(?:consumers\s*energy)/gi,
  /(?:pepco)/gi,
  /(?:baltimore\s*gas\s*&?\s*electric|bge)/gi,
  /(?:potomac\s*electric)/gi,
  /(?:georgia\s*power)/gi,
]

class OCRService {
  private apiKey: string
  private progressCallback?: (progress: OCRProgress) => void

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  setProgressCallback(callback: (progress: OCRProgress) => void) {
    this.progressCallback = callback
  }

  private updateProgress(stage: string, progress: number, message: string) {
    if (this.progressCallback) {
      this.progressCallback({ stage, progress, message })
    }
  }

  private cleanNumber(value: string): number | null {
    if (!value) return null

    // Remove commas and extra spaces
    const cleaned = value.replace(/,/g, "").trim()
    const num = Number.parseFloat(cleaned)

    return isNaN(num) ? null : num
  }

  private extractUsage(text: string): { value: number | null; confidence: number } {
    console.log("🔍 Extracting usage from text...")

    const matches: number[] = []

    for (const pattern of USAGE_PATTERNS) {
      const patternMatches = Array.from(text.matchAll(pattern))
      for (const match of patternMatches) {
        const value = this.cleanNumber(match[1])
        if (value && value >= 50 && value <= 10000) {
          // Reasonable range
          matches.push(value)
          console.log(`📊 Found usage match: ${value} kWh (pattern: ${pattern.source})`)
        }
      }
    }

    if (matches.length === 0) {
      console.log("❌ No usage matches found")
      return { value: null, confidence: 0 }
    }

    // Use most common value or median
    const sortedMatches = matches.sort((a, b) => a - b)
    const median = sortedMatches[Math.floor(sortedMatches.length / 2)]

    // Higher confidence if multiple patterns agree
    const confidence = Math.min(0.9, 0.5 + matches.length * 0.1)

    console.log(`✅ Extracted usage: ${median} kWh (confidence: ${confidence})`)
    return { value: median, confidence }
  }

  private extractBill(text: string): { value: number | null; confidence: number } {
    console.log("🔍 Extracting bill amount from text...")

    const matches: number[] = []

    for (const pattern of BILL_PATTERNS) {
      const patternMatches = Array.from(text.matchAll(pattern))
      for (const match of patternMatches) {
        const value = this.cleanNumber(match[1])
        if (value && value >= 10 && value <= 2000) {
          // Reasonable range
          matches.push(value)
          console.log(`💰 Found bill match: $${value} (pattern: ${pattern.source})`)
        }
      }
    }

    if (matches.length === 0) {
      console.log("❌ No bill matches found")
      return { value: null, confidence: 0 }
    }

    // Use most common value or median
    const sortedMatches = matches.sort((a, b) => a - b)
    const median = sortedMatches[Math.floor(sortedMatches.length / 2)]

    // Higher confidence if multiple patterns agree
    const confidence = Math.min(0.9, 0.6 + matches.length * 0.1)

    console.log(`✅ Extracted bill: $${median} (confidence: ${confidence})`)
    return { value: median, confidence }
  }

  private extractRate(text: string): { value: number | null; confidence: number } {
    console.log("🔍 Extracting rate from text...")

    const matches: number[] = []

    for (const pattern of RATE_PATTERNS) {
      const patternMatches = Array.from(text.matchAll(pattern))
      for (const match of patternMatches) {
        let value = this.cleanNumber(match[1])
        if (value) {
          // Convert cents to dollars if needed
          if (value > 5) {
            // Likely in cents
            value = value / 100
          }

          if (value >= 0.05 && value <= 1.0) {
            // Reasonable range
            matches.push(value)
            console.log(`⚡ Found rate match: $${value}/kWh (pattern: ${pattern.source})`)
          }
        }
      }
    }

    if (matches.length === 0) {
      console.log("❌ No rate matches found")
      return { value: null, confidence: 0 }
    }

    // Use most common value or median
    const sortedMatches = matches.sort((a, b) => a - b)
    const median = sortedMatches[Math.floor(sortedMatches.length / 2)]

    // Higher confidence if multiple patterns agree
    const confidence = Math.min(0.9, 0.7 + matches.length * 0.1)

    console.log(`✅ Extracted rate: $${median}/kWh (confidence: ${confidence})`)
    return { value: median, confidence }
  }

  private extractUtilityProvider(text: string): { value: string | null; confidence: number } {
    console.log("🔍 Extracting utility provider from text...")

    for (const pattern of UTILITY_PATTERNS) {
      const match = text.match(pattern)
      if (match) {
        const provider = match[0].trim()
        console.log(`🏢 Found utility provider: ${provider}`)
        return { value: provider, confidence: 0.8 }
      }
    }

    console.log("❌ No utility provider found")
    return { value: null, confidence: 0 }
  }

  private estimateUsageFromBill(billAmount: number): { value: number; confidence: number } {
    console.log(`🔮 Estimating usage from bill amount: $${billAmount}`)

    // Common residential rates to try
    const commonRates = [0.12, 0.15, 0.18, 0.22, 0.28] // $/kWh
    const estimates: number[] = []

    for (const rate of commonRates) {
      const estimatedUsage = billAmount / rate
      if (estimatedUsage >= 200 && estimatedUsage <= 3000) {
        // Reasonable range
        estimates.push(estimatedUsage)
      }
    }

    if (estimates.length === 0) {
      console.log("❌ Could not estimate reasonable usage")
      return { value: 0, confidence: 0 }
    }

    // Use median estimate
    const sortedEstimates = estimates.sort((a, b) => a - b)
    const median = Math.round(sortedEstimates[Math.floor(sortedEstimates.length / 2)])

    console.log(`🔮 Estimated usage: ${median} kWh (low confidence)`)
    return { value: median, confidence: 0.3 } // Low confidence for estimates
  }

  private async extractFromPDF(file: File): Promise<string> {
    this.updateProgress("pdf", 20, "Loading PDF...")

    try {
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import("pdfjs-dist")

      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

      const arrayBuffer = await file.arrayBuffer()
      this.updateProgress("pdf", 40, "Parsing PDF...")

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let fullText = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        this.updateProgress("pdf", 40 + (i / pdf.numPages) * 30, `Extracting page ${i}/${pdf.numPages}...`)

        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")

        fullText += pageText + "\n"
      }

      this.updateProgress("pdf", 70, "PDF text extracted successfully")
      console.log("📄 PDF text extracted:", fullText.substring(0, 500) + "...")

      return fullText
    } catch (error) {
      console.error("❌ PDF extraction failed:", error)
      throw new Error("Failed to extract text from PDF")
    }
  }

  private async extractFromImage(file: File): Promise<string> {
    this.updateProgress("ocr", 30, "Uploading image for OCR...")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("apikey", this.apiKey)
    formData.append("language", "eng")
    formData.append("isOverlayRequired", "false")
    formData.append("detectOrientation", "true")
    formData.append("scale", "true")
    formData.append("OCREngine", "2")

    try {
      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      })

      this.updateProgress("ocr", 60, "Processing OCR...")

      if (!response.ok) {
        throw new Error(`OCR API error: ${response.status}`)
      }

      const result = await response.json()

      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage || "OCR processing failed")
      }

      const extractedText = result.ParsedResults?.[0]?.ParsedText || ""
      this.updateProgress("ocr", 80, "OCR completed successfully")

      console.log("🖼️ OCR text extracted:", extractedText.substring(0, 500) + "...")
      return extractedText
    } catch (error) {
      console.error("❌ OCR extraction failed:", error)
      throw new Error("Failed to extract text from image")
    }
  }

  async extractFromFile(file: File): Promise<OCRResult> {
    try {
      this.updateProgress("start", 0, "Starting file processing...")

      let extractedText = ""
      let extractionMethod = ""

      if (file.type === "application/pdf") {
        extractedText = await this.extractFromPDF(file)
        extractionMethod = "PDF.js"
      } else if (file.type.startsWith("image/")) {
        extractedText = await this.extractFromImage(file)
        extractionMethod = "OCR.space"
      } else {
        throw new Error("Unsupported file type")
      }

      this.updateProgress("extract", 85, "Analyzing extracted text...")

      // Extract data using patterns
      const usageResult = this.extractUsage(extractedText)
      const billResult = this.extractBill(extractedText)
      const rateResult = this.extractRate(extractedText)
      const providerResult = this.extractUtilityProvider(extractedText)

      // Fallback: estimate usage from bill if usage not found
      let finalUsage = usageResult.value
      let finalUsageConfidence = usageResult.confidence

      if (!finalUsage && billResult.value) {
        console.log("🔄 Usage not found, attempting to estimate from bill...")
        const estimate = this.estimateUsageFromBill(billResult.value)
        finalUsage = estimate.value
        finalUsageConfidence = estimate.confidence
      }

      // Calculate rate if not found but usage and bill are available
      let finalRate = rateResult.value
      let finalRateConfidence = rateResult.confidence

      if (!finalRate && finalUsage && billResult.value) {
        finalRate = billResult.value / finalUsage
        finalRateConfidence = Math.min(finalUsageConfidence, billResult.confidence) * 0.8
        console.log(`🧮 Calculated rate from usage and bill: $${finalRate?.toFixed(4)}/kWh`)
      }

      // Calculate overall confidence
      const confidenceScores = [finalUsageConfidence, billResult.confidence, finalRateConfidence].filter(
        (score) => score > 0,
      )

      const overallConfidence =
        confidenceScores.length > 0
          ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
          : 0

      this.updateProgress("complete", 100, "Extraction completed!")

      const result: OCRResult = {
        success: true,
        data: {
          monthlyUsage: finalUsage,
          monthlyBill: billResult.value,
          electricityRate: finalRate,
          utilityProvider: providerResult.value || undefined,
          confidence: overallConfidence,
          extractedText,
          extractionMethod,
        },
      }

      console.log("✅ OCR extraction completed:", result.data)
      return result
    } catch (error) {
      console.error("❌ OCR extraction failed:", error)
      this.updateProgress("error", 0, `Error: ${error instanceof Error ? error.message : "Unknown error"}`)

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }
}

export { OCRService, type OCRResult, type OCRProgress }
