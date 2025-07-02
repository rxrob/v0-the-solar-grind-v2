"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { calculateBasicSolar } from "@/app/actions/basic-solar-calculations"
import { Loader2, Zap, DollarSign, Leaf, MapPin, Sun } from "lucide-react"
import { toast } from "sonner"

interface SolarResults {
  location: string
  monthlyKwh: number
  systemSizeKw: number
  annualProductionKwh: number
  systemCostBeforeIncentives: number
  federalTaxCredit: number
  netSystemCost: number
  annualSavings: number
  paybackPeriod: number
  twentyYearSavings: number
  co2ReductionLbs: number
  treesEquivalent: number
  sunHours: number
}

export function BasicSolarCalculator() {
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<SolarResults | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      setErrors({})

      const result = await calculateBasicSolar(formData)

      if (result.error) {
        toast.error(result.error)
        setResults(null)
      } else if (result.results) {
        setResults(result.results)
        toast.success("Solar calculation completed!")
      }
    })
  }

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="space-y-8">
      {/* Calculator Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sun className="h-6 w-6 text-yellow-500" />
            <span>Solar Calculator</span>
          </CardTitle>
          <CardDescription>Enter your basic information to get an instant solar estimate</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="monthlyBill">Monthly Electric Bill ($)</Label>
                <Input
                  id="monthlyBill"
                  name="monthlyBill"
                  type="number"
                  placeholder="150"
                  min="1"
                  step="0.01"
                  required
                  onChange={() => clearError("monthlyBill")}
                  className={errors.monthlyBill ? "border-red-500" : ""}
                />
                {errors.monthlyBill && <p className="text-sm text-red-500">{errors.monthlyBill}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  type="text"
                  placeholder="90210"
                  maxLength={5}
                  pattern="[0-9]{5}"
                  required
                  onChange={() => clearError("zipCode")}
                  className={errors.zipCode ? "border-red-500" : ""}
                />
                {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="electricityRate">Electricity Rate ($/kWh)</Label>
                <Input
                  id="electricityRate"
                  name="electricityRate"
                  type="number"
                  placeholder="0.15"
                  min="0.01"
                  step="0.001"
                  required
                  onChange={() => clearError("electricityRate")}
                  className={errors.electricityRate ? "border-red-500" : ""}
                />
                {errors.electricityRate && <p className="text-sm text-red-500">{errors.electricityRate}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Calculate Solar Savings
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Location & System Overview */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>System Overview - {results.location}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.systemSizeKw} kW</div>
                  <div className="text-sm text-gray-600">System Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.annualProductionKwh.toLocaleString()} kWh
                  </div>
                  <div className="text-sm text-gray-600">Annual Production</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{results.sunHours}</div>
                  <div className="text-sm text-gray-600">Peak Sun Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{results.monthlyKwh} kWh</div>
                  <div className="text-sm text-gray-600">Monthly Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Analysis */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span>Financial Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">System Cost (Before Incentives)</span>
                    <span className="font-semibold">${results.systemCostBeforeIncentives.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span>Federal Tax Credit (30%)</span>
                    <span className="font-semibold">-${results.federalTaxCredit.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Net System Cost</span>
                    <span>${results.netSystemCost.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Annual Savings</span>
                    <span className="font-semibold text-green-600">${results.annualSavings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payback Period</span>
                    <span className="font-semibold">{results.paybackPeriod} years</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold text-green-600">
                    <span>20-Year Savings</span>
                    <span>${results.twentyYearSavings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environmental Impact */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="h-5 w-5 text-green-500" />
                <span>Environmental Impact</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {results.co2ReductionLbs.toLocaleString()} lbs
                  </div>
                  <div className="text-gray-600">CO₂ Reduction per Year</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">{results.treesEquivalent}</div>
                  <div className="text-gray-600">Trees Planted Equivalent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Notice */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant="secondary" className="mb-3">
                  Basic Estimate
                </Badge>
                <p className="text-gray-600 mb-4">
                  This is a basic estimate. Get detailed analysis with satellite imagery, professional reports, and
                  precise calculations with our Professional tools.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">Upgrade for Detailed Analysis</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
