"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TestTube,
  Play,
  RotateCcw,
  FileText,
  Loader2,
  ArrowLeft,
  Shield,
  Clock,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface TestResult {
  step: string
  status: "pending" | "success" | "error"
  message: string
  data?: any
  timestamp: string
}

export default function TestSingleReportPurchasePage() {
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)

  const addTestResult = (step: string, status: "pending" | "success" | "error", message: string, data?: any) => {
    const result: TestResult = {
      step,
      status,
      message,
      data,
      timestamp: new Date().toISOString(),
    }
    setTestResults((prev) => [...prev, result])
    console.log(`[${step}]`, { status, message, data })
  }

  const runPurchaseTest = async () => {
    setIsRunning(true)
    setTestResults([])

    try {
      // Step 1: Create checkout session
      addTestResult("checkout-session", "pending", "Creating Stripe checkout session...")

      const checkoutResponse = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          priceId: "price_single_report", // This would be your actual price ID
          successUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/test-single-report-purchase?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/test-single-report-purchase`,
        }),
      })

      if (!checkoutResponse.ok) {
        throw new Error(`Checkout session creation failed: ${checkoutResponse.statusText}`)
      }

      const checkoutData = await checkoutResponse.json()
      addTestResult("checkout-session", "success", "Checkout session created successfully", checkoutData)

      if (checkoutData.url) {
        setSessionId(checkoutData.sessionId)
        addTestResult("redirect", "pending", "Redirecting to Stripe checkout...")

        // Redirect to Stripe checkout
        if (typeof window !== "undefined") {
          window.location.href = checkoutData.url
        }
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      addTestResult("checkout-session", "error", `Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsRunning(false)
    }
  }

  const verifySession = async () => {
    if (!sessionId) {
      addTestResult("verification", "error", "No session ID available for verification")
      return
    }

    try {
      addTestResult("verification", "pending", "Verifying payment session...")

      const verifyResponse = await fetch(`/api/verify-session?session_id=${sessionId}`)
      const verifyData = await verifyResponse.json()

      if (verifyResponse.ok && verifyData.success) {
        addTestResult("verification", "success", "Payment verified successfully", verifyData)
        addTestResult("database", "success", "User record created/updated in database", verifyData.user)
      } else {
        addTestResult("verification", "error", `Verification failed: ${verifyData.error || "Unknown error"}`)
      }
    } catch (error) {
      addTestResult(
        "verification",
        "error",
        `Verification error: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  const clearResults = () => {
    setTestResults([])
    setSessionId(null)
  }

  // Check for session_id in URL params on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionIdFromUrl = urlParams.get("session_id")
      if (sessionIdFromUrl) {
        setSessionId(sessionIdFromUrl)
        addTestResult("return", "success", "Returned from Stripe checkout", { sessionId: sessionIdFromUrl })
      }
    }
  }, [])

  const getStatusIcon = (status: "pending" | "success" | "error") => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: "pending" | "success" | "error") => {
    switch (status) {
      case "pending":
        return "border-blue-200 bg-blue-50"
      case "success":
        return "border-green-200 bg-green-50"
      case "error":
        return "border-red-200 bg-red-50"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Single Report Purchase Test</span>
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Shield className="h-3 w-3 mr-1" />
                  Test Suite
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                $4.99 Test
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Test Configuration */}
        <Card className="mb-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              Single Report Purchase Test Configuration
            </CardTitle>
            <CardDescription>
              Test the complete $4.99 single report purchase flow including Stripe checkout and webhook processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Configuration */}
            <div className="space-y-2">
              <Label htmlFor="testEmail">Test Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="max-w-md"
              />
              <p className="text-sm text-gray-600">
                This email will be used for the test purchase and user account creation
              </p>
            </div>

            {/* Test Card Information */}
            <div className="space-y-4">
              <h4 className="font-semibold">Stripe Test Card Information</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <h5 className="font-medium text-green-800 mb-2">✅ Successful Payment</h5>
                    <div className="space-y-1 text-sm text-green-700">
                      <div>Card: 4242 4242 4242 4242</div>
                      <div>Expiry: Any future date</div>
                      <div>CVC: Any 3 digits</div>
                      <div>ZIP: Any 5 digits</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <h5 className="font-medium text-red-800 mb-2">❌ Declined Payment</h5>
                    <div className="space-y-1 text-sm text-red-700">
                      <div>Card: 4000 0000 0000 0002</div>
                      <div>Expiry: Any future date</div>
                      <div>CVC: Any 3 digits</div>
                      <div>ZIP: Any 5 digits</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={runPurchaseTest}
                disabled={isRunning || !testEmail}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Test $4.99 Purchase
                  </>
                )}
              </Button>

              {sessionId && (
                <Button
                  onClick={verifySession}
                  variant="outline"
                  className="border-green-600 text-green-600 bg-transparent"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Session
                </Button>
              )}

              <Button onClick={clearResults} variant="outline" disabled={testResults.length === 0}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear Results
              </Button>
            </div>

            {/* Instructions */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-semibold">Test Instructions:</div>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Configure your test email address above</li>
                    <li>Click "Test $4.99 Purchase" to create a Stripe checkout session</li>
                    <li>You'll be redirected to Stripe's checkout page</li>
                    <li>Use the test card information provided above</li>
                    <li>Complete the checkout process</li>
                    <li>You'll be redirected back here with session verification</li>
                    <li>Check the results below and monitor webhook logs</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Test Results
              </CardTitle>
              <CardDescription>Real-time test execution results and logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium capitalize">{result.step.replace("-", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <p className="text-sm mb-2">{result.message}</p>
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer font-medium">View Data</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Session Information */}
        {sessionId && (
          <Card className="mt-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-amber-500" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Session ID:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{sessionId}</code>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Test Email:</span>
                  <span className="text-sm">{testEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="text-sm font-semibold text-green-600">$4.99</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monitoring Tips */}
        <Card className="mt-6 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Monitoring & Debugging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">What to Monitor:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Browser console for detailed request/response logs</li>
                  <li>• Vercel function logs for webhook processing</li>
                  <li>• Stripe dashboard for payment events</li>
                  <li>• Supabase dashboard for database updates</li>
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Expected Flow:</h4>
                <ol className="space-y-1 text-sm text-gray-600 list-decimal list-inside">
                  <li>Checkout session created successfully</li>
                  <li>User redirected to Stripe checkout</li>
                  <li>Payment completed with test card</li>
                  <li>Webhook received and processed</li>
                  <li>User record created/updated in database</li>
                  <li>Success page displayed with session verification</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
