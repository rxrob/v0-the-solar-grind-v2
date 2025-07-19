"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sun,
  DollarSign,
  TrendingUp,
  Download,
  Share,
  Crown,
  Zap,
  Leaf,
  Calculator,
  BarChart3,
  AlertTriangle,
} from "lucide-react"
import type { SystemSizingResult } from "@/lib/calculate-system-size"

interface AdvancedSolarResultsProps {
  results: SystemSizingResult
}

export function AdvancedSolarResults({ results }: AdvancedSolarResultsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount)
  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num)

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-orange-800 to-blue-800 border-orange-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Crown className="h-6 w-6 mr-2 text-orange-400" />
                Your Personalized Solar Analysis
              </h2>
              <p className="text-gray-200">{results.inputs.address}</p>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-white text-gray-900 hover:bg-gray-100">
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
              >
                <Share className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium flex items-center">
              <Sun className="h-4 w-4 mr-2 text-orange-500" /> System Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{results.systemSizeKw} kW</div>
            <div className="text-xs text-gray-300 mt-1">{results.panelCount} panels</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-500" /> Annual Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatNumber(results.annualProductionKwh)}</div>
            <div className="text-xs text-gray-300 mt-1">kWh per year</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-green-500" /> Annual Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{formatCurrency(results.annualSavings)}</div>
            <div className="text-xs text-gray-300 mt-1">{formatCurrency(results.monthlySavings)}/month</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2 text-purple-500" /> Payback Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{results.paybackPeriod} years</div>
            <div className="text-xs text-gray-300 mt-1">Return on investment</div>
          </CardContent>
        </Card>
      </div>

      {results.warnings.length > 0 && (
        <Card className="bg-yellow-900/50 border-yellow-700">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <AlertTriangle /> Important Considerations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-yellow-300">
            {results.warnings.map((warning, i) => (
              <p key={i} className="text-sm">
                {warning}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="financial">
            <DollarSign className="h-4 w-4 mr-1" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="technical">
            <Calculator className="h-4 w-4 mr-1" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="environmental">
            <Leaf className="h-4 w-4 mr-1" />
            Environmental
          </TabsTrigger>
          <TabsTrigger value="projections">
            <BarChart3 className="h-4 w-4 mr-1" />
            Projections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Investment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-300">Total System Cost:</span>
                <span className="text-white font-semibold">{formatCurrency(results.systemCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Federal Tax Credit (30%):</span>
                <span className="text-green-400 font-semibold">-{formatCurrency(results.federalTaxCredit)}</span>
              </div>
              <hr className="border-gray-600" />
              <div className="flex justify-between text-lg">
                <span className="text-white font-semibold">Net Investment:</span>
                <span className="text-white font-bold">{formatCurrency(results.netCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">25-Year ROI:</span>
                <span className="text-purple-400 font-semibold">{results.roi25Year}%</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">System Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Panel:</span>
                  <span className="text-white">
                    {results.recommendations.panelBrand} {results.recommendations.panelModel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Panel Wattage:</span>
                  <span className="text-white">{results.panelWattage}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Number of Panels:</span>
                  <span className="text-white">{results.panelCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Inverter:</span>
                  <span className="text-white">
                    {results.recommendations.inverterBrand} {results.recommendations.inverterModel}
                  </span>
                </div>
                {results.recommendations.batteryModel && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Battery:</span>
                    <span className="text-white">{results.recommendations.batteryModel}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Performance Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Peak Sun Hours:</span>
                  <span className="text-white">{results.performanceFactors.irradiance.toFixed(2)}/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Shading Factor:</span>
                  <span className="text-white">{(results.performanceFactors.shading * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tilt & Orientation:</span>
                  <span className="text-white">
                    {(results.performanceFactors.tiltAndOrientation * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">System Losses:</span>
                  <span className="text-white">{(results.performanceFactors.systemLosses * 100).toFixed(0)}%</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between font-bold">
                  <span className="text-gray-300">Overall Performance:</span>
                  <span className="text-white">{(results.performanceRatio * 100).toFixed(0)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Leaf className="h-5 w-5 mr-2 text-green-500" /> Environmental Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-green-900/20 border border-green-700 rounded">
                <div className="text-2xl font-bold text-green-400">{results.co2OffsetTons}</div>
                <div className="text-sm text-gray-300">Tons of CO₂ offset annually</div>
              </div>
              <div className="text-center p-4 bg-blue-900/20 border border-blue-700 rounded">
                <div className="text-2xl font-bold text-blue-400">{results.treesEquivalent}</div>
                <div className="text-sm text-gray-300">Equivalent trees planted</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" /> 25-Year Financial Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-4 text-center text-sm font-medium text-gray-300 border-b border-gray-600 pb-2">
                  <div>Year</div>
                  <div>Production (kWh)</div>
                  <div>Annual Savings</div>
                  <div>Cumulative Savings</div>
                </div>
                {results.yearlyProjections
                  .filter((y) => [1, 5, 10, 15, 20, 25].includes(y.year))
                  .map((yearData) => (
                    <div
                      key={yearData.year}
                      className="grid grid-cols-4 gap-4 text-center text-sm py-2 border-b border-gray-700 last:border-b-0"
                    >
                      <div className="text-white font-medium">{yearData.year}</div>
                      <div className="text-blue-400">{formatNumber(yearData.productionKwh)}</div>
                      <div className="text-green-400">{formatCurrency(yearData.savings)}</div>
                      <div className="text-purple-400">{formatCurrency(yearData.cumulativeSavings)}</div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
