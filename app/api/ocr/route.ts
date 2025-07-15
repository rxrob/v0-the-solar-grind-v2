import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Call OCR.space API
    const ocrFormData = new FormData()
    ocrFormData.append("base64Image", `data:${file.type};base64,${base64}`)
    ocrFormData.append("apikey", process.env.OCR_SPACE_API_KEY!)
    ocrFormData.append("language", "eng")
    ocrFormData.append("isOverlayRequired", "false")
    ocrFormData.append("detectOrientation", "false")
    ocrFormData.append("isTable", "true")
    ocrFormData.append("scale", "true")
    ocrFormData.append("OCREngine", "2")

    const response = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: ocrFormData,
    })

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status}`)
    }

    const result = await response.json()

    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage || "OCR processing failed")
    }

    const extractedText = result.ParsedResults?.[0]?.ParsedText || ""

    return NextResponse.json({
      success: true,
      text: extractedText,
      confidence: result.ParsedResults?.[0]?.TextOverlay?.HasOverlay ? "high" : "medium",
    })
  } catch (error) {
    console.error("OCR API error:", error)
    return NextResponse.json(
      { error: "Failed to process image", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
