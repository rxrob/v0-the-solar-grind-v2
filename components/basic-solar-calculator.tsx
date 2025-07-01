"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calculator, TrendingUp, Zap, Sun, Home, AlertCircle } from "lucide-react"
import { calculateBasicSolar } from "@/app/actions/basic-solar-calculations"

interface BasicCalculatorData {
  zipcode: string
  sqft: string
  monthlyKwh: string
  monthlyBill: string
  hasGas: boolean
}

interface BasicResults {
  sunHours: number
  systemSizeKw: number
  panelsNeeded: number
  panelWattage: number
  estimatedCost: number
  taxCredit: number
  netCost: number
  monthlySavings: number
  annualSavings: number
  paybackYears: number
  co2Reduction: number
  annualProduction: number
}

// Add this prop to the component
interface BasicSolarCalculatorProps {
  userEmail?: string
}

export function BasicSolarCalculator({ userEmail }: BasicSolarCalculatorProps = {}) {
  const [data, setData] = useState<BasicCalculatorData>({
    zipcode: "",
    sqft: "",
    monthlyKwh: "",
    monthlyBill: "",
    hasGas: false,
  })
  const [results, setResults] = useState<BasicResults | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [calculationError, setCalculationError] = useState<string>("")

  const updateData = (field: keyof BasicCalculatorData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (calculationError) {
      setCalculationError("")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!data.zipcode.trim()) {
      newErrors.zipcode = "ZIP code is required"
    } else if (!/^\d{5}(-\d{4})?$/.test(data.zipcode.trim())) {
      newErrors.zipcode = "Please enter a valid ZIP code"
    }

    if (!data.sqft.trim()) {
      newErrors.sqft = "House size is required"
    } else if (Number.parseInt(data.sqft) < 500) {
      newErrors.sqft = "House size seems too small"
    }

    if (!data.monthlyKwh.trim()) {
      newErrors.monthlyKwh = "Monthly kWh usage is required"
    } else if (Number.parseFloat(data.monthlyKwh) < 100) {
      newErrors.monthlyKwh = "kWh usage seems too low"
    }

    if (!data.monthlyBill.trim()) {
      newErrors.monthlyBill = "Monthly electric bill is required"
    } else if (Number.parseFloat(data.monthlyBill) < 20) {
      newErrors.monthlyBill = "Electric bill seems too low"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCalculate = async () => {
    if (!validateForm()) return

    setIsCalculating(true)
    setCalculationError("")

    try {
      // Pass userEmail to the calculation function
      const result = await calculateBasicSolar(data, userEmail)
      setResults(result)
    } catch (error) {
      console.error("Calculation error:", error)
      setCalculationError("Unable to calculate solar estimate. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Input Form */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calculator className="mr-2 h-6 w-6 text-blue-400" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="zipcode" className="text-white">
              ZIP Code *
            </Label>
            <Input
              id="zipcode"
              placeholder="75201"
              value={data.zipcode}
              onChange={(e) => updateData("zipcode", e.target.value)}
              className={`bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 ${
                errors.zipcode ? "border-red-500" : ""
              }`}
              maxLength={10}
            />
            {errors.zipcode && <p className="text-red-400 text-sm">{errors.zipcode}</p>}
            <p className="text-gray-300 text-xs">We'll determine sun hours for your area</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sqft" className="text-white">
              House Size (sq ft) *
            </Label>
            <Input
              type="number"
              id="sqft"
              placeholder="2000"
              value={data.sqft}
              onChange={(e) => updateData("sqft", e.target.value)}
              className={`bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 ${
                errors.sqft ? "border-red-500" : ""
              }`}
            />
            {errors.sqft && <p className="text-red-400 text-sm">{errors.sqft}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyKwh" className="text-white">
              Monthly kWh Usage *
            </Label>
            <Input
              type="number"
              id="monthlyKwh"
              placeholder="1200"
              value={data.monthlyKwh}
              onChange={(e) => updateData("monthlyKwh", e.target.value)}
              className={`bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 ${
                errors.monthlyKwh ? "border-red-500" : ""
              }`}
            />
            {errors.monthlyKwh && <p className="text-red-400 text-sm">{errors.monthlyKwh}</p>}
            <p className="text-gray-300 text-xs">Check your electric bill for kWh usage</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthlyBill" className="text-white">
              Average Monthly Electric Bill ($) *
            </Label>
            <Input
              type="number"
              id="monthlyBill"
              placeholder="150"
              value={data.monthlyBill}
              onChange={(e) => updateData("monthlyBill", e.target.value)}
              className={`bg-gray-700 border-gray-500 text-white placeholder:text-gray-400 ${
                errors.monthlyBill ? "border-red-500" : ""
              }`}
            />
            {errors.monthlyBill && <p className="text-red-400 text-sm">{errors.monthlyBill}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasGas"
              checked={data.hasGas}
              onCheckedChange={(checked) => updateData("hasGas", checked)}
              className="border-slate-600 data-[state=checked]:bg-blue-600"
            />
            <Label htmlFor="hasGas" className="text-white">
              My home uses natural gas for heating/cooking
            </Label>
          </div>

          {calculationError && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <p className="text-red-400 text-sm">{calculationError}</p>
            </div>
          )}

          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="w-full bg-gradient-to-r from-blue-600 to-yellow-600 hover:from-blue-700 hover:to-yellow-700 text-white font-semibold py-3"
          >
            {isCalculating ? "Calculating..." : "Calculate Solar Potential"}
          </Button>

          <p className="text-xs text-gray-300 text-center">
            * Required fields. Calculation based on regional solar data.
          </p>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="mr-2 h-6 w-6 text-green-400" />
              Your Solar Estimate
            </CardTitle>
            <p className="text-gray-300 text-sm">Based on solar data for your area</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sun Hours */}
            <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-center justify-center">
                <Sun className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-yellow-400 font-semibold">☀️ {results.sunHours} peak sun hours/day</span>
              </div>
            </div>

            {/* System Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-700 border border-gray-500 rounded-lg">
                <Zap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-400">{results.systemSizeKw} kW</div>
                <div className="text-sm text-gray-100">System Size</div>
              </div>
              <div className="text-center p-4 bg-gray-700 border border-gray-500 rounded-lg">
                <Home className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400">{results.panelsNeeded}</div>
                <div className="text-sm text-gray-100">{results.panelWattage}W Panels</div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                <span className="text-gray-100">💰 Cash Price for System:</span>
                <span className="text-white font-semibold">{formatCurrency(results.estimatedCost)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-900/20 rounded">
                <span className="text-green-300">🏛️ Federal Tax Credit (30%):</span>
                <span className="text-green-400 font-semibold">-{formatCurrency(results.taxCredit)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-900/20 rounded border border-blue-700">
                <span className="text-blue-300 font-semibold">✅ Net System Cost:</span>
                <span className="text-blue-400 font-bold text-lg">{formatCurrency(results.netCost)}</span>
              </div>
            </div>

            {/* Savings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <div className="text-xl font-bold text-green-400">{formatCurrency(results.monthlySavings)}</div>
                <div className="text-sm text-green-300">Monthly Savings</div>
              </div>
              <div className="text-center p-4 bg-green-900/20 border border-green-700 rounded-lg">
                <div className="text-xl font-bold text-green-400">{results.paybackYears} years</div>
                <div className="text-sm text-green-300">Payback Period</div>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-400">{results.co2Reduction.toLocaleString()} lbs</div>
                <div className="text-xs text-green-300">CO₂ Reduced Annually</div>
                <div className="text-sm text-gray-300 mt-1">
                  ~{results.annualProduction.toLocaleString()} kWh/year production
                </div>
              </div>
            </div>

            {/* Upgrade Prompt */}
            <div className="bg-blue-800 border border-blue-600 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2">🚀 Want More Accurate Results?</h4>
              <ul className="text-sm text-gray-100 space-y-1 mb-3">
                <li>• Satellite roof analysis</li>
                <li>• Detailed financial projections</li>
                <li>• Professional PDF reports</li>
                <li>• Financing options</li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade to Pro Calculator</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
