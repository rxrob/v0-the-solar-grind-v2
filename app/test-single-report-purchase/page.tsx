"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { CreditCard, FileText, DollarSign } from "lucide-react"

export default function TestSingleReportPurchasePage() {
  const [address, setAddress] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleAddressSelect = (selectedAddress: string, placeId: string) => {
    setAddress(selectedAddress)
  }

  const handlePurchase = async () => {
    if (!address || !email) {
      setError("Please provide both address and email")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID,
          address,
          email,
          reportType: "single",
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
    } catch (err: any) {
      setError(err.message || "Failed to initiate purchase")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Single Solar Report Purchase
            </CardTitle>
            <CardDescription>
              Get a comprehensive solar analysis report for any property - no subscription required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pricing Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">Single Solar Report</h3>
                  <p className="text-sm text-blue-700">Complete analysis with financial projections</p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  <DollarSign className="h-4 w-4 mr-1" />
                  $29.99
                </Badge>
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-2">
              <h4 className="font-medium">What's Included:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Detailed solar potential analysis</li>
                <li>• Financial projections and ROI calculations</li>
                <li>• Environmental impact assessment</li>
                <li>• System size recommendations</li>
                <li>• PDF report delivered via email</li>
              </ul>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Property Address</Label>
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  placeholder="Enter the property address for analysis..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for report delivery"
                  className="mt-1"
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button onClick={handlePurchase} disabled={loading || !address || !email} className="w-full" size="lg">
              {loading ? (
                <>
                  <CreditCard className="h-4 w-4 mr-2 animate-pulse" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Purchase Report - $29.99
                </>
              )}
            </Button>

            <div className="text-xs text-gray-500 text-center">
              Secure payment processed by Stripe. You will receive your report within 24 hours.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
