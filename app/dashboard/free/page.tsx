"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Calculator,
  Zap,
  Lock,
  TrendingUp,
  Sun,
  DollarSign,
  Calendar,
  Home,
  Download,
  FileText,
  History,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { AnimatedBG } from "@/components/AnimatedBG"

interface CalculationResult {
  systemSize: number
  estimatedCost: number
  annualSavings: number
  paybackPeriod: number
  co2Reduction: number
  panelsNeeded: number
  monthlyProduction: number
  success: boolean
  message?: string
}

interface SavedCalculation {
  id: string
  address: string
  monthlyBill: number
  systemSize: number
  annualSavings: number
  createdAt: string
}

export default function FreeDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "calculator" | "history">("overview")
  const [isCalculating, setIsCalculating] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null)
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])

  // Calculator form state
  const [formData, setFormData] = useState({
    address: "",
    monthlyBill: 150,
    roofArea: 1500,
    sunHours: 5.5,
    electricityRate: 0.12,
  })

  const usageData = {
    calculationsUsed: 3,
    calculationsLimit: 5,
    reportsGenerated: 1,
    reportsLimit: 2,
  }

  useEffect(() => {
    // Load saved calculations on component mount
    loadSavedCalculations()
  }, [])

  const loadSavedCalculations = async () => {
    try {
      const response = await fetch("/api/user-calculations")
      if (response.ok) {
        const data = await response.json()
        setSavedCalculations(data.calculations || [])
      }
    } catch (error) {
      console.error("Error loading calculations:", error)
    }
  }

  const handleCalculate = async () => {
    if (!formData.address.trim()) {
      toast.error("Please enter a property address")
      return
    }

    setIsCalculating(true)

    try {
      // Simulate calculation delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Basic solar calculations
      const monthlyUsage = formData.monthlyBill / formData.electricityRate
      const annualUsage = monthlyUsage * 12

      // System sizing
      const systemEfficiency = 0.85
      const systemSize = annualUsage / (formData.sunHours * 365 * systemEfficiency) / 1000

      // Panel calculations
      const panelWattage = 400
      const panelsNeeded = Math.ceil((systemSize * 1000) / panelWattage)

      // Cost calculations
      const costPerWatt = 3.5
      const estimatedCost = systemSize * 1000 * costPerWatt
      const federalTaxCredit = estimatedCost * 0.3
      const netCost = estimatedCost - federalTaxCredit

      // Savings calculations
      const annualProduction = systemSize * formData.sunHours * 365 * systemEfficiency
      const annualSavings = annualProduction * formData.electricityRate
      const monthlyProduction = annualProduction / 12
      const paybackPeriod = netCost / annualSavings
      const co2Reduction = annualProduction * 0.92

      const result: CalculationResult = {
        systemSize: Math.round(systemSize * 100) / 100,
        estimatedCost: Math.round(estimatedCost),
        annualSavings: Math.round(annualSavings),
        paybackPeriod: Math.round(paybackPeriod * 10) / 10,
        co2Reduction: Math.round(co2Reduction),
        panelsNeeded,
        monthlyProduction: Math.round(monthlyProduction),
        success: true,
      }

      setCalculationResult(result)

      // Save calculation to database
      await saveCalculation(result)

      toast.success("Solar calculation completed!")
    } catch (error) {
      console.error("Calculation error:", error)
      toast.error("Calculation failed. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  const saveCalculation = async (result: CalculationResult) => {
    try {
      const response = await fetch("/api/user-calculations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: formData.address,
          monthly_bill: formData.monthlyBill,
          system_size: result.systemSize,
          annual_production: result.monthlyProduction * 12,
          annual_savings: result.annualSavings,
          payback_period: result.paybackPeriod,
          calculation_type: "basic",
        }),
      })

      if (response.ok) {
        loadSavedCalculations() // Refresh the list
      }
    } catch (error) {
      console.error("Error saving calculation:", error)
    }
  }

  const generatePDF = async () => {
    if (!calculationResult) {
      toast.error("No calculation results to export")
      return
    }

    setIsGeneratingPDF(true)

    try {
      const response = await fetch("/api/generate-pdf-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: "Solar Customer",
          customerEmail: "customer@example.com",
          propertyAddress: formData.address,
          systemSize: calculationResult.systemSize.toString(),
          annualProduction: (calculationResult.monthlyProduction * 12).toString(),
          annualSavings: calculationResult.annualSavings.toString(),
          paybackPeriod: calculationResult.paybackPeriod.toString(),
          co2Reduction: (calculationResult.co2Reduction / 2000).toString(), // Convert to tons
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Create download link
        const link = document.createElement("a")
        link.href = data.pdf
        link.download = `Solar_Report_${formData.address.replace(/\s+/g, "_")}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("PDF report downloaded successfully!")
      } else {
        throw new Error("Failed to generate PDF")
      }
    } catch (error) {
      console.error("PDF generation error:", error)
      toast.error("Failed to generate PDF report")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <AnimatedBG />

      <div className="relative z-10 container mx-auto py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Solar AI Dashboard
          </h1>
          <p className="text-gray-300 text-xl">Your intelligent solar analysis toolkit</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-black/40 backdrop-blur-md border border-gray-700 rounded-full p-1 flex gap-1">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "calculator", label: "Calculator", icon: Calculator },
              { id: "history", label: "History", icon: History },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`px-6 py-3 rounded-full flex items-center gap-2 transition-all duration-300 ${
                  activeTab === id
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Usage Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-black/40 backdrop-blur-md border border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Calculations Used</CardTitle>
                  <Calculator className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">
                    {usageData.calculationsUsed}/{usageData.calculationsLimit}
                  </div>
                  <Progress value={(usageData.calculationsUsed / usageData.calculationsLimit) * 100} className="mb-2" />
                  <p className="text-xs text-gray-400">
                    {usageData.calculationsLimit - usageData.calculationsUsed} calculations remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-md border border-gray-700 hover:border-green-400/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Reports Generated</CardTitle>
                  <FileText className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">
                    {usageData.reportsGenerated}/{usageData.reportsLimit}
                  </div>
                  <Progress value={(usageData.reportsGenerated / usageData.reportsLimit) * 100} className="mb-2" />
                  <p className="text-xs text-gray-400">
                    {usageData.reportsLimit - usageData.reportsGenerated} reports remaining
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-md border border-gray-700 hover:border-purple-400/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">Account Type</CardTitle>
                  <Zap className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-gray-700 text-white">
                      Free
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">Limited features available</p>
                </CardContent>
              </Card>
            </div>

            {/* Available Tools & Upgrade */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-black/40 backdrop-blur-md border border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Available Tools</CardTitle>
                  <CardDescription className="text-gray-400">Tools available with your free account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">Basic Calculator</h4>
                      <p className="text-sm text-gray-400">Simple solar estimates</p>
                    </div>
                    <Button
                      onClick={() => setActiveTab("calculator")}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600"
                    >
                      Use Tool
                    </Button>
                  </div>
                  <div className="flex items-center justify-between opacity-50">
                    <div>
                      <h4 className="font-medium flex items-center gap-2 text-white">
                        Advanced Calculator
                        <Lock className="h-4 w-4" />
                      </h4>
                      <p className="text-sm text-gray-400">Detailed analysis with custom parameters</p>
                    </div>
                    <Button size="sm" disabled className="bg-gray-600">
                      Pro Only
                    </Button>
                  </div>
                  <div className="flex items-center justify-between opacity-50">
                    <div>
                      <h4 className="font-medium flex items-center gap-2 text-white">
                        Pro Calculator
                        <Lock className="h-4 w-4" />
                      </h4>
                      <p className="text-sm text-gray-400">Professional-grade calculations</p>
                    </div>
                    <Button size="sm" disabled className="bg-gray-600">
                      Pro Only
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/40 backdrop-blur-md border border-gray-700 hover:border-pink-400/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">Upgrade to Pro</CardTitle>
                  <CardDescription className="text-gray-400">
                    Unlock all features and unlimited calculations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {[
                      "Unlimited calculations",
                      "Advanced solar analysis",
                      "Professional reports",
                      "Priority support",
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                  >
                    <Link href="/pricing">Upgrade Now</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Calculator Tab */}
        {activeTab === "calculator" && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <Card className="bg-black/40 backdrop-blur-md border border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calculator className="h-5 w-5 text-yellow-400" />
                    Solar Calculator
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Enter your details to calculate your solar potential
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-white">
                      Property Address *
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Solar Street, Austin, TX 78701"
                      className="bg-black/20 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly-bill" className="text-white">
                      Monthly Electric Bill ($)
                    </Label>
                    <Input
                      id="monthly-bill"
                      type="number"
                      value={formData.monthlyBill}
                      onChange={(e) => setFormData((prev) => ({ ...prev, monthlyBill: Number(e.target.value) }))}
                      className="bg-black/20 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Roof Size: {formData.roofArea.toLocaleString()} sq ft</Label>
                    <Slider
                      value={[formData.roofArea]}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, roofArea: value[0] }))}
                      max={3000}
                      min={500}
                      step={100}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Daily Sun Hours: {formData.sunHours}</Label>
                    <Slider
                      value={[formData.sunHours]}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, sunHours: value[0] }))}
                      max={8}
                      min={3}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="electricity-rate" className="text-white">
                      Electricity Rate ($/kWh)
                    </Label>
                    <Input
                      id="electricity-rate"
                      type="number"
                      step="0.01"
                      value={formData.electricityRate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, electricityRate: Number(e.target.value) }))}
                      className="bg-black/20 border-gray-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleCalculate}
                    disabled={isCalculating}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-semibold"
                  >
                    {isCalculating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      "Calculate Solar Potential"
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Results */}
              <Card className="bg-black/40 backdrop-blur-md border border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="h-5 w-5 text-green-400" />
                    Your Solar Estimate
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    {calculationResult ? "Here's what solar could do for you" : "Enter your information to see results"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculationResult ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <Home className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                          <div className="text-2xl font-bold text-blue-400">{calculationResult.systemSize} kW</div>
                          <div className="text-sm text-gray-400">System Size</div>
                        </div>

                        <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <Sun className="h-6 w-6 mx-auto mb-2 text-green-400" />
                          <div className="text-2xl font-bold text-green-400">
                            {(calculationResult.monthlyProduction * 12).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}{" "}
                            kWh
                          </div>
                          <div className="text-sm text-gray-400">Annual Production</div>
                        </div>

                        <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <DollarSign className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                          <div className="text-2xl font-bold text-yellow-400">
                            ${Math.round(calculationResult.annualSavings / 12)}
                          </div>
                          <div className="text-sm text-gray-400">Monthly Savings</div>
                        </div>

                        <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                          <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                          <div className="text-2xl font-bold text-purple-400">
                            {calculationResult.paybackPeriod} years
                          </div>
                          <div className="text-sm text-gray-400">Payback Period</div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-gray-700">
                        <div className="flex justify-between text-white">
                          <span>System Cost:</span>
                          <span className="font-semibold">${calculationResult.estimatedCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-400">
                          <span>Federal Tax Credit (30%):</span>
                          <span className="font-semibold">
                            -${Math.round(calculationResult.estimatedCost * 0.3).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-2 text-white">
                          <span>Net Cost:</span>
                          <span>${Math.round(calculationResult.estimatedCost * 0.7).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-green-400">
                          <span>Annual Savings:</span>
                          <span>${calculationResult.annualSavings.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={generatePDF}
                          disabled={isGeneratingPDF}
                          className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                        >
                          {isGeneratingPDF ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => window.print()}
                          variant="outline"
                          className="border-gray-600 text-white hover:bg-white/10"
                        >
                          Print
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Calculator className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Enter your information above to see your solar estimate</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="max-w-4xl mx-auto">
            <Card className="bg-black/40 backdrop-blur-md border border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <History className="h-5 w-5 text-blue-400" />
                  Calculation History
                </CardTitle>
                <CardDescription className="text-gray-400">Your saved solar calculations and reports</CardDescription>
              </CardHeader>
              <CardContent>
                {savedCalculations.length > 0 ? (
                  <div className="space-y-4">
                    {savedCalculations.map((calc) => (
                      <div
                        key={calc.id}
                        className="p-4 bg-black/20 border border-gray-600 rounded-lg hover:border-yellow-400/50 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-white">{calc.address}</h4>
                            <p className="text-sm text-gray-400">
                              System Size: {calc.systemSize} kW • Annual Savings: ${calc.annualSavings}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(calc.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-white hover:bg-white/10 bg-transparent"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-white hover:bg-white/10 bg-transparent"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No calculations saved yet</p>
                    <p className="text-sm">Use the calculator to create your first solar estimate</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
