"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { SmartSolarAnalysis } from "@/components/smart-solar-analysis"
import { useAuth } from "@/hooks/use-auth-real"
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  MapPin,
  Zap,
  Sun,
  AlertCircle,
  Crown,
  Lock,
} from "lucide-react"

interface CalculationData {
  address: string
  coordinates?: { lat: number; lng: number }
  monthlyBill: number
  roofType: string
  roofAge: number
  shadingLevel: string
  electricityRate: number
  utilityCompany: string
  energyUsage: number
  roofOrientation: string
  roofPitch: number
  additionalNotes: string
}

const STEPS = [
  { id: 1, title: "Property Details", icon: MapPin },
  { id: 2, title: "Energy Usage", icon: Zap },
  { id: 3, title: "Roof Information", icon: Sun },
  { id: 4, title: "Analysis Results", icon: Calculator },
]

export default function ProCalculatorPage() {
  const router = useRouter()
  const { user, loading, subscription, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationData, setCalculationData] = useState<CalculationData>({
    address: "",
    monthlyBill: 150,
    roofType: "",
    roofAge: 10,
    shadingLevel: "",
    electricityRate: 0.12,
    utilityCompany: "",
    energyUsage: 1000,
    roofOrientation: "",
    roofPitch: 30,
    additionalNotes: "",
  })
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  // Authentication and subscription check
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login?redirect=/pro-calculator")
        return
      }

      if (subscription !== "pro") {
        router.push("/pricing?upgrade=pro")
        return
      }
    }
  }, [loading, isAuthenticated, subscription, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show access denied for non-pro users
  if (!isAuthenticated || subscription !== "pro") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle>Pro Access Required</CardTitle>
            <CardDescription>This advanced calculator is available to Pro subscribers only.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">
                <Crown className="h-3 w-3 mr-1" />
                Pro Feature
              </Badge>
            </div>
            <Button onClick={() => router.push("/pricing?upgrade=pro")} className="w-full">
              Upgrade to Pro
            </Button>
            <Button variant="outline" onClick={() => router.push("/calculator")} className="w-full">
              Use Basic Calculator
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCalculate = async () => {
    setIsCalculating(true)

    try {
      // Simulate API call for advanced calculations
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock analysis results
      const mockResults = {
        address: calculationData.address,
        systemSize: 8.5,
        annualProduction: 12500,
        monthlyProduction: [950, 1100, 1250, 1350, 1400, 1450, 1400, 1300, 1200, 1050, 900, 850],
        financialAnalysis: {
          systemCost: 25500,
          monthlyBill: calculationData.monthlyBill,
          monthlySavings: 125,
          annualSavings: 1500,
          paybackPeriod: 8.2,
          roi25Year: 285,
          netPresentValue: 35000,
        },
        technicalSpecs: {
          panelCount: 24,
          panelWattage: 350,
          inverterType: "String Inverter",
          roofArea: 480,
          efficiency: 92,
          degradationRate: 0.5,
        },
        environmental: {
          co2OffsetAnnual: 8750,
          co2Offset25Year: 218750,
          treesEquivalent: 125,
          coalOffset: 109375,
        },
        incentives: {
          federalTaxCredit: 7650,
          stateIncentives: 2000,
          utilityRebates: 1500,
          totalIncentives: 11150,
        },
      }

      setAnalysisResults(mockResults)
      setCurrentStep(4)
    } catch (error) {
      console.error("Calculation error:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const updateCalculationData = (field: keyof CalculationData, value: any) => {
    setCalculationData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Badge variant="secondary" className="mr-2">
              <Crown className="h-3 w-3 mr-1" />
              Pro Calculator
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Solar Analysis</h1>
          <p className="text-gray-600">Get detailed insights with our professional-grade solar calculator</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      currentStep >= step.id
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-300 text-gray-400"
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>
                Step {currentStep} of {STEPS.length}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "h-5 w-5 mr-2" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your property address and location details"}
              {currentStep === 2 && "Provide your current energy usage information"}
              {currentStep === 3 && "Tell us about your roof characteristics"}
              {currentStep === 4 && "Review your comprehensive solar analysis"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Property Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <AddressAutocomplete
                  onAddressSelect={(address, coordinates) => {
                    updateCalculationData("address", address)
                    updateCalculationData("coordinates", coordinates)
                  }}
                  placeholder="Enter your property address"
                  label="Property Address"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="utility">Utility Company</Label>
                    <Input
                      id="utility"
                      placeholder="e.g., Pacific Gas & Electric"
                      value={calculationData.utilityCompany}
                      onChange={(e) => updateCalculationData("utilityCompany", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Electricity Rate ($/kWh)</Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      placeholder="0.12"
                      value={calculationData.electricityRate}
                      onChange={(e) => updateCalculationData("electricityRate", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Energy Usage */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyBill">Average Monthly Electric Bill ($)</Label>
                    <Input
                      id="monthlyBill"
                      type="number"
                      value={calculationData.monthlyBill}
                      onChange={(e) => updateCalculationData("monthlyBill", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="energyUsage">Monthly Energy Usage (kWh)</Label>
                    <Input
                      id="energyUsage"
                      type="number"
                      value={calculationData.energyUsage}
                      onChange={(e) => updateCalculationData("energyUsage", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Energy Usage Slider: {calculationData.energyUsage} kWh/month</Label>
                  <Slider
                    value={[calculationData.energyUsage]}
                    onValueChange={(value) => updateCalculationData("energyUsage", value[0])}
                    max={3000}
                    min={200}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Low Usage (200 kWh)</span>
                    <span>High Usage (3000 kWh)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Roof Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="roofType">Roof Type</Label>
                    <Select
                      value={calculationData.roofType}
                      onValueChange={(value) => updateCalculationData("roofType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asphalt">Asphalt Shingles</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="tile">Tile</SelectItem>
                        <SelectItem value="slate">Slate</SelectItem>
                        <SelectItem value="flat">Flat Roof</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roofOrientation">Primary Roof Orientation</Label>
                    <Select
                      value={calculationData.roofOrientation}
                      onValueChange={(value) => updateCalculationData("roofOrientation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="south">South</SelectItem>
                        <SelectItem value="southwest">Southwest</SelectItem>
                        <SelectItem value="southeast">Southeast</SelectItem>
                        <SelectItem value="west">West</SelectItem>
                        <SelectItem value="east">East</SelectItem>
                        <SelectItem value="north">North</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="shadingLevel">Shading Level</Label>
                    <Select
                      value={calculationData.shadingLevel}
                      onValueChange={(value) => updateCalculationData("shadingLevel", value)}
                    >
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

                  <div className="space-y-2">
                    <Label htmlFor="roofAge">Roof Age (years)</Label>
                    <Input
                      id="roofAge"
                      type="number"
                      value={calculationData.roofAge}
                      onChange={(e) => updateCalculationData("roofAge", Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Roof Pitch: {calculationData.roofPitch}°</Label>
                  <Slider
                    value={[calculationData.roofPitch]}
                    onValueChange={(value) => updateCalculationData("roofPitch", value[0])}
                    max={60}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Flat (0°)</span>
                    <span>Steep (60°)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information about your property or specific requirements..."
                    value={calculationData.additionalNotes}
                    onChange={(e) => updateCalculationData("additionalNotes", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Results */}
            {currentStep === 4 && (
              <div>
                {isCalculating ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h3 className="text-lg font-semibold mb-2">Analyzing Your Property</h3>
                    <p className="text-gray-600 mb-4">Our advanced algorithms are processing your data...</p>
                    <div className="max-w-md mx-auto">
                      <Progress value={66} className="h-2" />
                    </div>
                  </div>
                ) : analysisResults ? (
                  <SmartSolarAnalysis analysisData={analysisResults} />
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No analysis results available</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep < 4 && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === 3 ? (
              <Button onClick={handleCalculate} disabled={!calculationData.address || isCalculating}>
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    Calculate Analysis
                    <Calculator className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={currentStep === 1 && !calculationData.address}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}

        {/* Results Navigation */}
        {currentStep === 4 && analysisResults && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Start New Analysis
            </Button>

            <div className="space-x-2">
              <Button variant="outline">Share Results</Button>
              <Button>Download PDF Report</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
