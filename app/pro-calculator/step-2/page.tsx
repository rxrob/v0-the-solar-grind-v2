"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSolarCalculatorStore } from "@/lib/store"
import { EnhancedFileUpload } from "@/components/enhanced-file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import utilityOptions from "@/data/texas-utility-options.json"
import { Loader2 } from "lucide-react"

export default function Step2() {
  const router = useRouter()
  const { propertyData, energyData, setEnergyData, setCurrentStep, isHydrated } = useSolarCalculatorStore()

  // Initialize state safely from the store, providing fallbacks
  const [monthlyUsage, setMonthlyUsage] = useState<string>(energyData?.monthlyUsage?.toString() || "")
  const [monthlyBill, setMonthlyBill] = useState<string>(energyData?.monthlyBill?.toString() || "")
  const [utilityProvider, setUtilityProvider] = useState<string>(energyData?.utilityProvider || "")
  const [solarInfo, setSolarInfo] = useState<string | null>(null)

  useEffect(() => {
    if (isHydrated) {
      if (!propertyData?.address) {
        toast.error("Please start from Step 1.", {
          description: "Redirecting you back...",
        })
        router.push("/pro-calculator/step-1")
      } else {
        setCurrentStep(2)
      }
    }
  }, [isHydrated, propertyData, setCurrentStep, router])

  useEffect(() => {
    const normalized = utilityProvider?.trim().toLowerCase()
    if (!normalized) {
      setSolarInfo(null)
      return
    }
    if (normalized.includes("coserv")) {
      setSolarInfo(
        "🟠 CoServ Electric does not offer net metering. You must choose a REP with buyback (~$0.105/kWh). Monthly fee: $30. Solar fee: $12.",
      )
    } else if (normalized.includes("bluebonnet")) {
      setSolarInfo(
        "🟢 Bluebonnet Electric offers 1:1 net metering. Credits carry forward monthly. No solar fee. Base fee: $35.",
      )
    } else if (normalized.includes("centerpoint") || normalized.includes("oncor")) {
      setSolarInfo(
        "🟡 CenterPoint / Oncor territory varies by REP. Some offer 1:1 buyback. No base solar fee from utility.",
      )
    } else {
      setSolarInfo("⚪ Utility not recognized. Please confirm solar policy manually.")
    }
  }, [utilityProvider])

  const handleOCRSuccess = (data: any) => {
    toast.success("Bill data extracted!")
    // Safely access properties from OCR data
    const usage = data?.monthlyUsage
    const bill = data?.monthlyBill
    const provider = data?.utilityProvider

    if (usage) setMonthlyUsage(usage.toString())
    if (bill) setMonthlyBill(bill.toString())
    if (provider) setUtilityProvider(provider)

    setEnergyData({
      monthlyUsage: usage ? Number(usage) : energyData?.monthlyUsage,
      monthlyBill: bill ? Number(bill) : energyData?.monthlyBill,
      utilityProvider: provider || energyData?.utilityProvider,
    })
  }

  const handleOCRError = (error: string) => {
    toast.error("OCR Failed", { description: error })
  }

  const handleSubmit = () => {
    const usageNum = Number(monthlyUsage)
    const billNum = Number(monthlyBill)

    if (isNaN(usageNum) || usageNum <= 0 || isNaN(billNum) || billNum <= 0 || !utilityProvider) {
      toast.error("Please complete all required fields with valid numbers before continuing.")
      return
    }

    const calculatedRate = usageNum > 0 ? billNum / usageNum : null

    setEnergyData({
      monthlyUsage: usageNum,
      monthlyBill: billNum,
      electricityRate: calculatedRate,
      utilityProvider,
    })
    router.push("/pro-calculator/step-3")
  }

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    )
  }

  const electricityRate = Number(monthlyUsage) > 0 ? (Number(monthlyBill) / Number(monthlyUsage)).toFixed(3) : ""

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-[#0a0a0a] border border-gray-800">
        <CardHeader>
          <CardTitle className="text-orange-400 text-2xl">Step 2: Energy Usage</CardTitle>
          <CardDescription className="text-gray-400">
            Upload your utility bill for automatic detection, or enter the info manually. We'll estimate your $/kWh and
            summarize the solar program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <EnhancedFileUpload onExtractedData={handleOCRSuccess} onError={handleOCRError} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="monthly-usage" className="text-gray-300">
                Monthly Energy Usage (kWh)
              </Label>
              <Input
                id="monthly-usage"
                type="number"
                value={monthlyUsage}
                onChange={(e) => setMonthlyUsage(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="e.g., 1200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-bill" className="text-gray-300">
                Monthly Bill Amount ($)
              </Label>
              <Input
                id="monthly-bill"
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="e.g., 150"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="utility-provider" className="text-gray-300">
                Utility Provider
              </Label>
              <Select onValueChange={setUtilityProvider} value={utilityProvider}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select your utility provider" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-700 max-h-60">
                  {utilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="electricity-rate" className="text-gray-300">
                Electricity Rate ($/kWh)
              </Label>
              <Input
                id="electricity-rate"
                type="text"
                value={electricityRate ? `$${electricityRate}` : ""}
                readOnly
                className="bg-gray-900 border-gray-700 text-gray-400"
                placeholder="Auto-calculated"
              />
            </div>
          </div>
          {solarInfo && (
            <div className="mt-6 bg-gray-900 border border-gray-700 p-4 rounded-lg">
              <p className="text-sm text-green-400 font-semibold mb-1">Solar Program Details:</p>
              <p className="text-white text-sm">{solarInfo}</p>
            </div>
          )}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => router.push("/pro-calculator/step-1")}>
              Back to Step 1
            </Button>
            <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600">
              Continue to Step 3
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
