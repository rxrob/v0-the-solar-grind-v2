"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSolarCalculatorStore } from "@/lib/store"
import Results from "@/components/results"
import { Button } from "@/components/ui/button"

export default function ResultsPage() {
  const router = useRouter()
  const { propertyData, setCurrentStep, reset } = useSolarCalculatorStore()

  useEffect(() => {
    if (!propertyData.address) {
      router.push("/pro-calculator")
    } else {
      setCurrentStep(4)
    }
  }, [propertyData, setCurrentStep, router])

  const handleStartOver = () => {
    reset()
    router.push("/pro-calculator")
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Results />
      <div className="text-center mt-8">
        <Button onClick={handleStartOver}>Start New Calculation</Button>
      </div>
    </div>
  )
}
