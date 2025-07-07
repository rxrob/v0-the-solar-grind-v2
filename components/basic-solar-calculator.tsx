"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calculator, Sun, DollarSign, Calendar, Zap, Home } from "lucide-react"

interface CalculationResults {
  systemSize: number
  annualProduction: number
  monthlySavings: number
  annualSavings: number
  paybackPeriod: number
  totalCost: number
  federalTaxCredit: number
  netCost: number
}

export function BasicSolarCalculator() {
  const [monthlyBill, setMonthlyBill] = useState<number>(150)
  const [roofSize, setRoofSize] = useState<number>(1500)
  const [sunHours, setSunHours] = useState<number>(5.5)
  const [electricityRate, setElectricityRate] = useState<number>(0.12)
  const [results, setResults] = useState<CalculationResults | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateSolar = async () => {
    setIsCalculating(true)

    // Simulate calculation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Basic solar calculations
    const monthlyUsage = monthlyBill / electricityRate // kWh per month
    const annualUsage = monthlyUsage * 12 // kWh per year

    // System sizing (assuming 300W panels, 80% efficiency)
    const panelWattage = 300
    const systemEfficiency = 0.8
    const panelsNeeded = Math.ceil(annualUsage / (sunHours * 365 * panelWattage * systemEfficiency * 0.001))
    const systemSize = (panelsNeeded * panelWattage) / 1000 // kW

    // Check if system fits on roof (assuming 20 sq ft per panel)
    const roofPanelCapacity = Math.floor(roofSize / 20)
    const actualPanels = Math.min(panelsNeeded, roofPanelCapacity)
    const actualSystemSize = (actualPanels * panelWattage) / 1000

    // Production calculations
    const annualProduction = actualSystemSize * sunHours * 365 * systemEfficiency
    const productionOffset = Math.min(annualProduction / annualUsage, 1)

    // Financial calculations
    const costPerWatt = 3.5 // Average cost per watt installed
    const totalCost = actualSystemSize * 1000 * costPerWatt
    const federalTaxCredit = totalCost * 0.3 // 30% federal tax credit
    const netCost = totalCost - federalTaxCredit

    const annualSavings = annualUsage * productionOffset * electricityRate
    const monthlySavings = annualSavings / 12
    const paybackPeriod = netCost / annualSavings

    setResults({
      systemSize: actualSystemSize,
      annualProduction,
      monthlySavings,
      annualSavings,
      paybackPeriod,
      totalCost,
      federalTaxCredit,
      netCost,
    })

    setIsCalculating(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sun className="h-8 w-8 text-yellow-500" />
          Basic Solar Calculator
        </h1>
        <p className="text-muted-foreground">Get a quick estimate of your solar potential and savings</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Your Information
            </CardTitle>
            <CardDescription>Enter your details to calculate your solar potential</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="monthly-bill">Monthly Electric Bill ($)</Label>
              <Input
                id="monthly-bill"
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                placeholder="150"
              />
            </div>

            <div className="space-y-2">
              <Label>Roof Size: {roofSize.toLocaleString()} sq ft</Label>
              <Slider
                value={[roofSize]}
                onValueChange={(value) => setRoofSize(value[0])}
                max={3000}
                min={500}
                step={100}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Daily Sun Hours: {sunHours}</Label>
              <Slider
                value={[sunHours]}
                onValueChange={(value) => setSunHours(value[0])}
                max={8}
                min={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="electricity-rate">Electricity Rate ($/kWh)</Label>
              <Input
                id="electricity-rate"
                type="number"
                step="0.01"
                value={electricityRate}
                onChange={(e) => setElectricityRate(Number(e.target.value))}
                placeholder="0.12"
              />
            </div>

            <Button onClick={calculateSolar} disabled={isCalculating} className="w-full">
              {isCalculating ? "Calculating..." : "Calculate Solar Potential"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Your Solar Estimate
            </CardTitle>
            <CardDescription>
              {results ? "Here's what solar could do for you" : "Enter your information to see results"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Home className="h-6 w-6 mx-auto mb-1 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-600">{results.systemSize.toFixed(1)} kW</div>
                    <div className="text-sm text-muted-foreground">System Size</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Sun className="h-6 w-6 mx-auto mb-1 text-green-600" />
                    <div className="text-2xl font-bold text-green-600">
                      {results.annualProduction.toLocaleString(undefined, { maximumFractionDigits: 0 })} kWh
                    </div>
                    <div className="text-sm text-muted-foreground">Annual Production</div>
                  </div>

                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-1 text-yellow-600" />
                    <div className="text-2xl font-bold text-yellow-600">${results.monthlySavings.toFixed(0)}</div>
                    <div className="text-sm text-muted-foreground">Monthly Savings</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-1 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-600">{results.paybackPeriod.toFixed(1)} years</div>
                    <div className="text-sm text-muted-foreground">Payback Period</div>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <div className="flex justify-between">
                    <span>System Cost:</span>
                    <span className="font-semibold">${results.totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Federal Tax Credit (30%):</span>
                    <span className="font-semibold">-${results.federalTaxCredit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Net Cost:</span>
                    <span>${results.netCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-600">
                    <span>Annual Savings:</span>
                    <span>${results.annualSavings.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Enter your information above to see your solar estimate</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {results && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Ready for a detailed analysis?</h3>
              <p className="text-muted-foreground">
                Get a comprehensive report with NREL data, financing options, and more
              </p>
              <Button size="lg" className="mt-4">
                Get Advanced Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Named export

// Default export
export default BasicSolarCalculator
