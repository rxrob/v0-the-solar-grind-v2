"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  MapPin,
  Zap,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Crown,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { SmartSolarAnalysis } from "@/components/smart-solar-analysis"
import { AdvancedSolarCalculator } from "@/components/advanced-solar-calculator"
import { ReportGenerator } from "@/components/report-generator"
import { useAuth } from "@/hooks/use-auth-real"

type Step = "address" | "analysis" | "calculator" | "report"

interface StepConfig {
  id: Step
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

export default function ProCalculatorPage() {
  const router = useRouter()
  const { user, loading: authLoading, session } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>("address")
  const [completedSteps, setCompletedSteps] = useState<Set<Step>>(new Set())
  const [loading, setLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [selectedAddress, setSelectedAddress] = useState("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [placeId, setPlaceId] = useState("")
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [calculationResults, setCalculationResults] = useState<any>(null)

  const steps: StepConfig[] = [
    {
      id: "address",
      title: "Property Address",
      description: "Enter the property address for solar analysis",
      icon: <MapPin className="h-5 w-5" />,
      completed: completedSteps.has("address"),
    },
    {
      id: "analysis",
      title: "Smart Analysis",
      description: "AI-powered solar potential analysis",
      icon: <Zap className="h-5 w-5" />,
      completed: completedSteps.has("analysis"),
    },
    {
      id: "calculator",
      title: "Advanced Calculator",
      description: "Detailed system sizing and calculations",
      icon: <Calculator className="h-5 w-5" />,
      completed: completedSteps.has("calculator"),
    },
    {
      id: "report",
      title: "Professional Report",
      description: "Generate comprehensive PDF report",
      icon: <FileText className="h-5 w-5" />,
      completed: completedSteps.has("report"),
    },
  ]

  // Check authentication and subscription status
  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return

      if (!user) {
        router.push("/login?redirect=/pro-calculator")
        return
      }

      try {
        // Check subscription status
        const response = await fetch("/api/verify-user-status", {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to verify subscription status")
        }

        const data = await response.json()
        setSubscriptionStatus(data.subscription_status)

        if (data.subscription_status !== "pro" && data.subscription_status !== "admin") {
          setError("Pro subscription required to access this calculator")
          return
        }

        setLoading(false)
      } catch (err) {
        console.error("Error checking access:", err)
        setError("Failed to verify access permissions")
      }
    }

    checkAccess()
  }, [user, authLoading, session, router])

  const handleAddressSelect = (address: string, coords: { lat: number; lng: number }, placeIdValue: string) => {
    setSelectedAddress(address)
    setCoordinates(coords)
    setPlaceId(placeIdValue)
    setCompletedSteps((prev) => new Set([...prev, "address"]))
  }

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results)
    setCompletedSteps((prev) => new Set([...prev, "analysis"]))
  }

  const handleCalculationComplete = (results: any) => {
    setCalculationResults(results)
    setCompletedSteps((prev) => new Set([...prev, "calculator"]))
  }

  const handleReportGenerated = () => {
    setCompletedSteps((prev) => new Set([...prev, "report"]))
  }

  const goToStep = (step: Step) => {
    const stepIndex = steps.findIndex((s) => s.id === step)
    const currentIndex = steps.findIndex((s) => s.id === currentStep)

    // Only allow going to completed steps or the next step
    if (stepIndex <= currentIndex || completedSteps.has(step)) {
      setCurrentStep(step)
    }
  }

  const nextStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const prevStep = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  const getStepProgress = () => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep)
    return ((currentIndex + 1) / steps.length) * 100
  }

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading Pro Calculator...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            {error.includes("Pro subscription") && (
              <div className="mt-4 text-center">
                <Button onClick={() => router.push("/pricing")}>Upgrade to Pro</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold">Pro Solar Calculator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced AI-powered solar analysis with professional reporting capabilities
          </p>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Pro Feature
          </Badge>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(getStepProgress())}% Complete</span>
              </div>
              <Progress value={getStepProgress()} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Step Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={
                    !completedSteps.has(step.id) &&
                    step.id !== currentStep &&
                    index > steps.findIndex((s) => s.id === currentStep)
                  }
                  className={`p-4 rounded-lg border text-left transition-all ${
                    currentStep === step.id
                      ? "border-blue-500 bg-blue-50"
                      : completedSteps.has(step.id)
                        ? "border-green-500 bg-green-50 hover:bg-green-100"
                        : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {completedSteps.has(step.id) ? <CheckCircle className="h-5 w-5 text-green-600" /> : step.icon}
                    <span className="font-medium">{step.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === "address" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Property Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  placeholder="Enter property address (e.g., 1600 Amphitheatre Parkway, Mountain View, CA)"
                  label="Property Address"
                />

                {selectedAddress && coordinates && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Address Selected</span>
                    </div>
                    <p className="text-sm text-green-600">{selectedAddress}</p>
                    <p className="text-xs text-green-500 font-mono">
                      {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === "analysis" && selectedAddress && coordinates && (
            <SmartSolarAnalysis
              address={selectedAddress}
              coordinates={coordinates}
              onAnalysisComplete={handleAnalysisComplete}
            />
          )}

          {currentStep === "calculator" && (
            <AdvancedSolarCalculator
              address={selectedAddress}
              coordinates={coordinates}
              analysisResults={analysisResults}
              onCalculationComplete={handleCalculationComplete}
            />
          )}

          {currentStep === "report" && (
            <ReportGenerator
              address={selectedAddress}
              coordinates={coordinates}
              analysisResults={analysisResults}
              calculationResults={calculationResults}
              onReportGenerated={handleReportGenerated}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === "address"}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                onClick={nextStep}
                disabled={
                  currentStep === "report" ||
                  (currentStep === "address" && !completedSteps.has("address")) ||
                  (currentStep === "analysis" && !completedSteps.has("analysis")) ||
                  (currentStep === "calculator" && !completedSteps.has("calculator"))
                }
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Getting Started</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Enter a valid property address</li>
                  <li>• Wait for smart analysis to complete</li>
                  <li>• Review and adjust calculations</li>
                  <li>• Generate professional report</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Pro Features</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• AI-powered solar analysis</li>
                  <li>• Advanced system calculations</li>
                  <li>• Professional PDF reports</li>
                  <li>• Detailed financial projections</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
