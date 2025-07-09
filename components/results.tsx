"use client"

import { useSolarCalculatorStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function Results() {
  const { propertyData, energyData } = useSolarCalculatorStore()

  // Dummy calculation for demonstration
  const estimatedSystemSize = ((energyData.monthlyUsage ?? 0) / 30 / 4.5).toFixed(2) // kWh/day / sun hours
  const estimatedCost = (Number.parseFloat(estimatedSystemSize) * 3 * 1000).toLocaleString() // kW * $/W * 1000 W/kW
  const monthlySavings = ((energyData.monthlyBill ?? 0) * 0.8).toFixed(2) // 80% savings

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your Solar Analysis Results</CardTitle>
        <CardDescription>
          Based on the information provided for <strong>{propertyData.address}</strong>, here is your estimated solar
          potential.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">System Size</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{estimatedSystemSize} kW</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Estimated Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${estimatedCost}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Monthly Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${monthlySavings}</p>
            </CardContent>
          </Card>
        </div>
        <p className="text-sm text-muted-foreground pt-4 text-center">
          * These are preliminary estimates. A detailed consultation is required for an accurate quote.
        </p>
      </CardContent>
    </Card>
  )
}
