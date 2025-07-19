"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, FileText } from "lucide-react"
import { toast } from "sonner"

interface PDFDownloadButtonProps {
  results: any
  address: string
  customerInfo?: {
    name: string
    email: string
    phone?: string
  }
  className?: string
}

export function PDFDownloadButton({ results, address, customerInfo, className }: PDFDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    setIsGenerating(true)
    const toastId = toast.loading("Generating PDF Report...", {
      description: "Please wait. This process is handled entirely by our servers to keep your browser running fast.",
    })

    try {
      const response = await fetch("/api/generate-report-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results, address, customerInfo }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Server failed to generate PDF.")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const safeAddress = address ? address.replace(/[^a-zA-Z0-9]/g, "-") : "report"
      link.download = `ION-Solar-Proposal-${safeAddress}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Report Downloaded", {
        id: toastId,
        description: "Your ION Solar proposal has been saved.",
      })
    } catch (error) {
      console.error("❌ Report generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
      toast.error("Report Generation Failed", {
        id: toastId,
        description: errorMessage,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isGenerating} className={className} size="lg">
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Download PDF Summary
        </>
      )}
    </Button>
  )
}
