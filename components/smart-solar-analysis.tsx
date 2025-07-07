"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  Zap,
  DollarSign,
  Leaf,
  MapPin,
  Sun,
  TrendingUp,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth-real"

interface AnalysisResult {
  solarPotential: {
    annualProduction: number
    peakSunHours: number
    systemSize: number
    panelCount: number
  }
  financial: {
    totalCost: number
    annualSavings: number
    paybackPeriod: number
    roi25Year: number
    netPresentValue: number
  }
  environmental: {
    co2Offset: number
    treesEquivalent: number
    carsOffRoad: number
  }
  recommendations: string[]
  confidence: number
}

export function SmartSolarAnalysis() {
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [formData, setFormData] = useState({
    address: "",
    monthlyBill: "",
    roofType: "asphalt",
    energyGoal: "reduce_bill",
    budget: "moderate",
  })

  const handleAnalysis = async () => {
    if (!session?.access_token) {
      setError("Authentication required. Please log in.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/smart-solar-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Pro subscription required for advanced analysis")
        }
        throw new Error("Analysis failed. Please try again.")
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Smart Solar Analysis</h1>
          <Badge variant="secondary" className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            PRO
          </Badge>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          AI-powered comprehensive solar analysis combining multiple data sources for accurate recommendations.
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Information
          </CardTitle>
          <CardDescription>Provide details about your property for personalized analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                placeholder="123 Main St, City, State"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="monthlyBill">Monthly Electric Bill ($)</Label>
              <Input
                id="monthlyBill"
                type="number"
                placeholder="150"
                value={formData.monthlyBill}
                onChange={(e) => handleInputChange("monthlyBill", e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="roofType">Roof Type</Label>
              <select
                id="roofType"
                className="w-full p-2 border rounded-md"
                value={formData.roofType}
                onChange={(e) => handleInputChange("roofType", e.target.value)}
              >
                <option value="asphalt">Asphalt Shingles</option>
                <option value="metal">Metal</option>
                <option value="tile">Tile</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div>
              <Label htmlFor="energyGoal">Energy Goal</Label>
              <select
                id="energyGoal"
                className="w-full p-2 border rounded-md"
                value={formData.energyGoal}
                onChange={(e) => handleInputChange("energyGoal", e.target.value)}
              >
                <option value="reduce_bill">Reduce Bill</option>
                <option value="eliminate_bill">Eliminate Bill</option>
                <option value="net_positive">Generate Excess</option>
              </select>
            </div>
            <div>
              <Label htmlFor="budget">Budget Range</Label>
              <select
                id="budget"
                className="w-full p-2 border rounded-md"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleAnalysis}
            disabled={loading || !formData.address || !formData.monthlyBill}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Run Smart Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Confidence Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Analysis Complete
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label>Confidence Score</Label>
                  <Progress value={result.confidence} className="mt-2" />
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {result.confidence}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Results Tabs */}
          <Tabs defaultValue="solar" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="solar">Solar Potential</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="solar" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-yellow-600" />
                      System Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>System Size:</span>
                      <span className="font-semibold">{result.solarPotential.systemSize} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Panel Count:</span>
                      <span className="font-semibold">{result.solarPotential.panelCount} panels</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Sun Hours:</span>
                      <span className="font-semibold">{result.solarPotential.peakSunHours}/day</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-blue-600" />
                      Energy Production
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {result.solarPotential.annualProduction.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">kWh per year</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Investment Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total System Cost:</span>
                      <span className="font-semibold">${result.financial.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Savings:</span>
                      <span className="font-semibold text-green-600">
                        ${result.financial.annualSavings.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payback Period:</span>
                      <span className="font-semibold">{result.financial.paybackPeriod} years</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Long-term Returns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>25-Year ROI:</span>
                      <span className="font-semibold text-green-600">{result.financial.roi25Year}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Present Value:</span>
                      <span className="font-semibold">${result.financial.netPresentValue.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="environmental" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      CO₂ Reduction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.environmental.co2Offset.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">lbs CO₂/year</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Trees Planted</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.environmental.treesEquivalent}</div>
                    <div className="text-sm text-gray-600">trees/year</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">Cars Off Road</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold text-green-600">{result.environmental.carsOffRoad}</div>
                    <div className="text-sm text-gray-600">cars/year</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
              Schedule Consultation
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Default export
export default SmartSolarAnalysis
