"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Loader2, FileUp, X, CheckCircle } from "lucide-react"

interface EnhancedFileUploadProps {
  onOcrResult: (text: string) => void
}

export function EnhancedFileUpload({ onOcrResult }: EnhancedFileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileProcessing = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile)
      setIsLoading(true)
      setIsSuccess(false)

      const reader = new FileReader()
      reader.readAsDataURL(selectedFile)
      reader.onloadend = async () => {
        const base64data = reader.result as string
        setPreview(base64data)

        try {
          const response = await fetch("/api/ocr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64data }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Failed to process file.")
          }

          const result = await response.json()

          if (result.IsErroredOnProcessing) {
            throw new Error(result.ErrorMessage.join("\n"))
          }

          const parsedText = result.ParsedResults[0]?.ParsedText || ""
          if (!parsedText) {
            throw new Error("OCR could not extract any text from the document.")
          }

          onOcrResult(parsedText)
          toast.success("Utility bill processed successfully!")
          setIsSuccess(true)
        } catch (error: any) {
          toast.error(`OCR Error: ${error.message}`)
          setFile(null)
          setPreview(null)
        } finally {
          setIsLoading(false)
        }
      }
      reader.onerror = () => {
        toast.error("Failed to read file.")
        setIsLoading(false)
      }
    },
    [onOcrResult],
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
            <p className="text-white p-4 bg-gray-800 rounded-md">{file?.name}</p>
          )}
          <p className="text-sm text-gray-400 mt-2">{file?.name}</p>
          <Button onClick={removeFile} variant="ghost" size="sm" className="absolute top-2 right-2">
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
