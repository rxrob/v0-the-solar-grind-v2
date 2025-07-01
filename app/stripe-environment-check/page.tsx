"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Key, CreditCard } from "lucide-react"

interface EnvironmentCheck {
  success: boolean
  environment: {
    secretKeyType: string
    publishableKeyType: string
    keyMismatch: boolean
    secretKeyPrefix: string
    publishableKeyPrefix: string
  }
  account: {
    id: string
    country: string
    chargesEnabled: boolean
    detailsSubmitted: boolean
  } | null
  accountError: string | null
  priceTests: Array<{
    priceId: string
    exists: boolean
    active: boolean
    amount: number | null
    currency: string | null
    livemode: boolean | null
    error: string | null
  }>
  recommendations: {
    keyMismatch: string[]
    priceIssues: string[]
    inactivePrices: string[]
  }
  error?: string
}

export default function StripeEnvironmentCheck() {
  const [check, setCheck] = useState<EnvironmentCheck | null>(null)
  const [loading, setLoading] = useState(true)

  const runCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/check-stripe-environment")
      const data = await response.json()
      setCheck(data)
    } catch (error) {
      console.error("Failed to check environment:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runCheck()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Checking Stripe Environment...</h2>
        </div>
      </div>
    )
  }

  if (!check || !check.success) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Environment Check Failed</AlertTitle>
            <AlertDescription>{check?.error || "Unknown error occurred"}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Stripe Environment Check</h1>
          <p className="text-slate-600">Diagnose key mismatches and price configuration issues</p>
          <Button onClick={runCheck} variant="outline" className="mt-4 bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Check
          </Button>
        </div>

        {/* Key Mismatch Alert */}
        {check.environment.keyMismatch && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>🚨 Key Environment Mismatch Detected!</AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>Your secret key and publishable key are from different environments:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Secret Key: <strong>{check.environment.secretKeyType.toUpperCase()}</strong>
                  </li>
                  <li>
                    Publishable Key: <strong>{check.environment.publishableKeyType.toUpperCase()}</strong>
                  </li>
                </ul>
                <p className="font-semibold">This is why your checkout is broken!</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Environment Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Key Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Secret Key Type:</span>
                  <Badge variant={check.environment.secretKeyType === "live" ? "destructive" : "secondary"}>
                    {check.environment.secretKeyType.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Publishable Key Type:</span>
                  <Badge variant={check.environment.publishableKeyType === "live" ? "destructive" : "secondary"}>
                    {check.environment.publishableKeyType.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Keys Match:</span>
                  {check.environment.keyMismatch ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Secret Key:</span>
                  <code className="block bg-muted p-1 rounded">{check.environment.secretKeyPrefix}</code>
                </div>
                <div>
                  <span className="text-muted-foreground">Publishable Key:</span>
                  <code className="block bg-muted p-1 rounded">{check.environment.publishableKeyPrefix}</code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {check.account ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Account ID:</span>
                    <code className="text-xs">{check.account.id}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Country:</span>
                    <span>{check.account.country}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Charges Enabled:</span>
                    {check.account.chargesEnabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Details Submitted:</span>
                    {check.account.detailsSubmitted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{check.accountError}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Price Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Price ID Tests</CardTitle>
            <CardDescription>Testing your configured price IDs in the current environment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {check.priceTests.map((test) => (
                <div key={test.priceId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono">{test.priceId}</code>
                    <div className="flex items-center space-x-2">
                      {test.exists ? (
                        <Badge className="bg-green-100 text-green-800">Found</Badge>
                      ) : (
                        <Badge variant="destructive">Not Found</Badge>
                      )}
                      {test.exists && (
                        <Badge variant={test.active ? "default" : "secondary"}>
                          {test.active ? "Active" : "Inactive"}
                        </Badge>
                      )}
                      {test.livemode !== null && (
                        <Badge variant={test.livemode ? "destructive" : "secondary"}>
                          {test.livemode ? "LIVE" : "TEST"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {test.exists && (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p>${((test.amount || 0) / 100).toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Currency:</span>
                        <p>{test.currency?.toUpperCase()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Environment:</span>
                        <p>{test.livemode ? "Live" : "Test"}</p>
                      </div>
                    </div>
                  )}

                  {test.error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription className="text-sm">{test.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {(check.recommendations.keyMismatch.length > 0 ||
          check.recommendations.priceIssues.length > 0 ||
          check.recommendations.inactivePrices.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">🔧 How to Fix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {check.recommendations.keyMismatch.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Key Mismatch Issues</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {check.recommendations.keyMismatch.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {check.recommendations.priceIssues.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Missing Prices</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {check.recommendations.priceIssues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {check.recommendations.inactivePrices.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Inactive Prices</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {check.recommendations.inactivePrices.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
