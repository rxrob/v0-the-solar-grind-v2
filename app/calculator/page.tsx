"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasicSolarCalculator } from "@/components/basic-solar-calculator"
import { AdvancedSolarCalculator } from "@/components/advanced-solar-calculator"
import { useAuthReal } from "@/hooks/use-auth-real"
import {
  Calculator,
  Crown,
  Zap,
  Sun,
  TrendingUp,
  Shield,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"

export default function CalculatorPage() {
  const { user, loading } = useAuthReal()
  const [activeTab, setActiveTab] = useState("basic")

  const isPro = user?.subscription_tier === "pro" || user?.subscription_plan === "professional"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Solar Calculator</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Calculate your solar potential with our advanced tools. Get instant estimates for system size, costs, and
              savings.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Calculator Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Basic Calculator Card */}
          <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-xl">Basic Calculator</CardTitle>
                </div>
                <Badge variant="secondary">Free</Badge>
              </div>
              <CardDescription>
                Quick solar estimates based on your location and energy usage. Perfect for getting started.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Features included:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Basic system sizing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cost estimates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Savings projections
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Environmental impact
                  </li>
                </ul>
              </div>
              <Button
                onClick={() => setActiveTab("basic")}
                className="w-full"
                variant={activeTab === "basic" ? "default" : "outline"}
              >
                Use Basic Calculator
              </Button>
            </CardContent>
          </Card>

          {/* Pro Calculator Card */}
          <Card className="relative overflow-hidden border-2 hover:border-purple-300 transition-colors bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-xl">Professional Calculator</CardTitle>
              </div>
              <CardDescription>
                Comprehensive analysis with advanced features, detailed reports, and professional-grade calculations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Everything in Basic, plus:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Multi-step detailed analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Advanced system design options
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Financing comparisons
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Professional PDF reports
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                    Customer management tools
                  </li>
                </ul>
              </div>
              {isPro ? (
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Link href="/pro-calculator">
                    Access Pro Calculator
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Link href="/pricing">
                      Upgrade to Pro
                      <Crown className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <p className="text-xs text-center text-gray-500">Start your free trial today</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calculator Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Basic Calculator
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2" disabled={!isPro}>
              <BarChart3 className="h-4 w-4" />
              Advanced Calculator
              {!isPro && <Crown className="h-3 w-3 ml-1 text-amber-500" />}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Sun className="h-6 w-6 text-blue-600" />
                  Basic Solar Calculator
                </CardTitle>
                <CardDescription className="text-lg">Get quick estimates for your solar installation</CardDescription>
              </CardHeader>
              <CardContent>
                <BasicSolarCalculator />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {isPro ? (
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro Feature
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                    Advanced Solar Calculator
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Comprehensive analysis with detailed projections and professional features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdvancedSolarCalculator />
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-12 text-center">
                  <Crown className="h-16 w-16 mx-auto mb-6 text-amber-500" />
                  <h3 className="text-2xl font-bold mb-4">Pro Feature</h3>
                  <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
                    Unlock advanced solar calculations, detailed analysis, and professional reporting tools.
                  </p>
                  <div className="space-y-4">
                    <Button
                      asChild
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Link href="/pricing">
                        Upgrade to Pro
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                    <p className="text-sm text-gray-500">7-day free trial • Cancel anytime</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="p-6">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Accurate Calculations</h3>
              <p className="text-gray-600">
                NREL-powered calculations ensure accurate solar production estimates for your location.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Financial Analysis</h3>
              <p className="text-gray-600">
                Comprehensive cost analysis including incentives, financing options, and ROI projections.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Professional Grade</h3>
              <p className="text-gray-600">
                Tools trusted by solar professionals for accurate system design and customer presentations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        {!isPro && (
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
              <CardContent className="p-8">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Ready for Professional Analysis?</h3>
                <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
                  Join thousands of solar professionals using our advanced calculator for detailed customer analysis and
                  professional reporting.
                </p>
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <Link href="/pricing">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
