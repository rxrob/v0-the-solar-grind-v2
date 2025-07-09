"use client"

import { useSolarCalculatorStore } from "@/lib/store"
import { CheckCircle, Circle } from "lucide-react"

const steps = [
  { id: 1, name: "Property Address" },
  { id: 2, name: "Energy Use" },
  { id: 3, name: "Solar Analysis" },
  { id: 4, name: "Get Proposal" },
]

export function ProgressTracker() {
  const { currentStep } = useSolarCalculatorStore()

  return (
    <div className="w-full bg-gray-900/80 backdrop-blur-sm p-4 sticky top-0 z-50 border-b border-gray-700">
      <nav aria-label="Progress">
        <ol role="list" className="flex items-center justify-center max-w-3xl mx-auto space-x-8 sm:space-x-20">
          {steps.map((step) => (
            <li key={step.name} className="relative flex flex-col items-center">
              {currentStep > step.id ? (
                <>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                    <CheckCircle className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-xs text-white text-center w-20">{step.name}</p>
                </>
              ) : currentStep === step.id ? (
                <>
                  <div
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-orange-500 bg-gray-800"
                    aria-current="step"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-orange-400 text-center w-20">{step.name}</p>
                </>
              ) : (
                <>
                  <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-800">
                    <Circle className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="mt-2 text-xs text-gray-400 text-center w-20">{step.name}</p>
                </>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
