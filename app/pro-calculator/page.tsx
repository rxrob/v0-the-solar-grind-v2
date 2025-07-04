"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  MapPin,
  Zap,
  DollarSign,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Crown,
  Lock,
  AlertCircle,
} from "lucide-react"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { SmartSolarAnalysis } from "@/components/smart-solar-analysis"
import { useAuth } from "@/hooks/use-auth-real"
import Link from "next/link"

const STEPS = [
  { id: 1, title: "Property Details", icon: MapPin },
  { id: 2, title: "Energy Usage", icon: Zap },
  { id: 3, title: "System Configuration", icon: Calculator },
  { id: 4, title: "Financial Analysis", icon: DollarSign },
  { id: 5, title: "Results", icon: CheckCircle },
]

interface CalculationData {
  address: string
  monthlyBill: number
  roofType: string
  shading: string
  systemSize: number
  panelType: string
  financing: string
}

export default function ProCalculatorPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [calculationData, setCalculationData] = useState<CalculationData>({
    address: "",
    monthlyBill: 0,
    roofType: "",
    shading: "",
    systemSize: 0,
    panelType: "",
    financing: "",
  })
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [userSubscription, setUserSubscription] = useState<string | null>(null)

  // Check authentication and subscription
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/pro-calculator")
      return
    }

    if (user) {
      checkUserSubscription()
    }
  }, [user, authLoading, router])

  const checkUserSubscription = async () => {
    try {
      const response = await fetch("/api/verify-user-status")
      const data = await response.json()

      if (data.subscription_status !== "pro" && data.subscription_status !== "trial") {
        setError("Pro subscription required to access this calculator")
        return
      }

      setUserSubscription(data.subscription_status)
    } catch (err) {
      console.error("Error checking subscription:", err)
      setError("Failed to verify subscription status")
    }
  }

  const handleAddressSelect = (address: string, lat?: number, lng?: number) => {
    setCalculationData((prev) => ({ ...prev, address }))
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
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/pro-calculation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(calculationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Calculation failed")
      }

      setAnalysisResults(data)
      setCurrentStep(5)
    } catch (err) {
      console.error("Calculation error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during calculation")
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if not authenticated or no subscription
  if (!user || error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Pro Calculator Access Required</CardTitle>
              <CardDescription>{!user ? "Please sign in to access the Pro Solar Calculator" : error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {!user ? (
                <div className="flex gap-4 justify-center">
                  <Link href="/login">
                    <Button>Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="outline">Create Account</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800">
            <Crown className="h-3 w-3 mr-1" />
            Pro Calculator
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Solar Analysis</h1>
          <p className="text-gray-600">Professional-grade solar calculations with detailed insights</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-full h-0.5 mx-4 ${currentStep > step.id ? "bg-blue-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {STEPS[currentStep - 1].icon} Step {currentStep}: {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Enter your property address for location-specific analysis"}
              {currentStep === 2 && "Provide your energy usage information"}
              {currentStep === 3 && "Configure your solar system preferences"}
              {currentStep === 4 && "Review financial options and incentives"}
              {currentStep === 5 && "View your comprehensive solar analysis"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Property Details */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  value={calculationData.address}
                  label="Property Address"
                  placeholder="Enter your property address"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Roof Type</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={calculationData.roofType}
                      onChange={(e) => setCalculationData((prev) => ({ ...prev, roofType: e.target.value }))}
                    >
                      <option value="">Select roof type</option>
                      <option value="asphalt">Asphalt Shingles</option>
                      <option value="metal">Metal</option>
                      <option value="tile">Tile</option>
                      <option value="flat">Flat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Shading Conditions</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={calculationData.shading}
                      onChange={(e) => setCalculationData((prev) => ({ ...prev, shading: e.target.value }))}
                    >
                      <option value="">Select shading</option>
                      <option value="none">No Shading</option>
                      <option value="minimal">Minimal Shading</option>
                      <option value="moderate">Moderate Shading</option>
                      <option value="heavy">Heavy Shading</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Energy Usage */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Average Monthly Electric Bill</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      className="w-full pl-8 p-2 border border-gray-300 rounded-md"
                      placeholder="150"
                      value={calculationData.monthlyBill || ""}
                      onChange={(e) => setCalculationData((prev) => ({ ...prev, monthlyBill: Number(e.target.value) }))}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Enter your average monthly electricity bill amount</p>
                </div>
              </div>
            )}

            {/* Step 3: System Configuration */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Preferred System Size (kW)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="8.0"
                      value={calculationData.systemSize || ""}
                      onChange={(e) => setCalculationData((prev) => ({ ...prev, systemSize: Number(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Panel Type</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={calculationData.panelType}
                      onChange={(e) => setCalculationData((prev) => ({ ...prev, panelType: e.target.value }))}
                    >
                      <option value="">Select panel type</option>
                      <option value="monocrystalline">Monocrystalline (Premium)</option>
                      <option value="polycrystalline">Polycrystalline (Standard)</option>
                      <option value="thin-film">Thin Film (Budget)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Financial Analysis */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Financing Option</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={calculationData.financing}
                    onChange={(e) => setCalculationData((prev) => ({ ...prev, financing: e.target.value }))}
                  >
                    <option value="">Select financing</option>
                    <option value="cash">Cash Purchase</option>
                    <option value="loan">Solar Loan</option>
                    <option value="lease">Solar Lease</option>
                    <option value="ppa">Power Purchase Agreement (PPA)</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Available Incentives</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Federal Solar Tax Credit (30%)</li>
                    <li>• State and Local Rebates</li>
                    <li>• Net Metering Programs</li>
                    <li>• Utility Incentives</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 5: Results */}
            {currentStep === 5 && analysisResults && <SmartSolarAnalysis analysisData={analysisResults} />}

            {error && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < 4 && (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !calculationData.address) ||
                (currentStep === 2 && !calculationData.monthlyBill) ||
                (currentStep === 3 && !calculationData.systemSize)
              }
              className="flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {currentStep === 4 && (
            <Button
              onClick={handleCalculate}
              disabled={loading || !calculationData.financing}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? "Calculating..." : "Generate Analysis"}
              <Calculator className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
