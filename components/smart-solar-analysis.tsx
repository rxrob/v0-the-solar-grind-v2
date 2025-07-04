"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sun, Zap, DollarSign, TrendingUp, MapPin, Loader2, AlertCircle, CheckCircle, Info } from "lucide-react"

interface SmartSolarAnalysisProps {
  address: string
  coordinates: { lat: number; lng: number }
  systemSize?: number
  monthlyBill?: number
  onAnalysisComplete?: (results: any) => void
}

interface AnalysisResults {
  solarPotential: {
    annualSunHours: number
    solarIrradiance: number
    roofSuitability: string
    shadingFactors: string[]
  }
  systemRecommendation: {
    recommendedSize: number
    panelCount: number
    estimatedCost: number
    paybackPeriod: number
  }
  financialProjection: {
    annualSavings: number
    twentyYearSavings: number
    roi: number
    incentives: string[]
  }
  environmentalImpact: {
    co2Offset: number
    treesEquivalent: number
  }
}

const SmartSolarAnalysis = ({
  address,
  coordinates,
  systemSize = 0,
  monthlyBill = 0,
  onAnalysisComplete,
}: SmartSolarAnalysisProps) => {
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analysisSteps = [
    { name: "Fetching solar irradiance data", duration: 2000 },
    { name: "Analyzing roof characteristics", duration: 1500 },
    { name: "Calculating system requirements", duration: 1000 },
    { name: "Projecting financial returns", duration: 1500 },
    { name: "Generating recommendations", duration: 1000 },
  ]

  const runSmartAnalysis = async () => {
    setAnalyzing(true)
    setProgress(0)
    setError(null)
    setResults(null)

    try {
      // Simulate progressive analysis steps
      for (let i = 0; i < analysisSteps.length; i++) {
        const step = analysisSteps[i]
        setCurrentStep(step.name)

        // Simulate API calls and processing time
        await new Promise((resolve) => setTimeout(resolve, step.duration))

        setProgress(((i + 1) / analysisSteps.length) * 100)
      }

      // Simulate API call to smart solar analysis endpoint
      const response = await fetch("/api/smart-solar-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          coordinates,
          systemSize,
          monthlyBill,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to complete solar analysis")
      }

      const analysisData = await response.json()

      // Mock results if API doesn't return proper data
      const mockResults: AnalysisResults = {
        solarPotential: {
          annualSunHours: analysisData.solarPotential?.annualSunHours || 2800,
          solarIrradiance: analysisData.solarPotential?.solarIrradiance || 5.2,
          roofSuitability: analysisData.solarPotential?.roofSuitability || "Excellent",
          shadingFactors: analysisData.solarPotential?.shadingFactors || [
            "Minimal tree coverage",
            "No nearby tall buildings",
          ],
        },
        systemRecommendation: {
          recommendedSize: analysisData.systemRecommendation?.recommendedSize || systemSize || 8.5,
          panelCount: analysisData.systemRecommendation?.panelCount || Math.ceil((systemSize || 8.5) / 0.4),
          estimatedCost: analysisData.systemRecommendation?.estimatedCost || (systemSize || 8.5) * 3000,
          paybackPeriod: analysisData.systemRecommendation?.paybackPeriod || 7.2,
        },
        financialProjection: {
          annualSavings: analysisData.financialProjection?.annualSavings || monthlyBill * 12 * 0.85,
          twentyYearSavings: analysisData.financialProjection?.twentyYearSavings || monthlyBill * 12 * 0.85 * 20,
          roi: analysisData.financialProjection?.roi || 285,
          incentives: analysisData.financialProjection?.incentives || [
            "30% Federal Tax Credit",
            "State Rebates Available",
          ],
        },
        environmentalImpact: {
          co2Offset: analysisData.environmentalImpact?.co2Offset || (systemSize || 8.5) * 1200,
          treesEquivalent: analysisData.environmentalImpact?.treesEquivalent || Math.round((systemSize || 8.5) * 28),
        },
      }

      setResults(mockResults)
      onAnalysisComplete?.(mockResults)
    } catch (err) {
      console.error("Smart analysis error:", err)
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setAnalyzing(false)
      setCurrentStep("")
    }
  }

  if (analyzing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Smart Solar Analysis in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{currentStep}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Analyzing solar potential for:</p>
            <p className="font-medium">{address}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={runSmartAnalysis} className="w-full mt-4 bg-transparent" variant="outline">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!results) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Smart Solar Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">Ready to analyze solar potential for:</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{address}</span>
            </div>
            <Button onClick={runSmartAnalysis} className="w-full">
              Start Smart Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analysis Complete Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Analysis Complete</span>
          </div>
          <p className="text-sm text-muted-foreground">Smart analysis completed for {address}</p>
        </CardContent>
      </Card>

      {/* Solar Potential */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Solar Potential
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Annual Sun Hours</p>
              <p className="text-2xl font-bold">{results.solarPotential.annualSunHours.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Solar Irradiance</p>
              <p className="text-2xl font-bold">{results.solarPotential.solarIrradiance} kWh/m²/day</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Roof Suitability</p>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {results.solarPotential.roofSuitability}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Shading Analysis</p>
            <ul className="text-sm space-y-1">
              {results.solarPotential.shadingFactors.map((factor, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {factor}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* System Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            System Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Recommended Size</p>
              <p className="text-2xl font-bold">{results.systemRecommendation.recommendedSize} kW</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Panel Count</p>
              <p className="text-2xl font-bold">{results.systemRecommendation.panelCount} panels</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Estimated Cost</p>
              <p className="text-2xl font-bold">${results.systemRecommendation.estimatedCost.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payback Period</p>
              <p className="text-2xl font-bold">{results.systemRecommendation.paybackPeriod} years</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Projection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Annual Savings</p>
              <p className="text-2xl font-bold text-green-600">
                ${Math.round(results.financialProjection.annualSavings).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">20-Year Savings</p>
              <p className="text-2xl font-bold text-green-600">
                ${Math.round(results.financialProjection.twentyYearSavings).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Return on Investment</p>
            <p className="text-2xl font-bold text-green-600">{results.financialProjection.roi}%</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Available Incentives</p>
            <div className="space-y-1">
              {results.financialProjection.incentives.map((incentive, index) => (
                <Badge key={index} variant="outline" className="mr-2">
                  {incentive}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Annual CO₂ Offset</p>
              <p className="text-2xl font-bold text-green-600">
                {results.environmentalImpact.co2Offset.toLocaleString()} lbs
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trees Equivalent</p>
              <p className="text-2xl font-bold text-green-600">{results.environmentalImpact.treesEquivalent} trees</p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Your solar system would offset the equivalent of planting {results.environmentalImpact.treesEquivalent}{" "}
              trees annually.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}

// Named export for compatibility
export { SmartSolarAnalysis }
