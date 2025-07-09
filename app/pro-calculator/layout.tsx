"use client"

import type React from "react"
import { ProgressTracker } from "@/components/progress-tracker"

export default function ProCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <ProgressTracker />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}
