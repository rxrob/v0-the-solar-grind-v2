"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink, FileText, Crown } from "lucide-react"

interface TestResult {
  success: boolean
  environment: {
    isTest: boolean
    isLive: boolean
    keyPrefix: string
  }
  price: {
    exists: boolean
    active: boolean
    amount: number
    currency: string
    type: string
    livemode: boolean
    error: string | null
  }
  product: {
    exists: boolean
    active: boolean
    name: string
    livemode: boolean
    error: string | null
  }
  session: {
    created: boolean
    url: string
    sessionId: string
    mode: string
    status: string
    error: string | null
  }
  recommendations: {
    priceIssues: string[]
    productIssues: string[]
    sessionIssues: string[]
  }
}

export default function TestStripeCheckout() {
  const [testResults, setTestResults] = useState<{ [key: string]: TestResult }>({})
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const testPrices = [
    {
      id: "price_1RdGemD80D06ku9UO6X1lR35",
      name: "Professional",
      description: "$29.99/month subscription",
      icon: Crown,
      color: "blue",
    },
    {
      id: "price_single_report_production",
      name: "Single Report",
      description: "$4.99 one-time payment",
      icon: FileText,
      color: "orange",
    },
  ]

  const testPrice = async (priceId: string, priceName: string) => {
    setIsLoading(priceId)
    try {
      const response = await fetch("/api/test-stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })

      const result = await response.json()
      setTestResults((prev) => ({ ...prev, [priceId]: result }))
    } catch (error) {
      console.error(`Error testing ${priceName}:`, error)
    } finally {
      setIsLoading(null)
    }
  }

  const StatusIcon = ({ condition }: { condition: boolean }) =>
    condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-blue-100 text-blue-800">Production Checkout Testing</Badge>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Stripe Checkout Validator</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Validate your production Stripe configuration to ensure checkout flows work correctly for customers.
          </p>
        </div>

        {/* Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {testPrices.map((price) => {
            const result = testResults[price.id]
            const IconComponent = price.icon

            return (
              <Card key={price.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        price.color === "orange" ? "bg-orange-100" : "bg-blue-100"
                      }`}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${price.color === "orange" ? "text-orange-600" : "text-blue-600"}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{price.name}</CardTitle>
                      <CardDescription>{price.description}</CardDescription>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono bg-slate-100 p-2 rounded">Price ID: {price.id}</div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Test Button */}
                  <Button
                    onClick={() => testPrice(price.id, price.name)}
                    disabled={isLoading === price.id}
                    className={`w-full ${
                      price.color === "orange" ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                  >
                    {isLoading === price.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      "Validate Price"
                    )}
                  </Button>

                  {/* Results */}
                  {result && (
                    <div className="space-y-3">
                      {/* Environment */}
                      <div className="bg-slate-50 p-3 rounded">
                        <h4 className="font-medium text-sm mb-2">Environment</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span>Key Type:</span>
                            <Badge variant={result.environment.isLive ? "destructive" : "secondary"}>
                              {result.environment.isLive ? "LIVE" : "TEST"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Key Prefix:</span>
                            <code className="text-slate-600">{result.environment.keyPrefix}...</code>
                          </div>
                        </div>
                      </div>

                      {/* Price Status */}
                      <div className="bg-slate-50 p-3 rounded">
                        <h4 className="font-medium text-sm mb-2">Price Status</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span>Exists:</span>
                            <StatusIcon condition={result.price.exists} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Active:</span>
                            <StatusIcon condition={result.price.active} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Amount:</span>
                            <span>
                              {result.price.amount} {result.price.currency}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Type:</span>
                            <span>{result.price.type}</span>
                          </div>
                          {result.price.error && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-xs">{result.price.error}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>

                      {/* Product Status */}
                      <div className="bg-slate-50 p-3 rounded">
                        <h4 className="font-medium text-sm mb-2">Product Status</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span>Exists:</span>
                            <StatusIcon condition={result.product.exists} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Active:</span>
                            <StatusIcon condition={result.product.active} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Name:</span>
                            <span>{result.product.name}</span>
                          </div>
                          {result.product.error && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-xs">{result.product.error}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>

                      {/* Session Status */}
                      <div className="bg-slate-50 p-3 rounded">
                        <h4 className="font-medium text-sm mb-2">Checkout Session</h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span>Created:</span>
                            <StatusIcon condition={result.session.created} />
                          </div>
                          {result.session.created && (
                            <>
                              <div className="flex items-center justify-between">
                                <span>Mode:</span>
                                <span>{result.session.mode}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Status:</span>
                                <span>{result.session.status}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-2 bg-transparent"
                                onClick={() => window.open(result.session.url, "_blank")}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Test Checkout Flow
                              </Button>
                            </>
                          )}
                          {result.session.error && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription className="text-xs">{result.session.error}</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>

                      {/* Recommendations */}
                      {(result.recommendations.priceIssues.length > 0 ||
                        result.recommendations.productIssues.length > 0 ||
                        result.recommendations.sessionIssues.length > 0) && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <div className="text-xs space-y-1">
                              <strong>Issues Found:</strong>
                              {result.recommendations.priceIssues.map((issue, i) => (
                                <div key={i}>• {issue}</div>
                              ))}
                              {result.recommendations.productIssues.map((issue, i) => (
                                <div key={i}>• {issue}</div>
                              ))}
                              {result.recommendations.sessionIssues.map((issue, i) => (
                                <div key={i}>• {issue}</div>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Production Readiness Checklist</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700 text-sm space-y-2">
            <p>
              <strong>Before going live, ensure:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>All prices exist and are active in your Stripe dashboard</li>
              <li>Products are properly configured and active</li>
              <li>Checkout sessions create successfully</li>
              <li>Success and cancel URLs are correctly configured</li>
              <li>Webhook endpoints are set up for payment processing</li>
            </ul>
          </CardContent>
        </Card>

        {/* Production Setup Guide */}
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Production Setup</CardTitle>
          </CardHeader>
          <CardContent className="text-green-700 text-sm space-y-2">
            <p>
              <strong>To create production prices in Stripe:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to your Stripe Dashboard → Products</li>
              <li>Create "Single Solar Report" - $4.99 USD, One-time payment</li>
              <li>Create "Professional Plan" - $29.99 USD, Monthly subscription</li>
              <li>Copy the price IDs and update your environment variables</li>
              <li>Test the checkout flows before launch</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
