"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useLoadScript } from "@react-google-maps/api"
import ProgressTracker from "@/components/progress-tracker"
import { usePathname } from "next/navigation"

// Define the context type
interface MapsApiContextType {
  isLoaded: boolean
  loadError: Error | undefined
}

// Create the context
const MapsApiContext = createContext<MapsApiContextType | null>(null)

// Custom hook to use the context
export function useMapsApi() {
  const context = useContext(MapsApiContext)
  if (!context) {
    throw new Error("useMapsApi must be used within a MapsApiProvider")
  }
  return context
}

const libraries: ("places" | "drawing" | "geometry")[] = ["places", "drawing", "geometry"]

export default function ProCalculatorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

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
    { id: "01", name: "Address", href: "/pro-calculator/step-1" },
    { id: "02", name: "Utility Bill", href: "/pro-calculator/step-2" },
    { id: "03", name: "Roof Details", href: "/pro-calculator/step-3" },
    { id: "04", name: "System Design", href: "/pro-calculator/step-4" },
    { id: "05", name: "Results", href: "/pro-calculator/results" },
  ].map((step, index) => {
    const stepNumber = index + 1
    if (stepNumber < currentStepIndex) {
      return { ...step, status: "complete" }
    }
    if (stepNumber === currentStepIndex) {
      return { ...step, status: "current" }
    }
    return { ...step, status: "upcoming" }
  })

  return (
    <MapsApiContext.Provider value={{ isLoaded, loadError }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <ProgressTracker steps={steps} />
          <main className="mt-8">{children}</main>
        </div>
      </div>
    </MapsApiContext.Provider>
  )
}
