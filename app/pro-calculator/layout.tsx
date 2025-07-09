"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { ProgressTracker } from "@/components/progress-tracker"

export default function ProCalculatorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const getCurrentStep = () => {
    if (pathname.includes("step-1")) return 1
    if (pathname.includes("step-2")) return 2
    if (pathname.includes("step-3")) return 3
    if (pathname.includes("step-4")) return 4
    if (pathname.includes("results")) return 5
    return 1
  }

  const currentStepIndex = getCurrentStep()

  const steps = [
    { id: "01", name: "Address", href: "/pro-calculator/step-1", status: "upcoming" },
    { id: "02", name: "Utility Bill", href: "/pro-calculator/step-2", status: "upcoming" },
    { id: "03", name: "Roof Details", href: "/pro-calculator/step-3", status: "upcoming" },
    { id: "04", name: "System Design", href: "/pro-calculator/step-4", status: "upcoming" },
    { id: "05", name: "Results", href: "/pro-calculator/results", status: "upcoming" },
  ].map((step, index) => {
    const stepNumber = index + 1
    if (stepNumber < currentStepIndex) {
      return { ...step, status: "complete" }
    }
    if (stepNumber === currentStepIndex) {
      return { ...step, status: "current" }
    }
    return step
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <ProgressTracker steps={steps} />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
