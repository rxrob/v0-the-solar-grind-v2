"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator, Zap, Lock, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function FreeDashboardPage() {
  const usageData = {
    calculationsUsed: 3,
    calculationsLimit: 5,
    reportsGenerated: 1,
    reportsLimit: 2,
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gradient bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          Solar AI Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Welcome to your intelligent solar toolkit</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 shadow-lg hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Calculations Used</CardTitle>
            <Calculator className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {usageData.calculationsUsed}/{usageData.calculationsLimit}
            </div>
            <Progress value={(usageData.calculationsUsed / usageData.calculationsLimit) * 100} className="mt-2" />
            <p className="text-xs text-gray-400 mt-2">
              {usageData.calculationsLimit - usageData.calculationsUsed} calculations remaining
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 shadow-lg hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Reports Generated</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {usageData.reportsGenerated}/{usageData.reportsLimit}
            </div>
            <Progress value={(usageData.reportsGenerated / usageData.reportsLimit) * 100} className="mt-2" />
            <p className="text-xs text-gray-400 mt-2">
              {usageData.reportsLimit - usageData.reportsGenerated} reports remaining
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 shadow-lg hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Account Type</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Free</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-2">Limited features available</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-black/80 border border-gray-700 hover:shadow-neon-yellow">
          <CardHeader>
            <CardTitle className="text-white">Available Tools</CardTitle>
            <CardDescription className="text-gray-400">Tools available with your free account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-white">Basic Calculator</h4>
                <p className="text-sm text-gray-400">Simple solar estimates</p>
              </div>
              <Button asChild size="sm">
                <Link href="/basic-calculator">Use Tool</Link>
              </Button>
            </div>
            <div className="flex items-center justify-between opacity-50">
              <div>
                <h4 className="font-medium flex items-center gap-2 text-white">
                  Advanced Calculator
                  <Lock className="h-4 w-4" />
                </h4>
                <p className="text-sm text-gray-400">Detailed analysis with custom parameters</p>
              </div>
              <Button size="sm" disabled>
                Pro Only
              </Button>
            </div>
            <div className="flex items-center justify-between opacity-50">
              <div>
                <h4 className="font-medium flex items-center gap-2 text-white">
                  Pro Calculator
                  <Lock className="h-4 w-4" />
                </h4>
                <p className="text-sm text-gray-400">Professional-grade calculations</p>
              </div>
              <Button size="sm" disabled>
                Pro Only
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/80 border border-gray-700 hover:shadow-neon-pink">
          <CardHeader>
            <CardTitle className="text-white">Upgrade to Pro</CardTitle>
            <CardDescription className="text-gray-400">Unlock all features and unlimited calculations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {["Unlimited calculations", "Advanced solar analysis", "Professional reports", "Priority support"].map(
                (item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-white">{item}</span>
                  </div>
                ),
              )}
            </div>
            <Button asChild className="w-full">
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
