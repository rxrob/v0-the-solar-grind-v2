"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calculator, Crown, FileText, AlertCircle, Clock, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PaymentFlow {
  mode: string
  is_subscription: boolean
  is_one_time: boolean
  has_trial: boolean
}

interface PlanDetails {
  type: string
  features: string[]
  trial_days?: number
}

interface SubscriptionDetails {
  id: string
  status: string
  trial_start?: number
  trial_end?: number
  trial_days_remaining?: number
  current_period_start: number
  current_period_end: number
  cancel_at_period_end: boolean
}

interface PaymentDetails {
  id: string
  status: string
  amount: number
  currency: string
  created: number
}

interface SessionData {
  plan: string
  amount: string
  interval: string
  status: string
  customer_email: string
  customer_name: string
  subscription_id: string | null
  session_id: string
  purchase_type: string
  created: string
  plan_details: PlanDetails
  test_mode: boolean
  test_card_type?: string
  payment_flow: PaymentFlow
  subscription?: SubscriptionDetails
  payment?: PaymentDetails
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const type = searchParams.get("type")
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("🎉 === SUCCESS PAGE LOADED ===")
    console.log("📋 URL Parameters:")
    console.log("   - Session ID:", sessionId)
    console.log("   - Type from URL:", type)
    console.log("   - Full URL:", window.location.href)
    console.log("   - Timestamp:", new Date().toISOString())

    if (!sessionId) {
      console.error("❌ No session ID found in URL parameters")
      setError("No session ID found")
      setLoading(false)
      return
    }

    const verifySession = async () => {
      try {
        console.log("🔍 Starting session verification...")
        console.log("   - Calling API: /api/verify-session")
        console.log("   - Session ID:", sessionId)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

        const response = await fetch(`/api/verify-session?session_id=${sessionId}`, {
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
          },
        })

        clearTimeout(timeoutId)

        console.log("📡 API Response:")
        console.log("   - Status:", response.status)
        console.log("   - Status Text:", response.statusText)
        console.log("   - Headers:", Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          console.error("❌ Verification failed:")
          console.error("   - Error Data:", errorData)
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("✅ Session verification successful!")
        console.log("📊 Session Data Received:")
        console.log("   - Plan:", data.plan)
        console.log("   - Amount:", data.amount)
        console.log("   - Purchase Type:", data.purchase_type)
        console.log("   - Payment Flow:", data.payment_flow)
        console.log("   - Test Mode:", data.test_mode)
        console.log("   - Full Data:", JSON.stringify(data, null, 2))

        // Validate payment flow consistency for Single Report
        console.log("🔍 SINGLE REPORT FLOW VALIDATION ON SUCCESS PAGE:")
        console.log("   - URL type parameter:", type)
        console.log("   - Session purchase_type:", data.purchase_type)
        console.log("   - Session mode:", data.payment_flow?.mode)
        console.log("   - Is one-time payment:", data.payment_flow?.is_one_time)
        console.log("   - Amount:", data.amount)
        console.log("   - Plan:", data.plan)

        // Verify Single Report flow characteristics
        if (type === "single_report" || data.purchase_type === "single_report") {
          console.log("🎯 Single Report Flow Validation Results:")

          const validationResults = {
            urlTypeMatch: type === "single_report",
            purchaseTypeMatch: data.purchase_type === "single_report",
            modeCorrect: data.payment_flow?.mode === "payment",
            isOneTime: data.payment_flow?.is_one_time === true,
            amountCorrect: data.amount === "$4.99",
            planCorrect: data.plan.includes("Single") || data.plan.includes("Report"),
            notSubscription: !data.payment_flow?.is_subscription,
            noTrial: !data.payment_flow?.has_trial,
          }

          console.log("   Validation Checks:")
          console.log("   - URL type matches:", validationResults.urlTypeMatch ? "✅ PASS" : "❌ FAIL")
          console.log("   - Purchase type correct:", validationResults.purchaseTypeMatch ? "✅ PASS" : "❌ FAIL")
          console.log("   - Mode is 'payment':", validationResults.modeCorrect ? "✅ PASS" : "❌ FAIL")
          console.log("   - Is one-time payment:", validationResults.isOneTime ? "✅ PASS" : "❌ FAIL")
          console.log("   - Amount is $4.99:", validationResults.amountCorrect ? "✅ PASS" : "❌ FAIL")
          console.log("   - Plan name correct:", validationResults.planCorrect ? "✅ PASS" : "❌ FAIL")
          console.log("   - Not a subscription:", validationResults.notSubscription ? "✅ PASS" : "❌ FAIL")
          console.log("   - No trial period:", validationResults.noTrial ? "✅ PASS" : "❌ FAIL")

          const allValidationsPassed = Object.values(validationResults).every((result) => result)
          console.log("   🎯 OVERALL VALIDATION:", allValidationsPassed ? "✅ ALL PASSED!" : "❌ SOME FAILED!")

          if (!allValidationsPassed) {
            console.log("   ⚠️ Failed Validations:")
            Object.entries(validationResults).forEach(([check, passed]) => {
              if (!passed) {
                console.log(`     - ${check}: Expected vs Actual`)
                switch (check) {
                  case "urlTypeMatch":
                    console.log(`       Expected: 'single_report', Actual: '${type}'`)
                    break
                  case "purchaseTypeMatch":
                    console.log(`       Expected: 'single_report', Actual: '${data.purchase_type}'`)
                    break
                  case "modeCorrect":
                    console.log(`       Expected: 'payment', Actual: '${data.payment_flow?.mode}'`)
                    break
                  case "amountCorrect":
                    console.log(`       Expected: '$4.99', Actual: '${data.amount}'`)
                    break
                }
              }
            })
          }

          // Log payment details if available
          if (data.payment) {
            console.log("💳 Payment Details:")
            console.log("   - Payment ID:", data.payment.id)
            console.log("   - Status:", data.payment.status)
            console.log("   - Amount:", data.payment.amount, "cents")
            console.log("   - Currency:", data.payment.currency)
            console.log("   - Created:", new Date(data.payment.created * 1000).toISOString())
          }

          // Verify no subscription details for Single Report
          if (data.subscription) {
            console.log("   ⚠️ WARNING: Single Report should not have subscription details!")
            console.log("   - Subscription ID:", data.subscription.id)
          } else {
            console.log("   ✅ Correctly no subscription details for Single Report")
          }
        }

        setSessionData(data)

        // Show success toast
        toast({
          title: "Payment Successful!",
          description: data.payment_flow?.is_one_time
            ? "Your single report access is ready"
            : "Welcome to Solar Grind Pro!",
        })
      } catch (error) {
        console.error("💥 Error verifying session:")
        console.error("   - Error Type:", error instanceof Error ? error.constructor.name : typeof error)
        console.error("   - Error Message:", error instanceof Error ? error.message : String(error))
        console.error("   - Stack Trace:", error instanceof Error ? error.stack : "No stack trace")

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        setError(errorMessage)

        // Show error toast
        toast({
          title: "Payment Verification Failed",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        console.log("🏁 Session verification process completed")
      }
    }

    verifySession()
  }, [sessionId, type])

  if (loading) {
    console.log("⏳ Showing loading state...")
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Verifying your payment...</p>
          <p className="text-sm text-gray-500">Session ID: {sessionId?.slice(-8)}</p>
        </div>
      </div>
    )
  }

  if (error || !sessionData) {
    console.log("❌ Showing error state:", error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 mb-4">
              <AlertCircle className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">Payment Verification Failed</h1>
            <p className="text-red-600 mb-6">
              {error || "We couldn't verify your payment. Please try again or contact support."}
            </p>
            <div className="space-y-2">
              <Button asChild>
                <Link href="/test-payments">Return to Testing</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:rob@mysolarai.com">Contact Support</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isSingleReport = sessionData.payment_flow?.is_one_time || sessionData.purchase_type === "single_report"
  const isSubscription = sessionData.payment_flow?.is_subscription || sessionData.purchase_type === "subscription"
  const hasActiveTrial = sessionData.payment_flow?.has_trial && (sessionData.plan_details?.trial_days || 0) > 0

  console.log("🎨 Rendering success page:")
  console.log("   - Is Single Report:", isSingleReport)
  console.log("   - Is Subscription:", isSubscription)
  console.log("   - Has Active Trial:", hasActiveTrial)
  console.log("   - Test Mode:", sessionData.test_mode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Test Mode Banner */}
          {sessionData.test_mode && (
            <div className="mb-8">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                🧪 Test Mode - {isSingleReport ? "Single Report" : "Subscription"} Flow Test Successful
              </Badge>
            </div>
          )}

          {/* Success Header */}
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSingleReport ? "Single Report Payment Successful!" : "Payment Successful!"}
            </h1>
            <p className="text-lg text-gray-600">
              {isSingleReport && "Your professional solar report is ready to generate."}
              {isSubscription && hasActiveTrial && "Welcome to Solar Grind Professional! Your trial has started."}
              {isSubscription && !hasActiveTrial && "Welcome to Solar Grind Professional!"}
            </p>
          </div>

          {/* Single Report Flow Verification */}
          {isSingleReport && (
            <Card className="mb-8 bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">
                  🔍 Single Report Flow Verification
                  {sessionData.payment_flow?.mode === "payment" && sessionData.amount === "$4.99" ? " ✅" : " ⚠️"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Payment Mode:</strong>
                    <p
                      className={`${sessionData.payment_flow?.mode === "payment" ? "text-green-700" : "text-red-700"}`}
                    >
                      {sessionData.payment_flow?.mode || "payment"}
                      {sessionData.payment_flow?.mode === "payment" ? " ✅" : " ❌"}
                    </p>
                  </div>
                  <div>
                    <strong>Purchase Type:</strong>
                    <p
                      className={`${sessionData.purchase_type === "single_report" ? "text-green-700" : "text-red-700"}`}
                    >
                      {sessionData.purchase_type}
                      {sessionData.purchase_type === "single_report" ? " ✅" : " ❌"}
                    </p>
                  </div>
                  <div>
                    <strong>Amount:</strong>
                    <p className={`${sessionData.amount === "$4.99" ? "text-green-700" : "text-red-700"}`}>
                      {sessionData.amount}
                      {sessionData.amount === "$4.99" ? " ✅" : " ❌"}
                    </p>
                  </div>
                  <div>
                    <strong>Billing:</strong>
                    <p className={`${sessionData.interval === "One-time" ? "text-green-700" : "text-red-700"}`}>
                      {sessionData.interval}
                      {sessionData.interval === "One-time" ? " ✅" : " ❌"}
                    </p>
                  </div>
                  <div>
                    <strong>Is One-Time:</strong>
                    <p className={`${sessionData.payment_flow?.is_one_time ? "text-green-700" : "text-red-700"}`}>
                      {sessionData.payment_flow?.is_one_time ? "Yes ✅" : "No ❌"}
                    </p>
                  </div>
                  <div>
                    <strong>Test Card:</strong>
                    <p className="text-purple-700">{sessionData.test_card_type || "4242"}</p>
                  </div>
                </div>

                {/* Overall validation status */}
                {sessionData.payment_flow?.mode === "payment" &&
                sessionData.amount === "$4.99" &&
                sessionData.purchase_type === "single_report" &&
                sessionData.payment_flow?.is_one_time ? (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <div className="flex items-center text-green-800">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">🎉 Single Report Flow Verified Successfully!</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      All validation checks passed. Payment flow is working correctly.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <div className="flex items-center text-yellow-800">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">⚠️ Some Validation Checks Failed</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Check the console logs for detailed validation results.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Plan Details */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                {isSingleReport ? (
                  <FileText className="h-6 w-6 text-purple-600 mr-2" />
                ) : (
                  <Crown className="h-6 w-6 text-blue-600 mr-2" />
                )}
                <CardTitle>{sessionData.plan}</CardTitle>
                {hasActiveTrial && (
                  <Badge className="ml-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {sessionData.plan_details?.trial_days}-Day Trial
                  </Badge>
                )}
              </div>
              <CardDescription>
                {isSingleReport &&
                  "You now have access to create one professional solar analysis with detailed PDF report."}
                {isSubscription &&
                  hasActiveTrial &&
                  `You now have full access to all professional features. Your trial ends in ${sessionData.plan_details?.trial_days} day(s).`}
                {isSubscription && !hasActiveTrial && "You now have full access to all professional features."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Plan:</span>
                    <p className="text-gray-600">{sessionData.plan}</p>
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span>
                    <p className="text-gray-600">{sessionData.amount}</p>
                  </div>
                  <div>
                    <span className="font-medium">Billing:</span>
                    <p className="text-gray-600">{sessionData.interval}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <p className="text-gray-600 capitalize">{sessionData.status}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-gray-600">{sessionData.customer_email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Session:</span>
                    <p className="text-gray-600 font-mono text-xs">{sessionData.session_id.slice(-12)}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {sessionData.plan_details?.features?.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isSingleReport && (
                  <Button size="lg" className="w-full bg-purple-600 hover:bg-purple-700" asChild>
                    <Link href={`/pro-calculator?access=single_report&session=${sessionData.session_id}`}>
                      <Calculator className="mr-2 h-5 w-5" />
                      Create Your Professional Report
                    </Link>
                  </Button>
                )}

                {isSubscription && (
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/dashboard/pro">
                      <Calculator className="mr-2 h-5 w-5" />
                      Go to Pro Dashboard
                    </Link>
                  </Button>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent" asChild>
                    <Link href="/basic-calculator">
                      <Calculator className="mr-2 h-4 w-4" />
                      Basic Calculator
                    </Link>
                  </Button>
                  {isSingleReport && (
                    <Button variant="outline" className="flex-1 bg-transparent" asChild>
                      <Link href="/pricing">
                        <Crown className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Console Logging Instructions */}
          {sessionData.test_mode && (
            <Card className="mb-8 bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-800 mb-4">🔍 Console Logging Summary</h3>
                <div className="text-left space-y-2 text-sm text-blue-700">
                  <p className="font-medium">Check your browser console for detailed logs:</p>
                  <div className="space-y-1 ml-4">
                    <div>✅ Checkout session creation validation</div>
                    <div>✅ Payment flow detection and verification</div>
                    <div>✅ Session retrieval and analysis</div>
                    <div>✅ Single Report flow validation results</div>
                    <div>✅ Payment intent vs subscription verification</div>
                    <div>✅ Amount and currency validation</div>
                    <div>✅ Success page rendering validation</div>
                  </div>
                  <p className="mt-3 text-xs text-blue-600">
                    Open Developer Tools (F12) → Console tab to see all validation details
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Support */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{" "}
              <a href="mailto:rob@mysolarai.com" className="text-blue-600 hover:underline">
                rob@mysolarai.com
              </a>
            </p>
            <p className="text-xs text-gray-400 mt-2">Session ID: {sessionData.session_id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
