import type { Metadata } from "next"
import { BasicSolarCalculator } from "@/components/basic-solar-calculator"
import { Button } from "@/components/ui/button"
import { Calculator, Sun, DollarSign } from "lucide-react"
import Link from "next/link"

// Force static generation for better performance
export const dynamic = "force-static"
export const revalidate = 3600 // Revalidate every hour

export const metadata: Metadata = {
  title: "Basic Solar Calculator - Quick Solar Estimates",
  description:
    "Quick and simple solar calculator for basic solar panel estimates. Perfect for getting started with solar analysis.",
}

export default function BasicCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Sun className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Solar Grind</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/basic-calculator"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium bg-blue-100 text-blue-900"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Basic Calculator</span>
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Pricing</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Basic Solar Calculator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple solar calculations to get you started. Enter basic information about your home to see preliminary
            solar estimates.
          </p>
        </div>

        <BasicSolarCalculator />
      </div>
    </div>
  )
}
