"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Eye, Crown, Loader2 } from "lucide-react"

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

  const generatePreview = async (reportType: "standard" | "enhanced") => {
    setIsGenerating(true)
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
        throw new Error("Failed to generate preview")
      }

      const data = await response.json()
      setPreviewHtml(data.html)
    } catch (error) {
      console.error("Preview generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = async (reportType: "standard" | "enhanced") => {
    setIsDownloading(true)
    try {
      const response = await fetch("/api/generate-pdf-report", {
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
        throw new Error("Failed to generate PDF")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `solar-report-${customerData.customerName.replace(/\s+/g, "-").toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("PDF download error:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Solar Analysis Report</h2>
              <p className="text-gray-600">Preview and download your professional solar report</p>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <Tabs
          value={selectedReportType}
          onValueChange={(value) => setSelectedReportType(value as "standard" | "enhanced")}
          className="flex-1"
        >
          <div className="p-6 pb-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="standard">Standard Report</TabsTrigger>
              <TabsTrigger value="enhanced">
                <Crown className="h-4 w-4 mr-2" />
                Enhanced Report
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="standard" className="p-6 pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Standard Solar Report
                    </CardTitle>
                    <CardDescription>
                      Professional solar analysis with essential metrics and calculations
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Free</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Includes:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• System sizing and specifications</li>
                      <li>• Financial analysis and ROI</li>
                      <li>• Environmental impact calculations</li>
                      <li>• Basic performance projections</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Customer Info:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <strong>Name:</strong> {customerData.customerName}
                      </div>
                      <div>
                        <strong>Property:</strong> {customerData.propertyAddress}
                      </div>
                      <div>
                        <strong>System Size:</strong> {calculationData.systemSizeKw} kW
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => generatePreview("standard")} disabled={isGenerating} variant="outline">
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    Preview Report
                  </Button>
                  <Button onClick={() => downloadPDF("standard")} disabled={isDownloading}>
                    {isDownloading ? (
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

          <TabsContent value="enhanced" className="p-6 pt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      Enhanced Solar Report
                    </CardTitle>
                    <CardDescription>
                      Comprehensive professional report with advanced analytics and market insights
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">Pro</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Enhanced Features:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Advanced performance metrics</li>
                      <li>• Detailed site assessment</li>
                      <li>• Multiple financing options</li>
                      <li>• Warranty and guarantee details</li>
                      <li>• Market analysis and positioning</li>
                      <li>• Professional visual design</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Professional Benefits:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Impress high-end customers</li>
                      <li>• Detailed technical specifications</li>
                      <li>• Competitive market analysis</li>
                      <li>• Enhanced visual presentation</li>
                      <li>• Comprehensive warranty info</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => generatePreview("enhanced")} disabled={isGenerating} variant="outline">
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    Preview Report
                  </Button>
                  <Button
                    onClick={() => downloadPDF("enhanced")}
                    disabled={isDownloading}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download Enhanced PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {previewHtml && (
          <div className="p-6 pt-0">
            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden" style={{ height: "500px" }}>
                  <iframe srcDoc={previewHtml} className="w-full h-full" title="Report Preview" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
