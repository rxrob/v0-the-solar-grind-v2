"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Shield, Download, MapPin, Calculator, BarChart3, FileText, Clock, DollarSign } from "lucide-react"
import { useAuth } from "@/hooks/use-auth-real"
import Link from "next/link"

export default function SingleReportPurchasePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const handlePurchase = async () => {
    if (!user) {
      setError("Please sign in to purchase a report")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID,
          mode: "payment",
          successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href,
          metadata: {
            type: "single_report",
            userId: user.id,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (err) {
      console.error("Purchase error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during purchase")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-amber-100 text-amber-800">
            Single Report Purchase
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Professional Solar Analysis Report</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get a comprehensive solar analysis for your property with detailed financial projections and professional
            recommendations.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Details */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Solar Analysis Report</CardTitle>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">$4.99</div>
                  <div className="text-sm text-gray-500">One-time payment</div>
                </div>
              </div>
              <CardDescription>Complete solar feasibility analysis with professional-grade insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Satellite Imagery Analysis</h4>
                    <p className="text-sm text-gray-600">High-resolution roof analysis with shading assessment</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calculator className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Precise Calculations</h4>
                    <p className="text-sm text-gray-600">
                      System sizing based on your energy usage and roof characteristics
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <BarChart3 className="h-5 w-5 text-purple-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Financial Projections</h4>
                    <p className="text-sm text-gray-600">15-year cost analysis with ROI and payback calculations</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Professional PDF Report</h4>
                    <p className="text-sm text-gray-600">Comprehensive report suitable for contractors and financing</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  What's Included
                </h4>
                <div className="grid gap-2">
                  {[
                    "Detailed roof analysis with measurements",
                    "Optimal solar panel placement recommendations",
                    "Energy production estimates",
                    "Cost-benefit analysis with local incentives",
                    "Environmental impact calculations",
                    "Professional PDF report (10-15 pages)",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Complete Your Purchase
              </CardTitle>
              <CardDescription>Secure payment processing powered by Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!user && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 mb-3">Please sign in to purchase a report</p>
                  <div className="flex space-x-2">
                    <Link href="/login">
                      <Button size="sm" variant="outline">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm">Create Account</Button>
                    </Link>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Solar Analysis Report</span>
                  <span className="font-medium">$4.99</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center font-medium">
                  <span>Total</span>
                  <span className="text-lg">$4.99</span>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={loading || !user}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                size="lg"
              >
                {loading ? "Processing..." : "Purchase Report - $4.99"}
              </Button>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Instant download after payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">
                  By purchasing, you agree to our Terms of Service and Privacy Policy. Your payment information is
                  processed securely by Stripe and never stored on our servers.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
