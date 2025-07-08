import Tesseract from "tesseract.js"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf"
import pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.entry"

// Set up PDF.js worker locally
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export interface ExtractedData {
  usage: number
  bill: number
  provider: string
  confidence: number
  rawText: string
}

export interface OCRProgress {
  stage: "processing" | "converting" | "reading" | "extracting" | "complete"
  progress: number
  message: string
}

export class OCRService {
  private onProgress?: (progress: OCRProgress) => void

  constructor(onProgress?: (progress: OCRProgress) => void) {
    this.onProgress = onProgress
  }

  private updateProgress(stage: OCRProgress["stage"], progress: number, message: string) {
    this.onProgress?.({ stage, progress, message })
  }

  async processFile(file: File): Promise<ExtractedData> {
    this.updateProgress("processing", 0, "Starting file processing...")

    try {
      const fileType = file.type
      let images: string[] = []

      if (fileType === "application/pdf") {
        images = await this.convertPDFToImages(file)
      } else if (fileType.startsWith("image/")) {
        const imageDataUrl = await this.fileToDataURL(file)
        images = [imageDataUrl]
      } else {
        throw new Error("Unsupported file type. Please upload PDF, JPG, or PNG files.")
      }

      this.updateProgress("reading", 30, "Reading text from document...")

      // Process all images and combine text
      let combinedText = ""
      for (let i = 0; i < images.length; i++) {
        const pageText = await this.performOCR(images[i], i + 1, images.length)
        combinedText += pageText + "\n"
      }

      this.updateProgress("extracting", 80, "Extracting energy data...")

      const extractedData = this.extractEnergyData(combinedText)

      this.updateProgress("complete", 100, "Processing complete!")

      return {
        ...extractedData,
        rawText: combinedText,
      }
    } catch (error) {
      console.error("OCR processing failed:", error)
      throw new Error(error instanceof Error ? error.message : "Failed to process document")
    }
  }

  private async convertPDFToImages(file: File): Promise<string[]> {
    this.updateProgress("converting", 10, "Converting PDF to images...")

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
    const images: string[] = []

    // Process up to 3 pages (most bills are 1-2 pages)
    const numPages = Math.min(pdf.numPages, 3)

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const viewport = page.getViewport({ scale: 2.0 }) // Higher scale for better OCR

      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")

      if (!context) {
        throw new Error("Could not get canvas context")
      }

      canvas.height = viewport.height
      canvas.width = viewport.width

      await page.render({ canvasContext: context, viewport }).promise

      const imageDataUrl = canvas.toDataURL("image/png", 0.95)
      images.push(imageDataUrl)

      this.updateProgress("converting", 10 + (pageNum / numPages) * 15, `Converted page ${pageNum}/${numPages}`)
    }

    return images
  }

  private async fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result.toString())
        } else {
          reject(new Error("Failed to read file"))
        }
      }
      reader.onerror = () => reject(new Error("File reading failed"))
      reader.readAsDataURL(file)
    })
  }

  private async performOCR(imageSource: string, pageNum: number, totalPages: number): Promise<string> {
    try {
      const { data } = await Tesseract.recognize(imageSource, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const baseProgress = 30 + ((pageNum - 1) / totalPages) * 50
            const pageProgress = (m.progress * 50) / totalPages
            this.updateProgress(
              "reading",
              baseProgress + pageProgress,
              `Reading page ${pageNum}/${totalPages}... ${Math.round(m.progress * 100)}%`,
            )
          }
        },
      })

      return data.text
    } catch (error) {
      console.error(`OCR failed for page ${pageNum}:`, error)

      // Try fallback OCR service
      try {
        return await this.fallbackOCR(imageSource)
      } catch (fallbackError) {
        console.error("Fallback OCR also failed:", fallbackError)
        throw new Error(`Failed to read page ${pageNum}`)
      }
    }
  }

  private async fallbackOCR(imageSource: string): Promise<string> {
    // Fallback to OCR.space API (free tier available)
    const apiKey = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY

    if (!apiKey) {
      throw new Error("No fallback OCR service available")
    }

    const formData = new FormData()

    // Convert data URL to blob
    const response = await fetch(imageSource)
    const blob = await response.blob()

    formData.append("file", blob, "image.png")
    formData.append("apikey", apiKey)
    formData.append("language", "eng")

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData,
    })

    const result = await ocrResponse.json()

    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage || "OCR service error")
    }

    return result.ParsedResults?.[0]?.ParsedText || ""
  }

  private extractEnergyData(text: string): Omit<ExtractedData, "rawText"> {
    const cleanText = text.replace(/[,\s]/g, " ").toLowerCase()

    let usage = 0
    let bill = 0
    let provider = ""
    let confidence = 0

    // Enhanced kWh usage patterns
    const usagePatterns = [
      /(\d{1,4}(?:,\d{3})*)\s*kwh/gi,
      /kwh\s*used:?\s*(\d{1,4}(?:,\d{3})*)/gi,
      /energy\s*used:?\s*(\d{1,4}(?:,\d{3})*)/gi,
      /usage:?\s*(\d{1,4}(?:,\d{3})*)\s*kwh/gi,
      /total\s*kwh:?\s*(\d{1,4}(?:,\d{3})*)/gi,
      /electricity\s*used:?\s*(\d{1,4}(?:,\d{3})*)/gi,
      /current\s*usage:?\s*(\d{1,4}(?:,\d{3})*)/gi,
      /monthly\s*usage:?\s*(\d{1,4}(?:,\d{3})*)/gi,
    ]

    for (const pattern of usagePatterns) {
      const matches = [...text.matchAll(pattern)]
      for (const match of matches) {
        const value = Number.parseInt(match[1].replace(/,/g, ""))
        if (value >= 50 && value <= 50000) {
          // Reasonable range
          usage = Math.max(usage, value) // Take the largest reasonable value
          confidence += 20
        }
      }
    }

    // Enhanced bill amount patterns
    const billPatterns = [
      /total\s*(?:amount\s*)?(?:due|owed|charges?):?\s*\$?(\d{1,4}(?:\.\d{2})?)/gi,
      /amount\s*due:?\s*\$?(\d{1,4}(?:\.\d{2})?)/gi,
      /balance\s*due:?\s*\$?(\d{1,4}(?:\.\d{2})?)/gi,
      /current\s*charges?:?\s*\$?(\d{1,4}(?:\.\d{2})?)/gi,
      /total\s*bill:?\s*\$?(\d{1,4}(?:\.\d{2})?)/gi,
      /pay\s*this\s*amount:?\s*\$?(\d{1,4}(?:\.\d{2})?)/gi,
      /new\s*charges:?\s*\$?(\d{1,4}(?:\.\d{2})?)/gi,
      /monthly\s*charges:?\s*\$?(\d{1,4}(?:\.\d{2})?)/gi,
    ]

    const billAmounts: number[] = []
    for (const pattern of billPatterns) {
      const matches = [...text.matchAll(pattern)]
      for (const match of matches) {
        const value = Number.parseFloat(match[1])
        if (value >= 10 && value <= 5000) {
          // Reasonable range
          billAmounts.push(value)
        }
      }
    }

    // Also look for any dollar amounts in the text
    const dollarMatches = [...text.matchAll(/\$(\d{2,4}(?:\.\d{2})?)/g)]
    for (const match of dollarMatches) {
      const amount = Number.parseFloat(match[1])
      if (amount >= 20 && amount <= 2000) {
        billAmounts.push(amount)
      }
    }

    if (billAmounts.length > 0) {
      // Use the largest reasonable amount (likely the total)
      bill = Math.max(...billAmounts)
      confidence += 20
    }

    // Enhanced utility provider patterns
    const providerPatterns = [
      { pattern: /pacific\s*gas\s*&?\s*electric|pg&e/gi, name: "Pacific Gas & Electric (PG&E)" },
      { pattern: /southern\s*california\s*edison|sce/gi, name: "Southern California Edison (SCE)" },
      { pattern: /san\s*diego\s*gas\s*&?\s*electric|sdg&e/gi, name: "San Diego Gas & Electric (SDG&E)" },
      { pattern: /con\s*edison|coned/gi, name: "Con Edison" },
      { pattern: /florida\s*power\s*&?\s*light|fpl/gi, name: "Florida Power & Light (FPL)" },
      { pattern: /duke\s*energy/gi, name: "Duke Energy" },
      { pattern: /entergy/gi, name: "Entergy" },
      { pattern: /xcel\s*energy/gi, name: "Xcel Energy" },
      { pattern: /commonwealth\s*edison|comed/gi, name: "Commonwealth Edison (ComEd)" },
      { pattern: /pepco/gi, name: "Pepco" },
      { pattern: /dominion\s*energy/gi, name: "Dominion Energy" },
      { pattern: /national\s*grid/gi, name: "National Grid" },
      { pattern: /eversource/gi, name: "Eversource" },
      { pattern: /pse&g/gi, name: "PSE&G" },
      { pattern: /baltimore\s*gas\s*&?\s*electric|bge/gi, name: "Baltimore Gas & Electric (BGE)" },
      { pattern: /american\s*electric\s*power|aep/gi, name: "American Electric Power (AEP)" },
    ]

    for (const { pattern, name } of providerPatterns) {
      if (pattern.test(text)) {
        provider = name
        confidence += 15
        break
      }
    }

    // Additional confidence based on data quality
    if (usage > 0 && bill > 0) {
      const rate = bill / usage
      if (rate >= 0.05 && rate <= 1.0) {
        // Reasonable rate range
        confidence += 25
      }
    }

    return {
      usage,
      bill,
      provider,
      confidence: Math.min(confidence, 100),
    }
  }
}
