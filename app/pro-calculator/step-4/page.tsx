"use client"

import { useRouter } from "next/navigation"
import { useSolarCalculatorStore } from "@/lib/store"
import { useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, ShieldCheck, Sun } from "lucide-react"

// Financial Constants
const COST_PER_WATT = 3.15
const FEDERAL_TAX_CREDIT_RATE = 0.3

export default function Step4() {
  const router = useRouter()
  const { propertyData, energyData, analysisData, setCurrentStep, isHydrated } = useSolarCalculatorStore()

  useEffect(() => {
    if (!isHydrated) return

    if (!propertyData?.address || !energyData?.monthlyUsage || !analysisData?.systemSize) {
      router.push("/pro-calculator")
    } else {
      setCurrentStep(4)
    }
  }, [isHydrated, propertyData, energyData, analysisData, router, setCurrentStep])

  const financials = useMemo(() => {
    if (!analysisData.systemSize || !analysisData.annualSavings) {
      return null
    }
    const totalCost = analysisData.systemSize * 1000 * COST_PER_WATT
    const federalIncentive = totalCost * FEDERAL_TAX_CREDIT_RATE
    const netCost = totalCost - federalIncentive
    const paybackPeriod = netCost / analysisData.annualSavings

    return {
      totalCost,
      federalIncentive,
      netCost,
      paybackPeriod,
    }
  }, [analysisData])

  if (!isHydrated || !financials) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400 mb-4" />
        Calculating your final estimate...
      </div>
    )
  }

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    })

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-orange-500 mb-4">Step 4: Your Financial Estimate</h1>
      <p className="mb-8 text-gray-400">Here's the complete financial breakdown for your custom solar project.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-orange-500/20">
              <Sun className="w-6 h-6 text-orange-400" />
            </div>
            <CardTitle>System Cost</CardTitle>
          </CardHeader>
          <CardContent className="text-lg space-y-2">
            <p className="flex justify-between">
              <span>Gross Cost:</span> <span>{formatCurrency(financials.totalCost)}</span>
            </p>
            <p className="flex justify-between text-green-400">
              <span>Federal Tax Credit (30%):</span> <span>- {formatCurrency(financials.federalIncentive)}</span>
            </p>
            <hr className="border-gray-600 my-2" />
            <p className="flex justify-between font-bold text-xl">
              <span>Net Cost:</span> <span>{formatCurrency(financials.netCost)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-green-500/20">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <CardTitle>Savings & Payback</CardTitle>
          </CardHeader>
          <CardContent className="text-lg space-y-2">
            <p className="flex justify-between">
              <span>Est. Monthly Savings:</span> <span>{formatCurrency(analysisData.monthlySavings || 0)}</span>
            </p>
            <p className="flex justify-between">
              <span>Est. Annual Savings:</span> <span>{formatCurrency(analysisData.annualSavings || 0)}</span>
            </p>
            <hr className="border-gray-600 my-2" />
            <p className="flex justify-between font-bold text-xl">
              <span>Payback Period:</span> <span>{financials.paybackPeriod.toFixed(1)} years</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-full bg-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-300 list-disc list-inside">
            <li>You'll receive your official solar proposal via email.</li>
            <li>We’ll contact you to review financing options.</li>
            <li>Track your proposal status in your customer portal.</li>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10 text-center">
        <Button
          onClick={() => router.push("/")}
          size="lg"
          className="px-8 py-6 bg-orange-500 text-white hover:bg-orange-600"
        >
          Finish & Return Home
        </Button>
      </div>
    </div>
  )
}
