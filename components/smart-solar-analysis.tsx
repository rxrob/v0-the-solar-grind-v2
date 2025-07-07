"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Brain, Satellite, TrendingUp, Leaf, MapPin, Sun, Zap, DollarSign, Calendar, CheckCircle } from "lucide-react"

interface AnalysisStep {
  id: string
  title: string
  description: string
  progress: number
  completed: boolean
}

interface AnalysisResults {
  roofAnalysis: {
    totalArea: number
    usableArea: number
    optimalTilt: number
    shading: number
    orientation: string
  }
  energyAnalysis: {
    currentUsage: number
    solarProduction: number
    offsetPercentage: number
    excessEnergy: number
  }
  financialAnalysis: {
    systemCost: number
    incentives: number
    netCost: number
    paybackPeriod: number
    roi: number
    savings25Years: number
  }
  environmentalImpact: {
    co2Avoided: number
    treesEquivalent: number
    carsOffRoad: number
  }
}

export function SmartSolarAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [results, setResults] = useState<AnalysisResults | null>(null)

  const analysisSteps: AnalysisStep[] = [
    {
      id: "satellite",
      title: "Satellite Imagery Analysis",
      description: "Analyzing your roof using high-resolution satellite data",
      progress: 0,
      completed: false,
    },
    {
      id: "shading",
      title: "Shading Assessment",
      description: "Calculating shading patterns throughout the year",
      progress: 0,
      completed: false,
    },
    {
      id: "weather",
      title: "Weather Data Integration",
      description: "Processing local weather and solar irradiance data",
      progress: 0,
      completed: false,
    },
    {
      id: "energy",
      title: "Energy Production Modeling",
      description: "Simulating solar panel performance and energy output",
      progress: 0,
      completed: false,
    },
    {
      id: "financial",
      title: "Financial Analysis",
      description: "Calculating costs, savings, and return on investment",
      progress: 0,
      completed: false,
    },
    {
      id: "optimization",
      title: "System Optimization",
      description: "Finding the optimal solar system configuration",
      progress: 0,
      completed: false,
    },
  ]

  const [steps, setSteps] = useState(analysisSteps)

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setCurrentStep(0)

    // Simulate analysis steps
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i)

      // Animate progress for current step
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setSteps((prev) => prev.map((step, index) => (index === i ? { ...step, progress } : step)))
      }

      // Mark step as completed
      setSteps((prev) => prev.map((step, index) => (index === i ? { ...step, completed: true } : step)))

      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    // Generate mock results
    const mockResults: AnalysisResults = {
      roofAnalysis: {
        totalArea: 2400,
        usableArea: 1800,
        optimalTilt: 32,
        shading: 15,
        orientation: "South-Southwest",
      },
      energyAnalysis: {
        currentUsage: 12500,
        solarProduction: 11200,
        offsetPercentage: 89.6,
        excessEnergy: 0,
      },
      financialAnalysis: {
        systemCost: 28500,
        incentives: 8550,
        netCost: 19950,
        paybackPeriod: 7.2,
        roi: 18.5,
        savings25Years: 42300,
      },
      environmentalImpact: {
        co2Avoided: 8.2,
        treesEquivalent: 186,
        carsOffRoad: 1.8,
      },
    }

    setResults(mockResults)
    setIsAnalyzing(false)
  }

  const resetAnalysis = () => {
    setIsAnalyzing(false)
    setCurrentStep(0)
    setResults(null)
    setSteps(analysisSteps.map((step) => ({ ...step, progress: 0, completed: false })))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-500" />
          Smart Solar Analysis
        </h1>
        <p className="text-muted-foreground">
          AI-powered comprehensive solar assessment using satellite imagery and advanced modeling
        </p>
      </div>

      {!isAnalyzing && !results && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Analyze Your Property?</CardTitle>
            <CardDescription>
              Our AI will analyze your roof, local weather patterns, and energy usage to provide a comprehensive solar
              assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <Satellite className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-semibold">Satellite Analysis</h3>
                <p className="text-sm text-muted-foreground">High-resolution roof assessment</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-semibold">Performance Modeling</h3>
                <p className="text-sm text-muted-foreground">Accurate energy predictions</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Leaf className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                <h3 className="font-semibold">Environmental Impact</h3>
                <p className="text-sm text-muted-foreground">Carbon footprint reduction</p>
              </div>
            </div>
            <Button onClick={runAnalysis} size="lg" className="w-full">
              Start Smart Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Your Property...</CardTitle>
            <CardDescription>Please wait while our AI processes your solar potential</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : index === currentStep ? (
                      <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span
                      className={`font-medium ${step.completed ? "text-green-600" : index === currentStep ? "text-blue-600" : "text-muted-foreground"}`}
                    >
                      {step.title}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">{step.progress}%</span>
                </div>
                <Progress value={step.progress} className="h-2" />
                <p className="text-sm text-muted-foreground pl-7">{step.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Analysis Complete</h2>
            <Button variant="outline" onClick={resetAnalysis}>
              Run New Analysis
            </Button>
          </div>

          <Tabs defaultValue="roof" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="roof">Roof Analysis</TabsTrigger>
              <TabsTrigger value="energy">Energy</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
            </TabsList>

            <TabsContent value="roof" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Roof Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Roof Area:</span>
                        <span className="font-semibold">{results.roofAnalysis.totalArea.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Usable Area:</span>
                        <span className="font-semibold">{results.roofAnalysis.usableArea.toLocaleString()} sq ft</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimal Tilt:</span>
                        <span className="font-semibold">{results.roofAnalysis.optimalTilt}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Roof Orientation:</span>
                        <span className="font-semibold">{results.roofAnalysis.orientation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shading Impact:</span>
                        <Badge variant={results.roofAnalysis.shading < 20 ? "default" : "destructive"}>
                          {results.roofAnalysis.shading}% shaded
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                      <div className="text-center">
                        <Satellite className="h-16 w-16 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm text-muted-foreground">Satellite imagery analysis</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="energy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Energy Production Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Current Annual Usage:</span>
                        <span className="font-semibold">
                          {results.energyAnalysis.currentUsage.toLocaleString()} kWh
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projected Solar Production:</span>
                        <span className="font-semibold">
                          {results.energyAnalysis.solarProduction.toLocaleString()} kWh
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energy Offset:</span>
                        <Badge variant="default">{results.energyAnalysis.offsetPercentage}%</Badge>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-green-50 rounded-lg">
                        <Sun className="h-12 w-12 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">
                          {results.energyAnalysis.offsetPercentage}%
                        </div>
                        <p className="text-sm text-muted-foreground">Energy Independence</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>System Cost:</span>
                        <span className="font-semibold">${results.financialAnalysis.systemCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Incentives & Tax Credits:</span>
                        <span className="font-semibold">-${results.financialAnalysis.incentives.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Net Investment:</span>
                        <span>${results.financialAnalysis.netCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payback Period:</span>
                        <span className="font-semibold">{results.financialAnalysis.paybackPeriod} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span>25-Year ROI:</span>
                        <span className="font-semibold text-green-600">{results.financialAnalysis.roi}%</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center p-6 bg-blue-50 rounded-lg">
                        <Calendar className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-600">
                          ${results.financialAnalysis.savings25Years.toLocaleString()}
                        </div>
                        <p className="text-sm text-muted-foreground">25-Year Savings</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="environmental" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <Leaf className="h-12 w-12 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">
                        {results.environmentalImpact.co2Avoided} tons
                      </div>
                      <p className="text-sm text-muted-foreground">CO₂ Avoided Annually</p>
                    </div>
                    <div className="text-center p-6 bg-emerald-50 rounded-lg">
                      <div className="text-4xl mb-2">🌳</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {results.environmentalImpact.treesEquivalent}
                      </div>
                      <p className="text-sm text-muted-foreground">Trees Planted Equivalent</p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <div className="text-4xl mb-2">🚗</div>
                      <div className="text-2xl font-bold text-blue-600">{results.environmentalImpact.carsOffRoad}</div>
                      <p className="text-sm text-muted-foreground">Cars Off Road Equivalent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-lg font-semibold">Excellent Solar Potential!</span>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Your property shows strong potential for solar energy. The analysis indicates favorable conditions for
                  a solar installation with significant financial and environmental benefits.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg">Get Detailed Quote</Button>
                  <Button variant="outline" size="lg">
                    Download Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Named export

// Default export
export default SmartSolarAnalysis
