"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, FileUp, X, CheckCircle } from "lucide-react"
import type { OCRResult } from "@/lib/ocr-service"

interface EnhancedFileUploadProps {
  onOcrResult: (result: NonNullable<OCRResult["data"]>) => void
  onError: (error: string) => void
}

export function EnhancedFileUpload({ onOcrResult, onError }: EnhancedFileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileProcessing = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile)
      setIsLoading(true)
      setIsSuccess(false)
      setPreview(URL.createObjectURL(selectedFile))

      try {
        const formData = new FormData()
        formData.append("file", selectedFile)

        const response = await fetch("/api/ocr", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to process file.")
        }

        const result: OCRResult = await response.json()

        if (!result.success || !result.data) {
          throw new Error(result.error || "OCR could not extract any data from the document.")
        }

        onOcrResult(result.data)
        toast.success("Utility bill processed successfully!")
        setIsSuccess(true)
      } catch (error: any) {
        onError(error.message)
        setFile(null)
        if (preview) URL.revokeObjectURL(preview)
        setPreview(null)
      } finally {
        setIsLoading(false)
      }
    },
    [onOcrResult, onError, preview],
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFileProcessing(acceptedFiles[0])
      }
    },
    [handleFileProcessing],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "application/pdf": [] },
    maxFiles: 1,
  })

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setFile(null)
    setPreview(null)
    setIsSuccess(false)
  }

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-center">
          {file?.type.startsWith("image/") ? (
            <img src={preview || "/placeholder.svg"} alt="Preview" className="max-h-48 mx-auto rounded-md" />
          ) : (
            <div className="p-4 bg-gray-800 rounded-md">
              <FileUp className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-white mt-2">{file?.name}</p>
            </div>
          )}
          <Button
            onClick={removeFile}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 text-white hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
            </div>
          )}
          {isSuccess && (
            <div className="absolute inset-0 bg-green-900 bg-opacity-75 flex items-center justify-center rounded-lg">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? "border-orange-400 bg-gray-800" : "border-gray-600 hover:border-orange-500"}`}
        >
          <input {...getInputProps()} />
          <FileUp className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-white">Drag & drop your utility bill here, or click to select a file</p>
          <p className="text-xs text-gray-500">PDF, PNG, or JPG supported</p>
        </div>
      )}
    </div>
  )
}
