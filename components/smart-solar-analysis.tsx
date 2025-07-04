"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Sun, DollarSign, Zap, Leaf, TrendingUp, Calculator, MapPin, Download } from "lucide-react"

interface SmartSolarAnalysisProps {
  analysisData: {
    address: string
    systemSize: number
    annualProduction: number
    monthlyProduction: number[]
    totalCost: number
    monthlyPayment: number
    paybackPeriod: number
    roi: number
    co2Offset: number
    treesEquivalent: number
    sunHours: number
    efficiency: number
    panelCount: number
    roofArea: number
  }
}

function SmartSolarAnalysisComponent({ analysisData }: SmartSolarAnalysisProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number, decimals = 0) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sun className="h-6 w-6 text-yellow-500" />
                Smart Solar Analysis
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <MapPin className="h-4 w-4" />
                {analysisData.address}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Analysis Complete
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Size</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analysisData.systemSize, 1)} kW</div>
                <p className="text-xs text-muted-foreground">{analysisData.panelCount} solar panels</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Production</CardTitle>
                <Sun className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analysisData.annualProduction)} kWh</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(analysisData.annualProduction / 12)} kWh/month avg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analysisData.totalCost)}</div>
                <p className="text-xs text-muted-foreground">{formatCurrency(analysisData.monthlyPayment)}/month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payback Period</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(analysisData.paybackPeriod, 1)} years</div>
                <p className="text-xs text-muted-foreground">{formatNumber(analysisData.roi)}% ROI</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Production Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Energy Production</CardTitle>
              <CardDescription>Estimated monthly solar energy generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.monthlyProduction.map((production, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 text-sm font-medium">{monthNames[index]}</div>
                    <div className="flex-1">
                      <Progress
                        value={(production / Math.max(...analysisData.monthlyProduction)) * 100}
                        className="h-2"
                      />
                    </div>
                    <div className="w-20 text-sm text-right">{formatNumber(production)} kWh</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>System Cost</span>
                  <span className="font-medium">{formatCurrency(analysisData.totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Payment</span>
                  <span className="font-medium">{formatCurrency(analysisData.monthlyPayment)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payback Period</span>
                  <span className="font-medium">{formatNumber(analysisData.paybackPeriod, 1)} years</span>
                </div>
                <div className="flex justify-between">
                  <span>Return on Investment</span>
                  <span className="font-medium text-green-600">{formatNumber(analysisData.roi)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>15-Year Savings Projection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Energy Production</span>
                  <span className="font-medium">{formatNumber(analysisData.annualProduction * 15)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Savings</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(analysisData.annualProduction * 15 * 0.12)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Net Profit</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(analysisData.annualProduction * 15 * 0.12 - analysisData.totalCost)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>System Size</span>
                  <span className="font-medium">{formatNumber(analysisData.systemSize, 1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span>Panel Count</span>
                  <span className="font-medium">{analysisData.panelCount} panels</span>
                </div>
                <div className="flex justify-between">
                  <span>Roof Area Required</span>
                  <span className="font-medium">{formatNumber(analysisData.roofArea)} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span>System Efficiency</span>
                  <span className="font-medium">{formatNumber(analysisData.efficiency)}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Site Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Peak Sun Hours</span>
                  <span className="font-medium">{formatNumber(analysisData.sunHours, 1)} hours/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Production</span>
                  <span className="font-medium">{formatNumber(analysisData.annualProduction)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Production Factor</span>
                  <span className="font-medium">
                    {formatNumber(analysisData.annualProduction / analysisData.systemSize / 1000, 2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Environmental Tab */}
        <TabsContent value="environmental" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Annual CO₂ Offset</span>
                  <span className="font-medium text-green-600">{formatNumber(analysisData.co2Offset)} lbs</span>
                </div>
                <div className="flex justify-between">
                  <span>Equivalent Trees Planted</span>
                  <span className="font-medium text-green-600">{formatNumber(analysisData.treesEquivalent)} trees</span>
                </div>
                <div className="flex justify-between">
                  <span>15-Year CO₂ Reduction</span>
                  <span className="font-medium text-green-600">{formatNumber(analysisData.co2Offset * 15)} lbs</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sustainability Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Carbon Footprint Reduction</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Renewable Energy Usage</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Energy Independence</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Calculator className="h-4 w-4" />
          Recalculate
        </Button>
      </div>
    </div>
  )
}

// Named export for compatibility
export const SmartSolarAnalysis = SmartSolarAnalysisComponent

// Default export
export default SmartSolarAnalysisComponent
