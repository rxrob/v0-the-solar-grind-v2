"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sun, Zap, DollarSign, Leaf, Calculator, Download, Share2 } from "lucide-react"

interface SmartSolarAnalysisProps {
  address: string
  systemSize: number
  monthlyBill: number
  roofArea: number
  onAnalysisComplete?: (results: any) => void
}

interface AnalysisResults {
  energyProduction: {
    annual: number
    monthly: number
    daily: number
  }
  financial: {
    systemCost: number
    incentives: number
    netCost: number
    paybackPeriod: number
    savings20Year: number
    roi: number
  }
  environmental: {
    co2Offset: number
    treesEquivalent: number
    carsOffRoad: number
  }
  technical: {
    panelCount: number
    inverterSize: number
    efficiency: number
    degradation: number
  }
}

function SmartSolarAnalysisComponent({
  address,
  systemSize,
  monthlyBill,
  roofArea,
  onAnalysisComplete,
}: SmartSolarAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisProgress(0)

    try {
      // Simulate analysis steps
      const steps = [
        "Analyzing location and solar irradiance...",
        "Calculating optimal system configuration...",
        "Processing financial projections...",
        "Evaluating environmental impact...",
        "Generating comprehensive report...",
      ]

      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setAnalysisProgress((i + 1) * 20)
      }

      // Generate mock results based on inputs
      const mockResults: AnalysisResults = {
        energyProduction: {
          annual: systemSize * 1200, // kWh per year
          monthly: (systemSize * 1200) / 12,
          daily: (systemSize * 1200) / 365,
        },
        financial: {
          systemCost: systemSize * 3000,
          incentives: systemSize * 900, // 30% federal tax credit
          netCost: systemSize * 2100,
          paybackPeriod: 8.5,
          savings20Year: monthlyBill * 12 * 20 * 0.7,
          roi: 12.5,
        },
        environmental: {
          co2Offset: systemSize * 800, // lbs per year
          treesEquivalent: Math.round(systemSize * 0.8),
          carsOffRoad: Math.round(systemSize * 0.2),
        },
        technical: {
          panelCount: Math.round(systemSize / 0.4),
          inverterSize: systemSize * 0.8,
          efficiency: 20.5,
          degradation: 0.5,
        },
      }

      setResults(mockResults)
      onAnalysisComplete?.(mockResults)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Running Smart Solar Analysis
          </CardTitle>
          <CardDescription>Analyzing your property for optimal solar configuration...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={analysisProgress} className="w-full" />
          <div className="text-center text-sm text-muted-foreground">{analysisProgress}% Complete</div>
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
          <CardDescription>Get a comprehensive analysis of your solar potential</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Address:</strong> {address}
            </div>
            <div>
              <strong>System Size:</strong> {systemSize} kW
            </div>
            <div>
              <strong>Monthly Bill:</strong> ${monthlyBill}
            </div>
            <div>
              <strong>Roof Area:</strong> {roofArea} sq ft
            </div>
          </div>
          <Button onClick={runAnalysis} className="w-full">
            Start Analysis
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Solar Analysis Results
          </CardTitle>
          <CardDescription>Comprehensive analysis for {address}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Annual Production
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.energyProduction.annual.toLocaleString()} kWh</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(results.energyProduction.monthly)} kWh/month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  20-Year Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${results.financial.savings20Year.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{results.financial.paybackPeriod} year payback</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Leaf className="h-4 w-4" />
                  CO₂ Offset
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.environmental.co2Offset.toLocaleString()} lbs</div>
                <p className="text-xs text-muted-foreground">Per year</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>System Cost:</span>
                  <span className="font-semibold">${results.financial.systemCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Federal Incentives:</span>
                  <span className="font-semibold">-${results.financial.incentives.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Net Investment:</span>
                  <span>${results.financial.netCost.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Return on Investment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Payback Period:</span>
                  <span className="font-semibold">{results.financial.paybackPeriod} years</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual ROI:</span>
                  <span className="font-semibold">{results.financial.roi}%</span>
                </div>
                <div className="flex justify-between text-green-600 font-bold">
                  <span>20-Year Savings:</span>
                  <span>${results.financial.savings20Year.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Panel Count:</span>
                  <span className="font-semibold">{results.technical.panelCount} panels</span>
                </div>
                <div className="flex justify-between">
                  <span>System Size:</span>
                  <span className="font-semibold">{systemSize} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Inverter Size:</span>
                  <span className="font-semibold">{results.technical.inverterSize} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Panel Efficiency:</span>
                  <span className="font-semibold">{results.technical.efficiency}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Daily Production:</span>
                  <span className="font-semibold">{Math.round(results.energyProduction.daily)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Production:</span>
                  <span className="font-semibold">{Math.round(results.energyProduction.monthly)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Degradation:</span>
                  <span className="font-semibold">{results.technical.degradation}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Roof Utilization:</span>
                  <span className="font-semibold">
                    {Math.round(((results.technical.panelCount * 20) / roofArea) * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">CO₂ Reduction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {results.environmental.co2Offset.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">lbs per year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Trees Planted</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{results.environmental.treesEquivalent}</div>
                <p className="text-xs text-muted-foreground">equivalent per year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cars Off Road</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{results.environmental.carsOffRoad}</div>
                <p className="text-xs text-muted-foreground">equivalent per year</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button variant="outline" className="flex-1 bg-transparent">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </div>
    </div>
  )
}

export default SmartSolarAnalysisComponent
export { SmartSolarAnalysisComponent as SmartSolarAnalysis }
