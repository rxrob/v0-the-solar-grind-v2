"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, DollarSign, Check, FileText, Users, Zap, Crown, Building, Home } from "lucide-react"

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleStripeCheckout = async (priceId: string, planName: string) => {
    setIsLoading(priceId)

    try {
      console.log(`Starting checkout for ${planName} with price ID: ${priceId}`)

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
        }),
      })

      console.log(`Checkout response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Checkout error:", errorData)
        alert(`Error: ${errorData.error || "Unknown error occurred"}`)
        return
      }

      const { url, sessionId, error } = await response.json()
      console.log(`Checkout session created: ${sessionId}`)

      if (error) {
        console.error("Stripe error:", error)
        alert(`Error: ${error}`)
        return
      }

      if (url) {
        console.log(`Redirecting to Stripe checkout: ${url}`)
        window.location.href = url
      } else {
        console.error("No checkout URL received")
        alert("Error: No checkout URL received. Please try again.")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      alert("Something went wrong. Please try again or contact support at rob@mysolarai.com")
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Zap className="h-8 w-8 text-orange-500" />
                <span className="text-xl font-bold text-white">Solar Grind</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/basic-calculator"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Calculator</span>
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium bg-orange-500 text-white"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Pricing</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-slate-700" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-orange-100 text-orange-800 border-orange-200">⚡ AI-Powered Solar Analysis</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            Choose the Perfect Plan for Your <span className="text-orange-500">Solar</span>{" "}
            <span className="text-blue-600">Business</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            From free basic calculations to professional analysis with detailed reports. Start free and upgrade as your
            business grows.
          </p>
        </div>

        {/* Debug Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-red-800 mb-2">🚨 Stripe Checkout Debug Info</h3>
              <p className="text-red-700 text-sm mb-4">
                Your checkout sessions are being created successfully, but the Stripe checkout page shows as broken.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <strong>Possible Issues:</strong>
                  <br />• Price ID doesn't exist in live Stripe account
                  <br />• Product is inactive in Stripe dashboard
                  <br />• Price is inactive in Stripe dashboard
                  <br />• Webhook endpoint configuration issue
                </div>
                <div className="bg-white p-3 rounded border">
                  <strong>Quick Fix:</strong>
                  <br />
                  1. Visit{" "}
                  <Link href="/test-stripe-checkout" className="text-blue-600 underline">
                    /test-stripe-checkout
                  </Link>
                  <br />
                  2. Run diagnostics on your price IDs
                  <br />
                  3. Check if prices exist and are active
                  <br />
                  4. Use working price IDs from diagnostics
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Payment Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-yellow-800 mb-2">🧪 Payment Testing Mode</h3>
              <p className="text-yellow-700 text-sm mb-4">Use Stripe test card numbers for testing payments:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded border">
                  <strong>Successful Payment:</strong>
                  <br />
                  Card: 4242 4242 4242 4242
                  <br />
                  Expiry: Any future date
                  <br />
                  CVC: Any 3 digits
                </div>
                <div className="bg-white p-3 rounded border">
                  <strong>Declined Payment:</strong>
                  <br />
                  Card: 4000 0000 0000 0002
                  <br />
                  Expiry: Any future date
                  <br />
                  CVC: Any 3 digits
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="relative border-2 border-slate-200 hover:border-slate-300 transition-colors bg-white">
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-slate-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">Free</CardTitle>
              <CardDescription className="text-slate-600">
                Perfect for getting started with solar calculations
              </CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-800">$0</span>
                <span className="text-slate-500">/forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">5 calculations per month</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Basic solar estimates</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Simple reports</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Email support</span>
                </li>
              </ul>

              <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>

              <p className="text-xs text-slate-500 text-center">No credit card required</p>
            </CardContent>
          </Card>

          {/* Single Report */}
          <Card className="relative border-2 border-orange-200 hover:border-orange-300 transition-colors bg-white">
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">1 Professional Report</CardTitle>
              <CardDescription className="text-slate-600">Single professional analysis with PDF report</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-800">$4.99</span>
                <span className="text-slate-500">/one-time</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">1 advanced calculation</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Professional PDF report</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Detailed financial analysis</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">System sizing recommendations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Equipment specifications</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">ROI calculations</span>
                </li>
              </ul>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => handleStripeCheckout("price_1RdGtXD80D06ku9UWRTdDUHh", "Single Report")}
                disabled={isLoading === "price_1RdGtXD80D06ku9UWRTdDUHh"}
              >
                {isLoading === "price_1RdGtXD80D06ku9UWRTdDUHh" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Get Report ($4.99)"
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">Instant access after payment</p>
            </CardContent>
          </Card>

          {/* Professional Plan */}
          <Card className="relative border-2 border-blue-500 hover:border-blue-600 transition-colors bg-white">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
              Most Popular
            </Badge>
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Crown className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">Professional</CardTitle>
              <CardDescription className="text-slate-600">For solar professionals and installers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-800">$29.99</span>
                <span className="text-slate-500">/per month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Unlimited calculations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Advanced solar analysis</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Professional PDF reports</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Client management</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Custom branding</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">API access</span>
                </li>
              </ul>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => handleStripeCheckout("price_1RdGemD80D06ku9UO6X1lR35", "Professional")}
                disabled={isLoading === "price_1RdGemD80D06ku9UO6X1lR35"}
              >
                {isLoading === "price_1RdGemD80D06ku9UO6X1lR35" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Start Free Trial ($29.99/mo)"
                )}
              </Button>

              <p className="text-xs text-slate-500 text-center">1-day free trial, then $29.99/month</p>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative border-2 border-slate-200 hover:border-slate-300 transition-colors bg-white">
            <CardHeader className="text-center pb-8">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-slate-600" />
              </div>
              <CardTitle className="text-2xl text-slate-800">Enterprise</CardTitle>
              <CardDescription className="text-slate-600">For large solar companies and teams</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold text-slate-800">Custom</span>
                <span className="text-slate-500">/pricing</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Everything in Professional</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Team collaboration</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">White-label solution</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Training sessions</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-sm text-slate-700">SLA guarantee</span>
                </li>
              </ul>

              <Button className="w-full bg-slate-600 hover:bg-slate-700 text-white" asChild>
                <a href="mailto:rob@mysolarai.com?subject=Enterprise%20Inquiry&body=Hi%20Rob,%0A%0AI'm%20interested%20in%20learning%20more%20about%20your%20Enterprise%20plan.%0A%0ACompany:%20%0ATeam%20Size:%20%0AUse%20Case:%20%0A%0APlease%20let%20me%20know%20when%20we%20can%20schedule%20a%20call.%0A%0AThanks!">
                  Contact Sales
                </a>
              </Button>

              <p className="text-xs text-slate-500 text-center">Custom pricing based on your needs</p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4 text-slate-800">Ready to Get Started?</h2>
              <p className="text-slate-600 mb-6">
                Join thousands of solar professionals using Solar Grind for accurate calculations and professional
                reports.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                  <Link href="/basic-calculator">
                    <Calculator className="mr-2 h-5 w-5" />
                    Try Free Calculator
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
                  asChild
                >
                  <Link href="/signup">
                    <Users className="mr-2 h-5 w-5" />
                    Create Account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
