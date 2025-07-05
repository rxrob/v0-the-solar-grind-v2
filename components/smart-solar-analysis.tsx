"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddressAutocomplete } from "./address-autocomplete"
import { Sun, Zap, DollarSign, Leaf, MapPin, Calculator, TrendingUp, Home } from "lucide-react"

interface SolarAnalysisData {
  address: string
  coordinates: { lat: number; lng: number }
  solarPotential: {
    annualSunlightHours: number
    solarIrradiance: number
    roofArea: number
    usableRoofArea: number
    recommendedSystemSize: number
    estimatedAnnualGeneration: number
  }
  financial: {
    systemCost: number
    monthlyBill: number
    monthlySavings: number
    annualSavings: number
    paybackPeriod: number
    roi25Year: number
  }
  environmental: {
    co2OffsetAnnual: number
    co2Offset25Year: number
    treesEquivalent: number
  }
}

export function SmartSolarAnalysis() {
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [analysisData, setAnalysisData] = useState<SolarAnalysisData | null>(null)
  const [error, setError] = useState("")
  const [analysisProgress, setAnalysisProgress] = useState(0)

  const handleAddressSelect = (selectedAddress: string, placeId: string) => {
    setAddress(selectedAddress)
  }

  const runAnalysis = async () => {
    if (!address) {
      setError("Please enter an address")
      return
    }

    setLoading(true)
    setError("")
    setAnalysisProgress(0)
    setAnalysisData(null)

    try {
      // Simulate analysis progress
      const progressSteps = [
        { step: 20, message: "Geocoding address..." },
        { step: 40, message: "Analyzing solar potential..." },
        { step: 60, message: "Calculating financial projections..." },
        { step: 80, message: "Assessing environmental impact..." },
        { step: 100, message: "Finalizing analysis..." },
      ]

      for (const { step, message } of progressSteps) {
        setAnalysisProgress(step)
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      // Call the smart solar analysis API
      const response = await fetch("/api/smart-solar-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setAnalysisData(data)
    } catch (err: any) {
      setError(err.message || "Failed to analyze solar potential")
    } finally {
      setLoading(false)
      setAnalysisProgress(0)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-6 w-6 text-yellow-500" />
            Smart Solar Analysis
          </CardTitle>
          <CardDescription>
            Get a comprehensive solar potential analysis for any property using advanced AI and satellite data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <AddressAutocomplete
                onAddressSelect={handleAddressSelect}
                placeholder="Enter property address for solar analysis..."
                className="w-full"
              />
            </div>
            <Button onClick={runAnalysis} disabled={loading || !address} className="px-8">
              {loading ? (
                <>
                  <Calculator className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>

          {loading && (
            <div className="space-y-2">
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-gray-600 text-center">
                {analysisProgress < 20 && "Geocoding address..."}
                {analysisProgress >= 20 && analysisProgress < 40 && "Analyzing solar potential..."}
                {analysisProgress >= 40 && analysisProgress < 60 && "Calculating financial projections..."}
                {analysisProgress >= 60 && analysisProgress < 80 && "Assessing environmental impact..."}
                {analysisProgress >= 80 && "Finalizing analysis..."}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {analysisData && (
        <div className="space-y-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Property Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisData.address}</div>
                  <div className="text-sm text-gray-600">Property Address</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisData.solarPotential.roofArea.toLocaleString()} ft²
                  </div>
                  <div className="text-sm text-gray-600">Total Roof Area</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {analysisData.solarPotential.usableRoofArea.toLocaleString()} ft²
                  </div>
                  <div className="text-sm text-gray-600">Usable for Solar</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysisData.solarPotential.annualSunlightHours.toLocaleString()} hrs
                  </div>
                  <div className="text-sm text-gray-600">Annual Sunlight</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="solar" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="solar" className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                Solar Potential
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial Analysis
              </TabsTrigger>
              <TabsTrigger value="environmental" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Environmental Impact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="solar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Solar Generation Potential</CardTitle>
                  <CardDescription>Based on roof analysis and local solar conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-yellow-700">
                        {analysisData.solarPotential.recommendedSystemSize} kW
                      </div>
                      <div className="text-sm text-yellow-600">Recommended System Size</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-700">
                        {analysisData.solarPotential.estimatedAnnualGeneration.toLocaleString()} kWh
                      </div>
                      <div className="text-sm text-green-600">Annual Generation</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Sun className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-blue-700">
                        {analysisData.solarPotential.solarIrradiance} kWh/m²
                      </div>
                      <div className="text-sm text-blue-600">Solar Irradiance</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Projections</CardTitle>
                  <CardDescription>25-year financial analysis including incentives and savings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-blue-700">
                        ${analysisData.financial.systemCost.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-600">System Cost (After Incentives)</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-700">
                        ${analysisData.financial.monthlySavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600">Monthly Savings</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Home className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-purple-700">
                        {analysisData.financial.paybackPeriod} years
                      </div>
                      <div className="text-sm text-purple-600">Payback Period</div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">25-Year ROI:</span>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {analysisData.financial.roi25Year}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-medium">Annual Savings:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${analysisData.financial.annualSavings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="environmental" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Environmental Impact</CardTitle>
                  <CardDescription>Your contribution to a cleaner environment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-green-700">
                        {analysisData.environmental.co2OffsetAnnual.toLocaleString()} lbs
                      </div>
                      <div className="text-sm text-green-600">CO₂ Offset (Annual)</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-blue-700">
                        {(analysisData.environmental.co2Offset25Year / 1000).toFixed(1)} tons
                      </div>
                      <div className="text-sm text-blue-600">CO₂ Offset (25 Years)</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Sun className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-3xl font-bold text-orange-700">
                        {analysisData.environmental.treesEquivalent}
                      </div>
                      <div className="text-sm text-orange-600">Trees Planted Equivalent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
