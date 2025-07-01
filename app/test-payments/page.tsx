"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sun,
  Calculator,
  CreditCard,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  Terminal,
  AlertTriangle,
  DollarSign,
} from "lucide-react"

interface TestResult {
  id: string
  planName: string
  priceId: string
  testCardType: string
  timestamp: string
  success: boolean
  sessionId?: string
  url?: string
  error?: string
  mode?: string
  amount?: number
  currency?: string
  livemode?: boolean
  requiresRealPayment?: boolean
  details?: any
  validation?: any
}

export default function TestPaymentsPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const handleStripeCheckout = async (priceId: string, planName: string, testCardType: string) => {
    const testId = `${planName}-${testCardType}-${Date.now()}`
    setIsLoading(testId)

    try {
      console.log("🚀 === STARTING SINGLE REPORT TEST ===")
      console.log("📋 Test Parameters:")
      console.log("   - Plan:", planName)
      console.log("   - Price ID:", priceId)
      console.log("   - Test Card Type:", testCardType)
      console.log("   - Test ID:", testId)
      console.log("   - Timestamp:", new Date().toISOString())

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          testMode: true,
          testCardType,
        }),
      })

      console.log("📡 Checkout API Response:")
      console.log("   - Status:", response.status)
      console.log("   - Status Text:", response.statusText)

      const result = await response.json()
      console.log("📊 Checkout Response Data:")
      console.log("   - Success:", result.success)
      console.log("   - Session ID:", result.sessionId)
      console.log("   - Mode:", result.mode)
      console.log("   - Amount:", result.amount, "cents")
      console.log("   - Currency:", result.currency)
      console.log("   - Live Mode:", result.livemode)
      console.log("   - Requires Real Payment:", result.requiresRealPayment)
      console.log("   - Validation:", result.validation)
      console.log("   - Full Result:", JSON.stringify(result, null, 2))

      // Live mode notifications
      if (result.livemode === true || result.requiresRealPayment) {
        console.log("🚨 === LIVE MODE SESSION CREATED ===")
        console.log("   🔴 This session requires REAL payment methods")
        console.log("   🔴 Test cards (4242 4242 4242 4242) will NOT work")
        console.log("   🔴 Use a real credit card to complete payment")
        console.log("   💰 Actual charges will be processed")
        console.log("   💡 Consider using Stripe test keys for testing")
      } else if (result.livemode === false) {
        console.log("✅ Session correctly created in TEST mode")
        console.log("   ✅ Test cards will work")
        console.log("   ✅ No real charges will be processed")
      }

      const testResult: TestResult = {
        id: testId,
        planName,
        priceId,
        testCardType,
        timestamp: new Date().toISOString(),
        success: response.ok,
        sessionId: result.sessionId,
        url: result.url,
        error: result.error,
        mode: result.mode,
        amount: result.amount,
        currency: result.currency,
        livemode: result.livemode,
        requiresRealPayment: result.requiresRealPayment,
        details: result,
        validation: result.validation,
      }

      setTestResults((prev) => [testResult, ...prev])

      if (response.ok && result.url) {
        console.log("✅ Checkout session created successfully!")
        console.log("🔗 Checkout URL:", result.url)

        if (result.requiresRealPayment) {
          console.log("💳 PAYMENT INSTRUCTIONS:")
          console.log("   1. Use a REAL credit card (not test cards)")
          console.log("   2. Enter valid billing information")
          console.log("   3. Actual payment will be processed")
          console.log("   4. You will be charged $4.99")
        } else {
          console.log("📝 TEST INSTRUCTIONS:")
          console.log("   1. Use test card 4242 4242 4242 4242")
          console.log("   2. Use any future expiry date")
          console.log("   3. Use any 3-digit CVC")
          console.log("   4. No real charges will be processed")
        }

        // Check if URL looks like live mode
        if (result.url && result.url.includes("cs_live_")) {
          console.log("🔴 Checkout URL is in LIVE mode - real payment required")
        } else if (result.url && result.url.includes("cs_test_")) {
          console.log("✅ Checkout URL is in TEST mode - test cards accepted")
        }

        // Open in new tab
        window.open(result.url, "_blank")
      } else {
        console.error("❌ Checkout failed:", result.error)
      }
    } catch (error) {
      console.error("💥 Error creating checkout session:")
      console.error("   - Error Type:", error instanceof Error ? error.constructor.name : typeof error)
      console.error("   - Error Message:", error instanceof Error ? error.message : String(error))

      const testResult: TestResult = {
        id: testId,
        planName,
        priceId,
        testCardType,
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: { error },
      }

      setTestResults((prev) => [testResult, ...prev])
    } finally {
      setIsLoading(null)
      console.log("🏁 Test initiation completed")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    console.log("📋 Copied to clipboard:", text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Basic Calculator</span>
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Pricing</span>
                </Link>
                <Badge className="bg-red-100 text-red-800">Live Mode Testing</Badge>
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

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-red-100 text-red-800">🔴 Live Mode Payment Testing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Live Single Report Payment</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Test the $4.99 one-time payment flow in <strong>LIVE MODE</strong> - real payments will be processed
          </p>
        </div>

        {/* Live Mode Warning */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="border-2 border-red-500 bg-red-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">🚨 LIVE MODE - REAL PAYMENTS</CardTitle>
              <CardDescription className="text-red-700 text-lg">
                You are using live Stripe keys - actual charges will be processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white p-6 rounded-lg border-2 border-red-200">
                <h4 className="font-bold text-red-800 mb-4 text-lg">⚠️ IMPORTANT WARNINGS:</h4>
                <div className="space-y-3 text-red-700">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Real Money:</strong> You will be charged $4.99 USD if you complete the payment
                    </span>
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Test Cards Don't Work:</strong> 4242 4242 4242 4242 will be rejected
                    </span>
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Real Credit Card Required:</strong> Use a valid credit/debit card
                    </span>
                  </div>
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Actual Processing:</strong> Payment will be processed by Stripe
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">💡 For Testing Without Real Payments:</h4>
                <p className="text-blue-700 text-sm">
                  Consider switching to Stripe test keys (sk_test_...) in your environment variables to use test cards
                  and avoid real charges.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Console Instructions */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Terminal className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-800">🔍 Console Logging Instructions</CardTitle>
              <CardDescription className="text-blue-700">
                Open your browser's Developer Tools to see detailed payment flow validation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-blue-800 mb-3">How to View Console Logs:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                  <li>
                    Press <kbd className="bg-gray-200 px-2 py-1 rounded">F12</kbd> or right-click → "Inspect Element"
                  </li>
                  <li>
                    Click the <strong>"Console"</strong> tab in Developer Tools
                  </li>
                  <li>Click the test button below to start the flow</li>
                  <li>Watch for live mode warnings and validation logs</li>
                  <li>Complete the Stripe checkout with a real credit card</li>
                  <li>Review success page validation results</li>
                </ol>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-blue-800 mb-3">What You'll See in Console:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
                  <div>
                    <strong>Live Mode Detection:</strong>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>🚨 LIVE MODE DETECTED warnings</li>
                      <li>Real payment method requirements</li>
                      <li>Session ID with "cs_live_" prefix</li>
                      <li>Live mode validation checks</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Payment Flow Validation:</strong>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Single report flow verification</li>
                      <li>Amount and currency validation</li>
                      <li>Payment intent analysis</li>
                      <li>Success page confirmation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real Payment Instructions */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="border-2 border-orange-200 bg-orange-50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-orange-800">Real Payment Method Required</CardTitle>
              <CardDescription className="text-orange-700">
                Use a valid credit or debit card to complete the payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-semibold text-orange-800 mb-3">Payment Instructions:</h4>
                <div className="space-y-2 text-sm text-orange-700">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-orange-600 mr-2" />
                    <span>Use a real credit or debit card</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-orange-600 mr-2" />
                    <span>Enter valid billing information</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-orange-600 mr-2" />
                    <span>You will be charged $4.99 USD</span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-600 mr-2" />
                    <span>Test cards (4242 4242 4242 4242) will be rejected</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Single Report Testing */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="border-2 border-purple-200">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">Single Report - $4.99</CardTitle>
              <CardDescription>One-time payment in LIVE MODE with real charges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Expected Flow Characteristics:</h4>
                <div className="space-y-2 text-sm text-purple-700">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    <span>
                      Mode: <code className="bg-white px-1 rounded">payment</code>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    <span>
                      Type: <code className="bg-white px-1 rounded">single_report</code>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    <span>
                      Amount: <code className="bg-white px-1 rounded">$4.99</code>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    <span>
                      Session ID: <code className="bg-white px-1 rounded">cs_live_...</code>
                    </span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-red-600 mr-2" />
                    <span>Real payment processing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    <span>Creates PaymentIntent (not Subscription)</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    <span>No recurring billing</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    <span>Immediate access to pro calculator</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Test Single Report Flow (LIVE MODE):</h4>
                <Button
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => handleStripeCheckout("price_1RdGtXD80D06ku9UWRTdDUHh", "Single Report", "live")}
                  disabled={isLoading !== null}
                >
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Pay $4.99 Single Report (LIVE)</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </Button>
                <p className="text-sm text-red-600 text-center font-medium">
                  ⚠️ This will charge your real credit card $4.99 USD
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">Live Payment Steps:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-red-700">
                  <li>Open browser Developer Tools (F12) and go to Console tab</li>
                  <li>Click the "Pay $4.99 Single Report (LIVE)" button above</li>
                  <li>Watch console logs for live mode warnings and validation</li>
                  <li>Stripe checkout will open in a new tab</li>
                  <li>Enter your email address</li>
                  <li>Enter a REAL credit or debit card number</li>
                  <li>Enter valid expiry date and CVC</li>
                  <li>Enter valid billing information</li>
                  <li>Complete the payment (you will be charged $4.99)</li>
                  <li>Verify success page shows single report details</li>
                  <li>Check console logs for session verification and flow validation</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Live Payment Test Results</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <Card
                  key={result.id}
                  className={`border-l-4 ${result.success ? "border-l-green-500" : "border-l-red-500"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {result.planName} - {result.testCardType}
                          </h3>
                          <p className="text-sm text-gray-500">{new Date(result.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Success" : "Failed"}
                        </Badge>
                        {result.livemode === true && (
                          <Badge variant="destructive">
                            <DollarSign className="h-3 w-3 mr-1" />
                            LIVE MODE
                          </Badge>
                        )}
                        {result.requiresRealPayment && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <CreditCard className="h-3 w-3 mr-1" />
                            REAL PAYMENT
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Price ID:</strong> {result.priceId}
                      </div>
                      {result.mode && (
                        <div>
                          <strong>Mode:</strong> <code className="bg-gray-100 px-1 rounded">{result.mode}</code>
                        </div>
                      )}
                      {result.amount && (
                        <div>
                          <strong>Amount:</strong> ${(result.amount / 100).toFixed(2)} {result.currency?.toUpperCase()}
                        </div>
                      )}
                      {result.sessionId && (
                        <div>
                          <strong>Session ID:</strong>
                          <code
                            className={`ml-1 px-1 rounded text-xs ${
                              result.sessionId.startsWith("cs_test_")
                                ? "bg-green-100 text-green-800"
                                : result.sessionId.startsWith("cs_live_")
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100"
                            }`}
                          >
                            {result.sessionId.slice(-12)}
                          </code>
                        </div>
                      )}
                      <div>
                        <strong>Payment Type:</strong>
                        <span className={result.requiresRealPayment ? "text-red-600" : "text-green-600"}>
                          {result.requiresRealPayment ? "REAL PAYMENT" : "TEST PAYMENT"}
                        </span>
                      </div>
                      {result.error && (
                        <div className="md:col-span-3">
                          <strong>Error:</strong>
                          <code className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded text-xs">{result.error}</code>
                        </div>
                      )}
                      {result.url && (
                        <div className="md:col-span-3">
                          <strong>Checkout URL:</strong>
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:underline text-xs"
                          >
                            Open Stripe Checkout
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Live Mode Warning */}
                    {result.requiresRealPayment && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center text-red-800">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span className="font-medium">💳 Live Payment Required!</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">
                          This session requires a real credit card and will process actual charges. Test cards will be
                          rejected.
                        </p>
                      </div>
                    )}

                    {/* Validation Results */}
                    {result.validation && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Flow Validation Results:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center">
                            <span
                              className={result.validation.details?.mode_correct ? "text-green-600" : "text-red-600"}
                            >
                              {result.validation.details?.mode_correct ? "✅" : "❌"} Mode Correct
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={result.validation.details?.amount_correct ? "text-green-600" : "text-red-600"}
                            >
                              {result.validation.details?.amount_correct ? "✅" : "❌"} Amount Correct
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={
                                result.validation.details?.currency_correct ? "text-green-600" : "text-red-600"
                              }
                            >
                              {result.validation.details?.currency_correct ? "✅" : "❌"} Currency Correct
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={result.validation.details?.type_correct ? "text-green-600" : "text-red-600"}
                            >
                              {result.validation.details?.type_correct ? "✅" : "❌"} Type Correct
                            </span>
                          </div>
                        </div>
                        {result.validation.all_checks_passed && (
                          <div className="mt-2 text-green-700 font-medium text-sm">
                            🎉 All validation checks passed!
                          </div>
                        )}
                      </div>
                    )}

                    {result.success && result.mode === "payment" && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center text-green-800">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          <span className="font-medium">Single Report Flow Verified!</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          Payment mode is correct for one-time purchase. Check console for detailed validation logs.
                          {result.requiresRealPayment && " Real payment processing enabled."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Console Log Examples */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🔍 What to Look for in Console Logs</h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">Live Mode Detection Logs:</h4>
                  <div className="text-sm text-gray-600 space-y-1 font-mono">
                    <div>🚨 === LIVE MODE DETECTED ===</div>
                    <div>🔑 Using Live Key: ✅ YES</div>
                    <div>⚠️ You are using LIVE Stripe keys</div>
                    <div>⚠️ This will create REAL payment sessions</div>
                    <div>⚠️ Test cards (4242 4242 4242 4242) will NOT work</div>
                    <div>🚨 === LIVE SESSION CREATED ===</div>
                    <div>🔴 This is a LIVE Stripe session</div>
                    <div>🔴 Real payment methods are required</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">Success Indicators:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Session ID starts with "cs_live_"</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Live Mode shows "LIVE" or true</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>All validation checks show "✅ PASS"</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span>Clear warnings about real payment requirements</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Payment Instructions:</h4>
                  <div className="text-sm text-orange-600 space-y-1">
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-orange-600 mr-2" />
                      <span>Use a real credit or debit card</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-orange-600 mr-2" />
                      <span>You will be charged $4.99 USD</span>
                    </div>
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span>Test cards will be rejected by Stripe</span>
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                      <span>Payment will be processed immediately</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-orange-100 rounded-lg">
                <p className="text-orange-800 text-sm">
                  <strong>💡 Live Mode Notice:</strong> Since you're using live Stripe keys, this will process real
                  payments. The "broken screen" issue was caused by trying to use test cards with live sessions. Use a
                  real credit card to complete the payment, or switch to test keys (sk_test_...) for testing without
                  real charges.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
