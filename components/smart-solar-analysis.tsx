"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Sun, DollarSign, Zap, Leaf, TrendingUp, Calculator, Download, Share2 } from "lucide-react"

interface SmartSolarAnalysisProps {
  analysisData: {
    address: string
    systemSize: number
    annualProduction: number
    monthlyProduction: number[]
    financialAnalysis: {
      systemCost: number
      monthlyBill: number
      monthlySavings: number
      annualSavings: number
      paybackPeriod: number
      roi25Year: number
      netPresentValue: number
    }
    technicalSpecs: {
      panelCount: number
      panelWattage: number
      inverterType: string
      roofArea: number
      efficiency: number
      degradationRate: number
    }
    environmental: {
      co2OffsetAnnual: number
      co2Offset25Year: number
      treesEquivalent: number
      coalOffset: number
    }
    incentives: {
      federalTaxCredit: number
      stateIncentives: number
      utilityRebates: number
      totalIncentives: number
    }
  }
}

function SmartSolarAnalysisComponent({ analysisData }: SmartSolarAnalysisProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "text-green-600"
    if (efficiency >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getPaybackColor = (years: number) => {
    if (years <= 7) return "text-green-600"
    if (years <= 10) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Smart Solar Analysis</CardTitle>
              <CardDescription>{analysisData.address}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Analysis Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Financial</span>
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Technical</span>
          </TabsTrigger>
          <TabsTrigger value="environmental" className="flex items-center space-x-2">
            <Leaf className="h-4 w-4" />
            <span>Environmental</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Size</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysisData.systemSize} kW</div>
                <p className="text-xs text-muted-foreground">{analysisData.technicalSpecs.panelCount} panels</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Production</CardTitle>
                <Sun className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analysisData.annualProduction.toLocaleString()} kWh</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(analysisData.annualProduction / 12).toLocaleString()} kWh/month avg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Annual Savings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analysisData.financialAnalysis.annualSavings.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  ${Math.round(analysisData.financialAnalysis.monthlySavings)} per month
                </p>
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
              <div className="space-y-4">
                {months.map((month, index) => (
                  <div key={month} className="flex items-center space-x-4">
                    <div className="w-8 text-sm font-medium">{month}</div>
                    <div className="flex-1">
                      <Progress
                        value={
                          (analysisData.monthlyProduction[index] / Math.max(...analysisData.monthlyProduction)) * 100
                        }
                        className="h-2"
                      />
                    </div>
                    <div className="w-20 text-sm text-right">
                      {analysisData.monthlyProduction[index].toLocaleString()} kWh
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>System Cost</span>
                  <span className="font-semibold">${analysisData.financialAnalysis.systemCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Federal Tax Credit (30%)</span>
                  <span className="font-semibold text-green-600">
                    -${analysisData.incentives.federalTaxCredit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>State Incentives</span>
                  <span className="font-semibold text-green-600">
                    -${analysisData.incentives.stateIncentives.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Utility Rebates</span>
                  <span className="font-semibold text-green-600">
                    -${analysisData.incentives.utilityRebates.toLocaleString()}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Investment</span>
                  <span>
                    $
                    {(
                      analysisData.financialAnalysis.systemCost - analysisData.incentives.totalIncentives
                    ).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Payback Period</span>
                  <span className={`font-semibold ${getPaybackColor(analysisData.financialAnalysis.paybackPeriod)}`}>
                    {analysisData.financialAnalysis.paybackPeriod.toFixed(1)} years
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>25-Year ROI</span>
                  <span className="font-semibold text-green-600">{analysisData.financialAnalysis.roi25Year}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Present Value</span>
                  <span className="font-semibold text-green-600">
                    ${analysisData.financialAnalysis.netPresentValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>25-Year Savings</span>
                  <span className="font-semibold text-green-600">
                    ${(analysisData.financialAnalysis.annualSavings * 25).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Panel Count</span>
                  <span className="font-semibold">{analysisData.technicalSpecs.panelCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Panel Wattage</span>
                  <span className="font-semibold">{analysisData.technicalSpecs.panelWattage}W each</span>
                </div>
                <div className="flex justify-between">
                  <span>Inverter Type</span>
                  <span className="font-semibold">{analysisData.technicalSpecs.inverterType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Required Roof Area</span>
                  <span className="font-semibold">{analysisData.technicalSpecs.roofArea} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span>System Efficiency</span>
                  <span className={`font-semibold ${getEfficiencyColor(analysisData.technicalSpecs.efficiency)}`}>
                    {analysisData.technicalSpecs.efficiency}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Degradation</span>
                  <span className="font-semibold">{analysisData.technicalSpecs.degradationRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>System Efficiency</span>
                    <span className="font-semibold">{analysisData.technicalSpecs.efficiency}%</span>
                  </div>
                  <Progress value={analysisData.technicalSpecs.efficiency} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Energy Production vs. Consumption</span>
                    <span className="font-semibold">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div className="pt-4">
                  <Badge variant="secondary" className="mb-2">
                    Performance Rating
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    This system is rated as{" "}
                    {analysisData.technicalSpecs.efficiency >= 90
                      ? "Excellent"
                      : analysisData.technicalSpecs.efficiency >= 80
                        ? "Good"
                        : "Fair"}{" "}
                    based on efficiency and production metrics.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Environmental Tab */}
        <TabsContent value="environmental" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Carbon Impact</CardTitle>
                <CardDescription>Environmental benefits of your solar system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Annual CO₂ Offset</span>
                  <span className="font-semibold text-green-600">
                    {analysisData.environmental.co2OffsetAnnual.toLocaleString()} lbs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>25-Year CO₂ Offset</span>
                  <span className="font-semibold text-green-600">
                    {analysisData.environmental.co2Offset25Year.toLocaleString()} lbs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Equivalent Trees Planted</span>
                  <span className="font-semibold text-green-600">
                    {analysisData.environmental.treesEquivalent} trees
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Coal Offset (25 years)</span>
                  <span className="font-semibold text-green-600">
                    {analysisData.environmental.coalOffset.toLocaleString()} lbs
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environmental Equivalents</CardTitle>
                <CardDescription>Put your impact in perspective</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Leaf className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Trees Planted</p>
                      <p className="text-sm text-muted-foreground">
                        {analysisData.environmental.treesEquivalent} trees over 25 years
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Cars Off Road</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(analysisData.environmental.co2OffsetAnnual / 4600)} cars per year
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Home Energy</p>
                      <p className="text-sm text-muted-foreground">
                        Powers {Math.round(analysisData.annualProduction / 10800)} homes annually
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Named export for compatibility
export const SmartSolarAnalysis = SmartSolarAnalysisComponent

// Default export
export default SmartSolarAnalysisComponent
