"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { OCRService, type ExtractedData, type OCRProgress } from "@/lib/ocr-service"
import { useProCalculatorStore } from "@/lib/store"

interface EnhancedFileUploadProps {
  onDataExtracted?: (data: ExtractedData) => void
}

export function EnhancedFileUpload({ onDataExtracted }: EnhancedFileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState<OCRProgress | null>(null)
  const [error, setError] = useState<string>("")
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const { setEnergyData } = useProCalculatorStore()

  const handleProgressUpdate = useCallback((progressData: OCRProgress) => {
    setProgress(progressData)
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG, or PDF file.")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.")
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)
    setError("")
    setExtractedData(null)
    setProgress(null)

    try {
      const ocrService = new OCRService(handleProgressUpdate)
      const data = await ocrService.processFile(file)

      setExtractedData(data)

      // Auto-fill the form data
      const rate = data.usage && data.bill ? data.bill / data.usage : null

      setEnergyData({
        usage: data.usage,
        bill: data.bill,
        provider: data.provider,
        rate,
        extractedText: data.rawText,
        uploadedFileName: file.name,
      })

      onDataExtracted?.(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process file"
      setError(errorMessage)
      console.error("File processing error:", err)
    } finally {
      setIsProcessing(false)
      setProgress(null)
    }
  }

  const getProgressColor = () => {
    if (!progress) return "bg-orange-500"

    switch (progress.stage) {
      case "processing":
        return "bg-blue-500"
      case "converting":
        return "bg-purple-500"
      case "reading":
        return "bg-yellow-500"
      case "extracting":
        return "bg-green-500"
      case "complete":
        return "bg-green-600"
      default:
        return "bg-orange-500"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-400"
    if (confidence >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High Confidence"
    if (confidence >= 60) return "Medium Confidence"
    return "Low Confidence"
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-gray-900 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">📄 Upload Electric Bill</h3>
        <p className="text-gray-400 text-sm mb-4">
          Upload a photo or PDF of your electric bill for automatic data extraction
        </p>

        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="bill-upload"
            disabled={isProcessing}
          />
          <label htmlFor="bill-upload" className={`cursor-pointer ${isProcessing ? "opacity-50" : ""}`}>
            <div className="text-4xl mb-2">📁</div>
            <p className="text-white font-semibold mb-1">{isProcessing ? "Processing..." : "Click to upload bill"}</p>
            <p className="text-gray-400 text-sm">Supports JPG, PNG, PDF (multi-page)</p>
          </label>
        </div>

        {/* File Info */}
        {uploadedFile && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{uploadedFile.name}</p>
                <p className="text-gray-400 text-xs">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {uploadedFile.type}
                </p>
              </div>
              {!isProcessing && !error && <div className="text-green-400 text-xl">✅</div>}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && progress && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-medium">{progress.message}</p>
              <span className="text-gray-400 text-sm">{Math.round(progress.progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400 capitalize">
              Stage: {progress.stage.replace(/([A-Z])/g, " $1").trim()}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-red-400 text-xl">❌</div>
              <div>
                <p className="text-red-400 font-medium mb-2">Couldn't read your bill</p>
                <p className="text-red-300 text-sm mb-3">{error}</p>
                <p className="text-gray-300 text-sm">
                  💡 <strong>Want to enter the values manually?</strong> Use the form on the right, or try:
                </p>
                <ul className="text-gray-400 text-xs mt-2 space-y-1 ml-4">
                  <li>• Taking a clearer, well-lit photo</li>
                  <li>• Ensuring all text is readable</li>
                  <li>• Using a PDF version if available</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success & Preview */}
        {extractedData && !isProcessing && (
          <div className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-green-400 font-semibold flex items-center">✅ Data Extracted Successfully</h4>
              <div className={`text-sm font-medium ${getConfidenceColor(extractedData.confidence)}`}>
                {getConfidenceLabel(extractedData.confidence)} ({extractedData.confidence}%)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {extractedData.usage > 0 && (
                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-gray-400 text-xs">Monthly Usage</p>
                  <p className="text-white font-bold text-lg">{extractedData.usage.toLocaleString()} kWh</p>
                </div>
              )}

              {extractedData.bill > 0 && (
                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-gray-400 text-xs">Total Bill</p>
                  <p className="text-white font-bold text-lg">${extractedData.bill.toFixed(2)}</p>
                </div>
              )}

              {extractedData.usage > 0 && extractedData.bill > 0 && (
                <div className="bg-gray-800 p-3 rounded">
                  <p className="text-gray-400 text-xs">Rate per kWh</p>
                  <p className="text-white font-bold text-lg">
                    ${(extractedData.bill / extractedData.usage).toFixed(3)}
                  </p>
                </div>
              )}
            </div>

            {extractedData.provider && (
              <div className="bg-gray-800 p-3 rounded mb-4">
                <p className="text-gray-400 text-xs">Utility Provider</p>
                <p className="text-white font-medium">{extractedData.provider}</p>
              </div>
            )}

            <details className="text-sm">
              <summary className="text-gray-400 cursor-pointer hover:text-white">View extracted text preview</summary>
              <div className="mt-2 p-3 bg-gray-800 rounded text-xs text-gray-300 max-h-32 overflow-y-auto">
                {extractedData.rawText.slice(0, 500)}
                {extractedData.rawText.length > 500 && "..."}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">📸 Tips for better results:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Take a clear, well-lit photo of the entire bill</li>
          <li>• Ensure all text is readable and not blurry</li>
          <li>• Include the summary section with usage and total amount</li>
          <li>• PDF files typically give the best results</li>
          <li>• Multi-page PDFs are automatically processed</li>
        </ul>
      </div>
    </div>
  )
}
