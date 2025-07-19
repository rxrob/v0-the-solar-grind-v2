"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Zap, BarChart } from "lucide-react"
import { SolarLocationBanner } from "@/components/solar-location-banner"
import { LocationPermissionBanner } from "@/components/location-permission-banner"

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
        <div className="w-full max-w-4xl mx-auto space-y-4 mb-8 px-4 md:px-6">
          <LocationPermissionBanner />
          <SolarLocationBanner />
        </div>

        <main className="max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            AI-Powered Solar Analysis for{" "}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Everyone</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Get instant, data-driven insights into your property's solar potential. Make informed decisions with our
            advanced analytics and beautiful, easy-to-understand reports.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/pro-calculator">Start Pro Analysis</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/calculator">Try Free Calculator</Link>
            </Button>
          </div>
        </main>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Sun className="h-6 w-6 text-orange-400" />
                Accurate Sun Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Leveraging real-time data from NREL and Google for precise solar irradiance and sun-hour calculations.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-6 w-6 text-orange-400" />
                Instant Calculations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Our AI-powered engine provides immediate feedback on system size, cost, and savings.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart className="h-6 w-6 text-orange-400" />
                Detailed Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Generate comprehensive PDF reports, perfect for homeowners and solar professionals.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
