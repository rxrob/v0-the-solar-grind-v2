"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calculator, Sun, DollarSign, Zap, TrendingUp, Home } from "lucide-react"
import Link from "next/link"

interface CalculationResults {
  systemSize: number
  annualProduction: number
  monthlySavings: number
  annualSavings: number
  paybackPeriod: number
  totalCost: number
  netCost: number
  roi25Year: number
}

export default function BasicCalculatorPage() {
  const [formData, setFormData] = useState({
    monthlyBill: "",
    electricityRate: "",
    roofSize: "",
    sunHours: "",
    state: "",
    systemEfficiency: "85",
  })

  const [results, setResults] = useState<CalculationResults | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateSolar = async () => {
    setIsCalculating(true)

    // Simulate calculation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const monthlyBill = Number.parseFloat(formData.monthlyBill) || 0
    const electricityRate = Number.parseFloat(formData.electricityRate) || 0.12
    const roofSize = Number.parseFloat(formData.roofSize) || 1000
    const sunHours = Number.parseFloat(formData.sunHours) || 5
    const efficiency = Number.parseFloat(formData.systemEfficiency) / 100

    // Basic calculations
    const monthlyUsage = monthlyBill / electricityRate
    const annualUsage = monthlyUsage * 12
    const systemSize = Math.min(annualUsage / (sunHours * 365 * efficiency), roofSize * 0.15)
    const annualProduction = systemSize * sunHours * 365 * efficiency
    const monthlySavings = Math.min(monthlyBill, (annualProduction / 12) * electricityRate)
    const annualSavings = monthlySavings * 12

    // Cost calculations (simplified)
    const costPerWatt = 3.5
    const totalCost = systemSize * 1000 * costPerWatt
    const federalTaxCredit = totalCost * 0.3
    const netCost = totalCost - federalTaxCredit
    const paybackPeriod = netCost / annualSavings
    const roi25Year = ((annualSavings * 25 - netCost) / netCost) * 100

    setResults({
      systemSize: Math.round(systemSize * 100) / 100,
      annualProduction: Math.round(annualProduction),
      monthlySavings: Math.round(monthlySavings),
      annualSavings: Math.round(annualSavings),
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      totalCost: Math.round(totalCost),
      netCost: Math.round(netCost),
      roi25Year: Math.round(roi25Year),
    })

    setIsCalculating(false)
  }

  const isFormValid =
    formData.monthlyBill && formData.electricityRate && formData.roofSize && formData.sunHours && formData.state

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Sun className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Solar Grind</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/basic-calculator"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium bg-blue-100 text-blue-900"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Basic Calculator</span>
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Pricing</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-green-100 text-green-800">Free Solar Calculator</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Basic Solar Calculator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get a quick estimate of your solar potential with our free basic calculator. For detailed analysis and
            professional reports, check out our Pro plans.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Property Information
              </CardTitle>
              <CardDescription>Enter your basic property and energy information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyBill">Monthly Electric Bill ($)</Label>
                  <Input
                    id="monthlyBill"
                    type="number"
                    placeholder="150"
                    value={formData.monthlyBill}
                    onChange={(e) => handleInputChange("monthlyBill", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="electricityRate">Electricity Rate ($/kWh)</Label>
                  <Input
                    id="electricityRate"
                    type="number"
                    step="0.01"
                    placeholder="0.12"
                    value={formData.electricityRate}
                    onChange={(e) => handleInputChange("electricityRate", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roofSize">Available Roof Space (sq ft)</Label>
                  <Input
                    id="roofSize"
                    type="number"
                    placeholder="1000"
                    value={formData.roofSize}
                    onChange={(e) => handleInputChange("roofSize", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sunHours">Daily Sun Hours</Label>
                  <Input
                    id="sunHours"
                    type="number"
                    step="0.1"
                    placeholder="5.5"
                    value={formData.sunHours}
                    onChange={(e) => handleInputChange("sunHours", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TX">Texas</SelectItem>
                      <SelectItem value="CA">California</SelectItem>
                      <SelectItem value="FL">Florida</SelectItem>
                      <SelectItem value="AZ">Arizona</SelectItem>
                      <SelectItem value="NC">North Carolina</SelectItem>
                      <SelectItem value="NV">Nevada</SelectItem>
                      <SelectItem value="NJ">New Jersey</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systemEfficiency">System Efficiency (%)</Label>
                  <Select
                    value={formData.systemEfficiency}
                    onValueChange={(value) => handleInputChange("systemEfficiency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="80">80% (Standard)</SelectItem>
                      <SelectItem value="85">85% (Good)</SelectItem>
                      <SelectItem value="90">90% (Premium)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={calculateSolar} disabled={!isFormValid || isCalculating} className="w-full" size="lg">
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Calculating...
                  </>
                ) : (
                  <>
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Solar Potential
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {results && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Solar Analysis Results
                </CardTitle>
                <CardDescription>Basic estimates based on your input</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* System Size */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium">Recommended System Size</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{results.systemSize} kW</span>
                </div>

                {/* Annual Production */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <Sun className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium">Annual Energy Production</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {results.annualProduction.toLocaleString()} kWh
                  </span>
                </div>

                <Separator />

                {/* Financial Results */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Financial Analysis
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">${results.monthlySavings}</div>
                      <div className="text-sm text-gray-600">Monthly Savings</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">${results.annualSavings.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Annual Savings</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{results.paybackPeriod} years</div>
                      <div className="text-sm text-gray-600">Payback Period</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{results.roi25Year}%</div>
                      <div className="text-sm text-gray-600">25-Year ROI</div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Total System Cost:</span>
                      <span className="font-bold">${results.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Federal Tax Credit (30%):</span>
                      <span className="font-bold text-green-600">
                        -${(results.totalCost - results.netCost).toLocaleString()}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Net Cost After Incentives:</span>
                      <span className="font-bold text-lg">${results.netCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Upgrade CTA */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2">Want More Detailed Analysis?</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Get professional reports with NREL data, terrain analysis, and detailed financial projections.
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <Link href="/pricing">View Pro Plans</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/test-pro-calculator">Try Pro Demo</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Placeholder when no results */}
          {!results && (
            <Card className="shadow-lg">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Calculate</h3>
                  <p className="text-gray-600">Fill out the form and click calculate to see your solar potential</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Disclaimer */}
        <div className="max-w-4xl mx-auto mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 text-center">
            <strong>Disclaimer:</strong> These are basic estimates for informational purposes only. Actual results may
            vary based on local conditions, equipment selection, and installation factors. For accurate quotes, consult
            with a certified solar installer.
          </p>
        </div>
      </div>
    </div>
  )
}
