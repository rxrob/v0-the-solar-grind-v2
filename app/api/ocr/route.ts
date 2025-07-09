export const runtime = "nodejs" // IMPORTANT: must use Node.js runtime for File uploads

import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "Invalid file upload." }, { status: 400 })
    }

    // The user has NEXT_PUBLIC_OCR_SPACE_API_KEY in their env list.
    // It's fine to use it here as this code only runs on the server.
    const apiKey = process.env.NEXT_PUBLIC_OCR_SPACE_API_KEY
    if (!apiKey) {
      console.error("OCR API key is missing")
      return NextResponse.json({ error: "OCR API key not configured" }, { status: 500 })
    }

    const buffer = await file.arrayBuffer()
    const blob = new Blob([buffer], { type: file.type })

    const ocrFormData = new FormData()
    // Use a generic name or the original file name if available
    const fileName = file instanceof File ? file.name : "upload.tmp"
    ocrFormData.append("file", blob, fileName)
    ocrFormData.append("apikey", apiKey)
    ocrFormData.append("language", "eng")
    ocrFormData.append("isOverlayRequired", "false")
    ocrFormData.append("detectOrientation", "true")
    ocrFormData.append("scale", "true")
    ocrFormData.append("OCREngine", "2")

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: ocrFormData,
      headers: {
        Accept: "application/json",
      },
    })

    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text()
      console.error(`OCR API Error (${ocrResponse.status}):`, errorText)
      return NextResponse.json(
        { error: `OCR API failed. Status: ${ocrResponse.status}` },
        { status: ocrResponse.status },
      )
    }

    const result = await ocrResponse.json()

    if (result.IsErroredOnProcessing) {
      return NextResponse.json({ error: result.ErrorMessage.join(", ") }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Unexpected OCR error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ error: "Internal server error.", details: errorMessage }, { status: 500 })
  }
}
