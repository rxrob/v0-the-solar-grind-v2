"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sun,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Share,
  Crown,
  Battery,
  Zap,
  Leaf,
  Calculator,
  BarChart3,
  Calendar,
} from "lucide-react"

interface AdvancedSolarResultsProps {
  results: any
}

export function AdvancedSolarResults({ results }: AdvancedSolarResultsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-800 to-blue-800 border-amber-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Crown className="h-6 w-6 mr-2 text-amber-500" />
                Advanced Solar Analysis Complete
              </h2>
              <p className="text-gray-200">Professional-grade analysis with detailed projections</p>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-white text-gray-900 hover:bg-gray-100">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium flex items-center">
              <Sun className="h-4 w-4 mr-2 text-amber-500" />
              System Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{results.systemSizeKw} kW</div>
            <div className="text-xs text-gray-300 mt-1">{results.panelsNeeded} panels</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-100 text-sm font-medium flex items-center">
              <Zap className="h-4 w-4 mr-2 text-blue-500" />
              Annual Production
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
              <DollarSign className="h-4 w-4 mr-2 text-green-500" />
              Annual Savings
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
              <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
              Payback Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{results.roiYears} years</div>
            <div className="text-xs text-gray-300 mt-1">Return on investment</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="financial" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800">
          <TabsTrigger value="financial" className="data-[state=active]:bg-gray-700">
            <DollarSign className="h-4 w-4 mr-1" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="technical" className="data-[state=active]:bg-gray-700">
            <Calculator className="h-4 w-4 mr-1" />
            Technical
          </TabsTrigger>
          <TabsTrigger value="environmental" className="data-[state=active]:bg-gray-700">
            <Leaf className="h-4 w-4 mr-1" />
            Environmental
          </TabsTrigger>
          <TabsTrigger value="projections" className="data-[state=active]:bg-gray-700">
            <BarChart3 className="h-4 w-4 mr-1" />
            Projections
          </TabsTrigger>
          <TabsTrigger value="report" className="data-[state=active]:bg-gray-700">
            <FileText className="h-4 w-4 mr-1" />
            Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Investment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">System Cost:</span>
                  <span className="text-white font-semibold">{formatCurrency(results.systemCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Federal Tax Credit (30%):</span>
                  <span className="text-green-400 font-semibold">-{formatCurrency(results.systemCost * 0.3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">State Incentives:</span>
                  <span className="text-green-400 font-semibold">-{formatCurrency(results.stateIncentives || 0)}</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between text-lg">
                  <span className="text-white font-semibold">Net Investment:</span>
                  <span className="text-white font-bold">{formatCurrency(results.netCost)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">25-Year Savings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Energy Savings:</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(results.annualSavings * 25)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Net Investment:</span>
                  <span className="text-white">-{formatCurrency(results.netCost)}</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between text-lg">
                  <span className="text-white font-semibold">Net Profit:</span>
                  <span className="text-green-400 font-bold">
                    {formatCurrency(results.annualSavings * 25 - results.netCost)}
                  </span>
                </div>
                <div className="text-center p-3 bg-green-900/20 border border-green-700 rounded">
                  <div className="text-green-400 font-semibold">
                    ROI: {Math.round(((results.annualSavings * 25) / results.netCost - 1) * 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {results.batteryStorage && (
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Battery className="h-5 w-5 mr-2 text-purple-500" />
                  Battery Storage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-700 rounded">
                    <div className="text-lg font-semibold text-purple-400">{results.batteryCapacity} kWh</div>
                    <div className="text-sm text-gray-300">Storage Capacity</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded">
                    <div className="text-lg font-semibold text-blue-400">
                      {formatCurrency(results.batteryBackupValue || 0)}
                    </div>
                    <div className="text-sm text-gray-300">Backup Value/Year</div>
                  </div>
                  <div className="text-center p-3 bg-gray-700 rounded">
                    <div className="text-lg font-semibold text-green-400">{results.batteryPayback || 12} years</div>
                    <div className="text-sm text-gray-300">Battery Payback</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="technical" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">System Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Panel Type:</span>
                  <span className="text-white">Monocrystalline</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Panel Wattage:</span>
                  <span className="text-white">{results.panelWattage}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Number of Panels:</span>
                  <span className="text-white">{results.panelsNeeded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Inverter Type:</span>
                  <span className="text-white">{results.microInverters ? "Micro-Inverters" : "String Inverter"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">System Efficiency:</span>
                  <span className="text-white">{results.systemEfficiency || 85}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">Performance Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Peak Sun Hours:</span>
                  <span className="text-white">{results.peakSunHours}/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Shading Factor:</span>
                  <span className="text-white">{Math.round((results.shadingFactor || 0.9) * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Tilt Optimization:</span>
                  <span className="text-white">{results.tiltOptimization || 95}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Orientation Factor:</span>
                  <span className="text-white">{results.orientationFactor || 98}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Annual Degradation:</span>
                  <span className="text-white">0.5%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white">Roof Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-700 rounded">
                  <div className="text-lg font-semibold text-blue-400">{results.availableRoofArea} sq ft</div>
                  <div className="text-sm text-gray-300">Available Area</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded">
                  <div className="text-lg font-semibold text-green-400">
                    {results.usableRoofArea || Math.round(results.availableRoofArea * 0.75)} sq ft
                  </div>
                  <div className="text-sm text-gray-300">Usable Area</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded">
                  <div className="text-lg font-semibold text-amber-400">{results.roofOrientation}</div>
                  <div className="text-sm text-gray-300">Primary Orientation</div>
                </div>
                <div className="text-center p-3 bg-gray-700 rounded">
                  <div className="text-lg font-semibold text-purple-400">{results.roofTilt || 30}°</div>
                  <div className="text-sm text-gray-300">Roof Tilt</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environmental" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-500" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

            <Card className="bg-gray-800 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white">25-Year Environmental Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total CO₂ Offset:</span>
                  <span className="text-green-400 font-semibold">{Math.round(results.co2OffsetTons * 25)} tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Equivalent Cars Off Road:</span>
                  <span className="text-blue-400 font-semibold">
                    {Math.round((results.co2OffsetTons * 25) / 4.6)} cars
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Gallons of Gas Saved:</span>
                  <span className="text-purple-400 font-semibold">
                    {formatNumber(Math.round(results.annualProductionKwh * 25 * 0.0007 * 1000))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Coal Power Avoided:</span>
                  <span className="text-amber-400 font-semibold">
                    {Math.round(results.annualProductionKwh * 25 * 0.0008)} tons
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                25-Year Financial Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 text-center text-sm font-medium text-gray-300 border-b border-gray-600 pb-2">
                  <div>Year</div>
                  <div>Production (kWh)</div>
                  <div>Savings</div>
                  <div>Cumulative</div>
                  <div>System Value</div>
                </div>
                {[1, 5, 10, 15, 20, 25].map((year) => {
                  const degradation = Math.pow(0.995, year - 1)
                  const production = Math.round(results.annualProductionKwh * degradation)
                  const savings = Math.round(results.annualSavings * Math.pow(1.03, year - 1))
                  const cumulative = Math.round(results.annualSavings * ((Math.pow(1.03, year) - 1) / 0.03))
                  const systemValue = year <= 10 ? results.netCost - (results.netCost * year) / 10 : 0

                  return (
                    <div
                      key={year}
                      className="grid grid-cols-5 gap-4 text-center text-sm py-2 border-b border-gray-700"
                    >
                      <div className="text-white font-medium">{year}</div>
                      <div className="text-blue-400">{formatNumber(production)}</div>
                      <div className="text-green-400">{formatCurrency(savings)}</div>
                      <div className="text-purple-400">{formatCurrency(cumulative)}</div>
                      <div className="text-amber-400">{formatCurrency(systemValue)}</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" className="space-y-4">
          <Card className="bg-gray-800 border-gray-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Professional Report Generation
                <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-blue-500 text-white text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  PRO EXCLUSIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Report Includes:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-green-400">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Executive Summary
                    </div>
                    <div className="flex items-center text-blue-400">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      Detailed Financial Analysis
                    </div>
                    <div className="flex items-center text-purple-400">
                      <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                      Technical Specifications
                    </div>
                    <div className="flex items-center text-amber-400">
                      <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                      Environmental Impact
                    </div>
                    <div className="flex items-center text-cyan-400">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                      25-Year Projections
                    </div>
                    <div className="flex items-center text-pink-400">
                      <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                      Satellite Imagery
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Customization Options:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300 text-sm">Include company branding</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300 text-sm">Add financing options</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-gray-300 text-sm">Include warranty information</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-gray-300 text-sm">Add installation timeline</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button className="bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600">
                  <Download className="h-4 w-4 mr-2" />
                  Generate PDF Report
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-100 hover:bg-gray-700 bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Presentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
