"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sun, DollarSign, TreePine, TrendingUp, Download, Share2, Calculator } from "lucide-react"

interface SolarResultsProps {
  results: {
    systemSizeKw: number
    panelsNeeded: number
    annualProductionKwh: number
    systemCost: number
    netCost: number
    annualSavings: number
    monthlySavings: number
    roiYears: number
    co2OffsetTons: number
    treesEquivalent: number
    currentElectricBill: number
    peakSunHours: number
  }
}

export function SolarResults({ results }: SolarResultsProps) {
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
      <Card className="bg-gradient-to-r from-amber-500 to-blue-500 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <Sun className="h-8 w-8" />
            Your Solar Analysis Results
          </CardTitle>
          <p className="text-lg opacity-90">Here's what solar could do for your home</p>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">System Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatNumber(results.systemSizeKw, 1)} kW</div>
            <p className="text-sm text-gray-500">{results.panelsNeeded} panels needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Annual Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatNumber(results.annualProductionKwh)} kWh</div>
            <p className="text-sm text-gray-500">{formatNumber(results.peakSunHours, 1)} peak sun hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Monthly Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(results.monthlySavings)}</div>
            <p className="text-sm text-gray-500">{formatCurrency(results.annualSavings)} annually</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Payback Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatNumber(results.roiYears, 1)} years</div>
            <Badge variant="secondary" className="text-xs">
              Excellent ROI
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(results.systemCost)}</div>
              <p className="text-sm text-gray-500">Total System Cost</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(results.netCost)}</div>
              <p className="text-sm text-gray-500">Net Cost After Incentives</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatCurrency(results.currentElectricBill)}</div>
              <p className="text-sm text-gray-500">Current Monthly Bill</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="h-5 w-5 text-green-500" />
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatNumber(results.co2OffsetTons, 1)} tons
              </div>
              <p className="text-sm text-gray-500">CO₂ Offset Annually</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatNumber(results.treesEquivalent)}</div>
              <p className="text-sm text-gray-500">Trees Planted Equivalent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 15-Year Projection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            15-Year Financial Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatCurrency(results.annualSavings * 15)}</div>
              <p className="text-sm text-gray-500">Total Savings</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(results.annualSavings * 15 - results.netCost)}
              </div>
              <p className="text-sm text-gray-500">Net Profit</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {formatNumber(((results.annualSavings * 15) / results.netCost) * 100, 0)}%
              </div>
              <p className="text-sm text-gray-500">Return on Investment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
        <Button variant="outline" size="lg">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
        <Button variant="outline" size="lg">
          <Calculator className="h-4 w-4 mr-2" />
          New Calculation
        </Button>
      </div>
    </div>
  )
}
