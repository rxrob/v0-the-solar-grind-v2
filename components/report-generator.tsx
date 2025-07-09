"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ReportPreview } from "./report-preview"
import { User, Home, Zap, Calculator } from "lucide-react"
import type { SolarAnalysisData } from "@/types/solar"

interface ReportGeneratorProps {
  initialData?: any
  analysisData: SolarAnalysisData | null
  address: string
}

export default function ReportGenerator({ initialData, analysisData, address }: ReportGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: initialData?.customerName || "",
    customerEmail: initialData?.customerEmail || "",
    customerPhone: initialData?.customerPhone || "",

    // Property Information
    propertyAddress: initialData?.propertyAddress || "",
    propertySquareFeet: initialData?.propertySquareFeet || "",
    residents: initialData?.residents || "",
    roofType: initialData?.roofType || "",
    roofCondition: initialData?.roofCondition || "",
    roofAge: initialData?.roofAge || "",
    shadingLevel: initialData?.shadingLevel || "",

    // Energy Information
    monthlyKwh: initialData?.monthlyKwh || "",
    currentElectricBill: initialData?.currentElectricBill || "",
    electricityRate: initialData?.electricityRate || "",
    utilityCompany: initialData?.utilityCompany || "",

    // System Information
    systemSizeKw: initialData?.systemSizeKw || "",
    panelsNeeded: initialData?.panelsNeeded || "",
    panelWattage: initialData?.panelWattage || "",
    inverterType: initialData?.inverterType || "",
    annualProductionKwh: initialData?.annualProductionKwh || "",

    // Financial Information
    systemCost: initialData?.systemCost || "",
    netCost: initialData?.netCost || "",
    annualSavings: initialData?.annualSavings || "",
    monthlySavings: initialData?.monthlySavings || "",
    roiYears: initialData?.roiYears || "",

    // Environmental Information
    co2OffsetTons: initialData?.co2OffsetTons || "",
    treesEquivalent: initialData?.treesEquivalent || "",

    // Additional Considerations
    hasPool: initialData?.hasPool || false,
    hasEv: initialData?.hasEv || false,
    planningAdditions: initialData?.planningAdditions || false,
    additionalNotes: initialData?.additionalNotes || "",
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleGenerateReport = useCallback(async () => {
    if (!analysisData) {
      toast.error("No analysis data available to generate a report.")
      return
    }

    setIsGenerating(true)
    const toastId = toast.loading("Generating PDF report...", {
      description: "This may take a moment. Please wait.",
    })

    try {
      const response = await fetch("/api/generate-pdf-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analysisData, address }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate PDF report.")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Solar_Report_${address.replace(/ /g, "_")}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success("Report downloaded successfully!", {
        id: toastId,
      })
    } catch (error) {
      console.error("Error generating report:", error)
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
      toast.error("Failed to generate report.", {
        id: toastId,
        description: errorMessage,
      })
    } finally {
      setIsGenerating(false)
    }
  }, [analysisData, address])

  const customerData = {
    customerName: formData.customerName,
    customerEmail: formData.customerEmail,
    customerPhone: formData.customerPhone,
    propertyAddress: formData.propertyAddress,
    propertySquareFeet: Number(formData.propertySquareFeet) || 0,
    residents: Number(formData.residents) || 0,
    additionalNotes: formData.additionalNotes,
  }

  const calculationData = {
    // System specs
    systemSizeKw: Number(formData.systemSizeKw) || 0,
    panelsNeeded: Number(formData.panelsNeeded) || 0,
    panelWattage: Number(formData.panelWattage) || 440,
    inverterType: formData.inverterType || "Enphase IQ8M",
    annualProductionKwh: Number(formData.annualProductionKwh) || 0,

    // Energy usage
    monthlyKwh: Number(formData.monthlyKwh) || 0,
    currentElectricBill: Number(formData.currentElectricBill) || 0,
    electricityRate: Number(formData.electricityRate) || 0.12,
    utilityCompany: formData.utilityCompany || "Local Utility",

    // Financial
    systemCost: Number(formData.systemCost) || 0,
    netCost: Number(formData.netCost) || 0,
    annualSavings: Number(formData.annualSavings) || 0,
    monthlySavings: Number(formData.monthlySavings) || 0,
    roiYears: Number(formData.roiYears) || 0,

    // Environmental
    co2OffsetTons: Number(formData.co2OffsetTons) || 0,
    treesEquivalent: Number(formData.treesEquivalent) || 0,

    // Property details
    roofType: formData.roofType || "Asphalt Shingle",
    roofCondition: formData.roofCondition || "Good",
    roofAge: formData.roofAge || "6-10 years",
    shadingLevel: formData.shadingLevel || "Minimal",

    // Additional features
    hasPool: formData.hasPool,
    hasEv: formData.hasEv,
    planningAdditions: formData.planningAdditions,
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Solar Report Generator</h1>
        <p className="text-gray-600">Create professional solar analysis reports for your customers</p>
      </div>

      <div className="grid gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
            <CardDescription>Basic customer contact and identification details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange("customerName", e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div>
              <Label htmlFor="customerEmail">Email Address</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange("customerEmail", e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange("customerPhone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Information
            </CardTitle>
            <CardDescription>Details about the property and roof characteristics</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="propertyAddress">Property Address *</Label>
              <Input
                id="propertyAddress"
                value={formData.propertyAddress}
                onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                placeholder="123 Solar Street, Austin, TX 78701"
              />
            </div>
            <div>
              <Label htmlFor="propertySquareFeet">Property Square Feet</Label>
              <Input
                id="propertySquareFeet"
                type="number"
                value={formData.propertySquareFeet}
                onChange={(e) => handleInputChange("propertySquareFeet", e.target.value)}
                placeholder="2500"
              />
            </div>
            <div>
              <Label htmlFor="residents">Number of Residents</Label>
              <Input
                id="residents"
                type="number"
                value={formData.residents}
                onChange={(e) => handleInputChange("residents", e.target.value)}
                placeholder="4"
              />
            </div>
            <div>
              <Label htmlFor="roofType">Roof Type</Label>
              <Select value={formData.roofType} onValueChange={(value) => handleInputChange("roofType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select roof type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asphalt_shingle">Asphalt Shingle</SelectItem>
                  <SelectItem value="metal">Metal</SelectItem>
                  <SelectItem value="tile">Tile</SelectItem>
                  <SelectItem value="slate">Slate</SelectItem>
                  <SelectItem value="flat">Flat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="roofCondition">Roof Condition</Label>
              <Select
                value={formData.roofCondition}
                onValueChange={(value) => handleInputChange("roofCondition", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="needs_repair">Needs Repair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="roofAge">Roof Age</Label>
              <Select value={formData.roofAge} onValueChange={(value) => handleInputChange("roofAge", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select age range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-5">0-5 years</SelectItem>
                  <SelectItem value="6-10">6-10 years</SelectItem>
                  <SelectItem value="11-15">11-15 years</SelectItem>
                  <SelectItem value="16-20">16-20 years</SelectItem>
                  <SelectItem value="20+">20+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="shadingLevel">Shading Level</Label>
              <Select value={formData.shadingLevel} onValueChange={(value) => handleInputChange("shadingLevel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shading level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Shading</SelectItem>
                  <SelectItem value="minimal">Minimal Shading</SelectItem>
                  <SelectItem value="moderate">Moderate Shading</SelectItem>
                  <SelectItem value="heavy">Heavy Shading</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Energy Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Energy Information
            </CardTitle>
            <CardDescription>Current energy usage and utility details</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthlyKwh">Monthly kWh Usage *</Label>
              <Input
                id="monthlyKwh"
                type="number"
                value={formData.monthlyKwh}
                onChange={(e) => handleInputChange("monthlyKwh", e.target.value)}
                placeholder="1200"
              />
            </div>
            <div>
              <Label htmlFor="currentElectricBill">Current Monthly Bill</Label>
              <Input
                id="currentElectricBill"
                type="number"
                step="0.01"
                value={formData.currentElectricBill}
                onChange={(e) => handleInputChange("currentElectricBill", e.target.value)}
                placeholder="144.00"
              />
            </div>
            <div>
              <Label htmlFor="electricityRate">Electricity Rate ($/kWh)</Label>
              <Input
                id="electricityRate"
                type="number"
                step="0.001"
                value={formData.electricityRate}
                onChange={(e) => handleInputChange("electricityRate", e.target.value)}
                placeholder="0.12"
              />
            </div>
            <div>
              <Label htmlFor="utilityCompany">Utility Company</Label>
              <Input
                id="utilityCompany"
                value={formData.utilityCompany}
                onChange={(e) => handleInputChange("utilityCompany", e.target.value)}
                placeholder="Austin Energy"
              />
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Solar System Information
            </CardTitle>
            <CardDescription>Calculated system specifications and performance</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="systemSizeKw">System Size (kW) *</Label>
              <Input
                id="systemSizeKw"
                type="number"
                step="0.1"
                value={formData.systemSizeKw}
                onChange={(e) => handleInputChange("systemSizeKw", e.target.value)}
                placeholder="8.5"
              />
            </div>
            <div>
              <Label htmlFor="panelsNeeded">Number of Panels</Label>
              <Input
                id="panelsNeeded"
                type="number"
                value={formData.panelsNeeded}
                onChange={(e) => handleInputChange("panelsNeeded", e.target.value)}
                placeholder="20"
              />
            </div>
            <div>
              <Label htmlFor="panelWattage">Panel Wattage</Label>
              <Input
                id="panelWattage"
                type="number"
                value={formData.panelWattage}
                onChange={(e) => handleInputChange("panelWattage", e.target.value)}
                placeholder="440"
              />
            </div>
            <div>
              <Label htmlFor="inverterType">Inverter Type</Label>
              <Input
                id="inverterType"
                value={formData.inverterType}
                onChange={(e) => handleInputChange("inverterType", e.target.value)}
                placeholder="Enphase IQ8M"
              />
            </div>
            <div>
              <Label htmlFor="annualProductionKwh">Annual Production (kWh)</Label>
              <Input
                id="annualProductionKwh"
                type="number"
                value={formData.annualProductionKwh}
                onChange={(e) => handleInputChange("annualProductionKwh", e.target.value)}
                placeholder="12500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Analysis</CardTitle>
            <CardDescription>System costs, savings, and return on investment</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="systemCost">Total System Cost *</Label>
              <Input
                id="systemCost"
                type="number"
                step="0.01"
                value={formData.systemCost}
                onChange={(e) => handleInputChange("systemCost", e.target.value)}
                placeholder="30175"
              />
            </div>
            <div>
              <Label htmlFor="netCost">Net Cost (After Incentives)</Label>
              <Input
                id="netCost"
                type="number"
                step="0.01"
                value={formData.netCost}
                onChange={(e) => handleInputChange("netCost", e.target.value)}
                placeholder="21123"
              />
            </div>
            <div>
              <Label htmlFor="annualSavings">Annual Savings *</Label>
              <Input
                id="annualSavings"
                type="number"
                step="0.01"
                value={formData.annualSavings}
                onChange={(e) => handleInputChange("annualSavings", e.target.value)}
                placeholder="1800"
              />
            </div>
            <div>
              <Label htmlFor="monthlySavings">Monthly Savings</Label>
              <Input
                id="monthlySavings"
                type="number"
                step="0.01"
                value={formData.monthlySavings}
                onChange={(e) => handleInputChange("monthlySavings", e.target.value)}
                placeholder="150"
              />
            </div>
            <div>
              <Label htmlFor="roiYears">ROI Period (Years)</Label>
              <Input
                id="roiYears"
                type="number"
                step="0.1"
                value={formData.roiYears}
                onChange={(e) => handleInputChange("roiYears", e.target.value)}
                placeholder="11.7"
              />
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card>
          <CardHeader>
            <CardTitle>Environmental Impact</CardTitle>
            <CardDescription>Carbon footprint reduction and environmental benefits</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="co2OffsetTons">CO₂ Offset (Tons/Year)</Label>
              <Input
                id="co2OffsetTons"
                type="number"
                step="0.1"
                value={formData.co2OffsetTons}
                onChange={(e) => handleInputChange("co2OffsetTons", e.target.value)}
                placeholder="5.0"
              />
            </div>
            <div>
              <Label htmlFor="treesEquivalent">Trees Equivalent</Label>
              <Input
                id="treesEquivalent"
                type="number"
                value={formData.treesEquivalent}
                onChange={(e) => handleInputChange("treesEquivalent", e.target.value)}
                placeholder="80"
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Considerations */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Considerations</CardTitle>
            <CardDescription>Special circumstances that may affect the solar installation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPool"
                checked={formData.hasPool}
                onCheckedChange={(checked) => handleInputChange("hasPool", checked)}
              />
              <Label htmlFor="hasPool">Property has a swimming pool</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasEv"
                checked={formData.hasEv}
                onCheckedChange={(checked) => handleInputChange("hasEv", checked)}
              />
              <Label htmlFor="hasEv">Customer owns or plans to buy an electric vehicle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="planningAdditions"
                checked={formData.planningAdditions}
                onCheckedChange={(checked) => handleInputChange("planningAdditions", checked)}
              />
              <Label htmlFor="planningAdditions">Planning home additions or major appliances</Label>
            </div>
            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                placeholder="Any additional information or special considerations..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Generate Report Button */}
        <Card>
          <CardHeader>
            <CardTitle>Download Report</CardTitle>
            <CardDescription>Generate and download a comprehensive PDF report of your solar analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateReport} disabled={isGenerating || !analysisData} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Report
                </>
              )}
            </Button>
            {!analysisData && (
              <p className="mt-2 text-sm text-muted-foreground">Complete the analysis to enable report generation.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {showPreview && (
        <ReportPreview
          customerData={customerData}
          calculationData={calculationData}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
