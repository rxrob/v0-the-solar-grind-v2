"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { SmartSolarAnalysis } from "@/components/smart-solar-analysis"
import { useAuth } from "@/hooks/use-auth-real"
import {
  Calculator,
  MapPin,
  Home,
  Zap,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  Crown,
  Lock,
  CheckCircle,
} from "lucide-react"

interface CalculatorData {
  address: string
  coordinates?: { lat: number; lng: number }
  monthlyBill: number
  roofArea: number
  systemSize: number
  shadingFactor: number
  roofOrientation: string
  roofTilt: number
}

const STEPS = [
  { id: 1, title: "Property Details", icon: MapPin },
  { id: 2, title: "Energy Usage", icon: Zap },
  { id: 3, title: "Roof Analysis", icon: Home },
  { id: 4, title: "Smart Analysis", icon: Calculator },
]

export default function ProCalculatorPage() {
  const router = useRouter()
  const { user, loading, isProUser, subscription } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    address: "",
    monthlyBill: 0,
    roofArea: 0,
    systemSize: 0,
    shadingFactor: 1,
    roofOrientation: "south",
    roofTilt: 30,
  })

  // Redirect if not authenticated or not pro user
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login?redirect=/pro-calculator")
        return
      }

      if (!isProUser) {
        router.push("/pricing?upgrade=pro")
        return
      }
    }
  }, [user, loading, isProUser, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show access denied if not pro user
  if (!isProUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Pro Calculator Access</CardTitle>
            <CardDescription>This advanced calculator is available for Pro subscribers only</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-4">
                Current Plan: {subscription || "Free"}
              </Badge>
            </div>
            <Button onClick={() => router.push("/pricing?upgrade=pro")} className="w-full">
              <Crown className="h-4 w-4 mr-2" />
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

  const handleAddressSelect = (address: string, lat?: number, lng?: number) => {
    setCalculatorData((prev) => ({
      ...prev,
      address,
      coordinates: lat && lng ? { lat, lng } : undefined,
    }))
  }

  const updateCalculatorData = (field: keyof CalculatorData, value: any) => {
    setCalculatorData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const calculateSystemSize = () => {
    // Simple system size calculation based on monthly bill
    const estimatedAnnualUsage = (calculatorData.monthlyBill * 12) / 0.12 // Assuming $0.12/kWh
    const systemSize = estimatedAnnualUsage / 1200 // Assuming 1200 kWh/kW/year
    updateCalculatorData("systemSize", Math.round(systemSize * 10) / 10)
  }

  const progress = (currentStep / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-6 w-6 text-yellow-500" />
            <h1 className="text-3xl font-bold">Pro Solar Calculator</h1>
          </div>
          <p className="text-muted-foreground">Advanced solar analysis with detailed insights and recommendations</p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="mb-4" />

            {/* Step Indicators */}
            <div className="flex justify-between">
              {STEPS.map((step) => {
                const Icon = step.icon
                const isActive = step.id === currentStep
                const isCompleted = step.id < currentStep

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-2
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isCompleted
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-400"
                      }
                    `}
                    >
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <span className={`text-xs text-center ${isActive ? "text-blue-600 font-medium" : "text-gray-500"}`}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(STEPS[currentStep - 1].icon, { className: "h-5 w-5" })}
              {STEPS[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Property Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Property Address</Label>
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    placeholder="Enter your property address"
                    className="mt-2"
                  />
                  {calculatorData.address && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Address confirmed: {calculatorData.address}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Energy Usage */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="monthlyBill">Average Monthly Electric Bill ($)</Label>
                  <Input
                    id="monthlyBill"
                    type="number"
                    value={calculatorData.monthlyBill || ""}
                    onChange={(e) => updateCalculatorData("monthlyBill", Number.parseFloat(e.target.value) || 0)}
                    placeholder="Enter your average monthly bill"
                    className="mt-2"
                  />
                </div>

                {calculatorData.monthlyBill > 0 && (
                  <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                      Based on your ${calculatorData.monthlyBill}/month bill, you use approximately{" "}
                      {Math.round((calculatorData.monthlyBill * 12) / 0.12)} kWh annually.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 3: Roof Analysis */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roofArea">Available Roof Area (sq ft)</Label>
                  <Input
                    id="roofArea"
                    type="number"
                    value={calculatorData.roofArea || ""}
                    onChange={(e) => updateCalculatorData("roofArea", Number.parseFloat(e.target.value) || 0)}
                    placeholder="Enter available roof area"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="roofOrientation">Roof Orientation</Label>
                  <select
                    id="roofOrientation"
                    value={calculatorData.roofOrientation}
                    onChange={(e) => updateCalculatorData("roofOrientation", e.target.value)}
                    className="mt-2 w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="south">South</option>
                    <option value="southeast">Southeast</option>
                    <option value="southwest">Southwest</option>
                    <option value="east">East</option>
                    <option value="west">West</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="roofTilt">Roof Tilt (degrees)</Label>
                  <Input
                    id="roofTilt"
                    type="number"
                    value={calculatorData.roofTilt || ""}
                    onChange={(e) => updateCalculatorData("roofTilt", Number.parseFloat(e.target.value) || 0)}
                    placeholder="Enter roof tilt angle"
                    className="mt-2"
                  />
                </div>

                <Button onClick={calculateSystemSize} variant="outline" className="w-full bg-transparent">
                  Calculate Recommended System Size
                </Button>

                {calculatorData.systemSize > 0 && (
                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertDescription>
                      Recommended system size: {calculatorData.systemSize} kW (
                      {Math.round(calculatorData.systemSize / 0.4)} panels)
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 4: Smart Analysis */}
            {currentStep === 4 && (
              <div className="space-y-4">
                {calculatorData.address && calculatorData.systemSize > 0 ? (
                  <SmartSolarAnalysis
                    address={calculatorData.address}
                    systemSize={calculatorData.systemSize}
                    monthlyBill={calculatorData.monthlyBill}
                    roofArea={calculatorData.roofArea}
                  />
                ) : (
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription>Please complete the previous steps to run the smart analysis.</AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !calculatorData.address) ||
                (currentStep === 2 && calculatorData.monthlyBill <= 0) ||
                (currentStep === 3 && (calculatorData.roofArea <= 0 || calculatorData.systemSize <= 0))
              }
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => router.push("/dashboard/pro")}>
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
