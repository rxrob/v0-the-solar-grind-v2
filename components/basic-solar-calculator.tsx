"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calculator, Zap, DollarSign, TrendingUp, Home, Sun } from "lucide-react"

interface CalculationResults {
  systemSize: number
  annualProduction: number
  monthlySavings: number
  annualSavings: number
  paybackPeriod: number
  totalCost: number
  netSavings25Years: number
  co2Offset: number
}

export function BasicSolarCalculator() {
  const [monthlyBill, setMonthlyBill] = useState<string>("")
  const [roofSize, setRoofSize] = useState<string>("")
  const [location, setLocation] = useState<string>("")
  const [roofType, setRoofType] = useState<string>("")
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateSolar = async () => {
    if (!monthlyBill || !roofSize || !location || !roofType) {
      return
    }

    setIsCalculating(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const bill = Number.parseFloat(monthlyBill)
    const roof = Number.parseFloat(roofSize)

    // Basic solar calculations
    const avgSunHours =
      location === "california" ? 5.5 : location === "texas" ? 5.0 : location === "florida" ? 4.8 : 4.2
    const systemEfficiency = roofType === "south" ? 0.85 : roofType === "east-west" ? 0.75 : 0.65
    const costPerWatt = 3.5

    // Calculate system size (kW)
    const systemSize = Math.min((bill * 12) / (avgSunHours * 365 * 0.15), roof / 100)

    // Calculate production and savings
    const annualProduction = systemSize * avgSunHours * 365 * systemEfficiency
    const monthlySavings = Math.min(bill * 0.9, (annualProduction / 12) * 0.12)
    const annualSavings = monthlySavings * 12
    const totalCost = systemSize * 1000 * costPerWatt * 0.7 // After tax credits
    const paybackPeriod = totalCost / annualSavings
    const netSavings25Years = annualSavings * 25 - totalCost
    const co2Offset = annualProduction * 0.0007 // tons CO2 per kWh

    setResults({
      systemSize: Math.round(systemSize * 10) / 10,
      annualProduction: Math.round(annualProduction),
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      totalCost: Math.round(totalCost),
      netSavings25Years: Math.round(netSavings25Years),
      co2Offset: Math.round(co2Offset * 10) / 10,
    })

    setIsCalculating(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold">Solar Calculator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get an instant estimate of your solar potential, savings, and payback period. Enter your details below for a
          personalized solar analysis.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Information
            </CardTitle>
            <CardDescription>Tell us about your home and energy usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="monthly-bill">Monthly Electric Bill ($)</Label>
              <Input
                id="monthly-bill"
                type="number"
                placeholder="150"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roof-size">Available Roof Space (sq ft)</Label>
              <Input
                id="roof-size"
                type="number"
                placeholder="800"
                value={roofSize}
                onChange={(e) => setRoofSize(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="california">California</SelectItem>
                  <SelectItem value="texas">Texas</SelectItem>
                  <SelectItem value="florida">Florida</SelectItem>
                  <SelectItem value="arizona">Arizona</SelectItem>
                  <SelectItem value="nevada">Nevada</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roof-type">Roof Orientation</Label>
              <Select value={roofType} onValueChange={setRoofType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select roof direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="south">South-facing</SelectItem>
                  <SelectItem value="east-west">East/West-facing</SelectItem>
                  <SelectItem value="north">North-facing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={calculateSolar}
              className="w-full"
              disabled={!monthlyBill || !roofSize || !location || !roofType || isCalculating}
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Solar Potential
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                Your Solar Analysis
              </CardTitle>
              <CardDescription>Based on your property and energy usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Zap className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">{results.systemSize} kW</div>
                  <div className="text-sm text-muted-foreground">System Size</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
                  <div className="text-2xl font-bold">{results.annualProduction.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">kWh/year</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Savings</span>
                  <Badge variant="secondary" className="text-green-600">
                    <DollarSign className="h-3 w-3 mr-1" />${results.monthlySavings}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Annual Savings</span>
                  <Badge variant="secondary" className="text-green-600">
                    <DollarSign className="h-3 w-3 mr-1" />${results.annualSavings.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Cost (after incentives)</span>
                  <span className="font-medium">${results.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payback Period</span>
                  <Badge variant="outline">{results.paybackPeriod} years</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">25-Year Net Savings</span>
                  <span className="text-lg font-bold text-green-600">
                    ${results.netSavings25Years.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">CO₂ Offset (annually)</span>
                  <span className="text-sm font-medium text-green-600">{results.co2Offset} tons</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  * Estimates based on average conditions. Actual results may vary based on specific site conditions,
                  local utility rates, and equipment selection.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {results && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Go Solar?</h3>
              <p className="text-muted-foreground">
                Get a detailed professional analysis with our Pro Calculator, including satellite imagery, shading
                analysis, and custom equipment recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  Get Professional Analysis
                </Button>
                <Button variant="outline" size="lg">
                  Download Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Default export
export default BasicSolarCalculator
