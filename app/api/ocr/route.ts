import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Use server-side OCR_SPACE_API_KEY (no NEXT_PUBLIC_ prefix)
    const apiKey = process.env.OCR_SPACE_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "OCR API key not configured" }, { status: 500 })
    }

    const ocrFormData = new FormData()
    ocrFormData.append("file", file)
    ocrFormData.append("apikey", apiKey)
    ocrFormData.append("language", "eng")
    ocrFormData.append("isOverlayRequired", "false")
    ocrFormData.append("detectOrientation", "false")
    ocrFormData.append("scale", "true")
    ocrFormData.append("OCREngine", "2")

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: ocrFormData,
    })

    const result = await response.json()

    if (result.IsErroredOnProcessing) {
      return NextResponse.json({ error: "OCR processing failed" }, { status: 500 })
    }

    const extractedText = result.ParsedResults?.[0]?.ParsedText || ""

    return NextResponse.json({ text: extractedText })
  } catch (error) {
    console.error("OCR API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
