"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Eye, Crown, Loader2, X } from "lucide-react"
import html2pdf from "html2pdf.js"
import { toast } from "@/hooks/use-toast"

interface ReportPreviewProps {
  customerData: any
  calculationData: any
  onClose?: () => void
}

export function ReportPreview({ customerData, calculationData, onClose }: ReportPreviewProps) {
  const [selectedReportType, setSelectedReportType] = useState<"standard" | "enhanced">("standard")
  const [previewHtml, setPreviewHtml] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePreview = async (reportType: "standard" | "enhanced") => {
    setIsGenerating(true)
    setError(null)
    setPreviewHtml("")
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType,
          customerData,
          calculationData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate preview")
      }

      const data = await response.json()
      setPreviewHtml(data.html)
    } catch (error) {
      console.error("Preview generation error:", error)
      setError(error instanceof Error ? error.message : "Failed to generate preview")
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = async (reportType: "standard" | "enhanced") => {
    setIsDownloading(true)
    setError(null)
    toast({
      title: "Generating PDF...",
      description: "Your report is being prepared. This may take a moment.",
    })

    try {
      // Use the already-generated preview HTML if available, otherwise fetch it.
      let htmlToConvert = previewHtml
      if (!htmlToConvert || selectedReportType !== reportType) {
        const reportResponse = await fetch("/api/generate-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportType, customerData, calculationData }),
        })

        if (!reportResponse.ok) {
          const errorData = await reportResponse.json()
          throw new Error(errorData.error || "Failed to generate report content.")
        }
        const { html } = await reportResponse.json()
        htmlToConvert = html
      }

      if (!htmlToConvert) {
        throw new Error("Report content is empty.")
      }

      const element = document.createElement("div")
      element.innerHTML = htmlToConvert
      document.body.appendChild(element)

      const opt = {
        margin: 0.5,
        filename: `solar-report-${customerData.customerName.replace(/\s+/g, "-").toLowerCase()}-${reportType}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      }

      await html2pdf().set(opt).from(element).save()

      document.body.removeChild(element)

      toast({
        title: "Download Complete",
        description: "Your PDF report has been downloaded successfully.",
      })
    } catch (error) {
      console.error("PDF download error:", error)
      setError(error instanceof Error ? error.message : "Failed to download PDF")
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b flex-row items-center justify-between">
          <div>
            <CardTitle>Solar Analysis Report</CardTitle>
            <CardDescription>Preview and download your professional solar report</CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </CardHeader>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-full md:w-1/3 border-r p-6 overflow-y-auto">
            <Tabs
              value={selectedReportType}
              onValueChange={(value) => {
                setSelectedReportType(value as "standard" | "enhanced")
                setPreviewHtml("") // Clear preview on tab change
                setError(null)
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="enhanced">
                  <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                  Enhanced
                </TabsTrigger>
              </TabsList>
              <TabsContent value="standard" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5" />
                      Standard Report
                    </CardTitle>
                    <CardDescription>Key metrics and financial analysis.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>System sizing & specs</li>
                      <li>Financial analysis & ROI</li>
                      <li>Environmental impact</li>
                      <li>Performance projections</li>
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => generatePreview("standard")} disabled={isGenerating} variant="outline">
                        {isGenerating && selectedReportType === "standard" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        Preview
                      </Button>
                      <Button onClick={() => downloadPDF("standard")} disabled={isDownloading}>
                        {isDownloading && selectedReportType === "standard" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="enhanced" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Enhanced Report
                    </CardTitle>
                    <CardDescription>Comprehensive, client-ready report.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>All standard features</li>
                      <li>Advanced performance metrics</li>
                      <li>Detailed site assessment</li>
                      <li>Multiple financing options</li>
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => generatePreview("enhanced")} disabled={isGenerating} variant="outline">
                        {isGenerating && selectedReportType === "enhanced" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        Preview
                      </Button>
                      <Button
                        onClick={() => downloadPDF("enhanced")}
                        disabled={isDownloading}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                      >
                        {isDownloading && selectedReportType === "enhanced" ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="hidden md:flex w-2/3 p-6 overflow-y-auto flex-col">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>A preview of the selected report will be shown below.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="border rounded-lg overflow-hidden bg-muted h-full">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-full flex-col gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="text-muted-foreground">Generating Preview...</p>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-full flex-col gap-2 p-4 text-center">
                      <X className="h-8 w-8 text-destructive" />
                      <p className="font-semibold text-destructive">Failed to generate preview</p>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                  ) : previewHtml ? (
                    <iframe srcDoc={previewHtml} className="w-full h-full" title="Report Preview" />
                  ) : (
                    <div className="flex items-center justify-center h-full flex-col gap-2">
                      <Eye className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">Click "Preview" to see the report.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}
