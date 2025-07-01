"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DiagnosticsResult {
  success: boolean
  error?: string
  environment: {
    hasSecretKey: boolean
    hasPublishableKey: boolean
    hasPublishableKeyWrongName: boolean
    isTestKey: boolean
    isLiveKey: boolean
    hasWebhookSecret: boolean
    secretKeyPrefix: string
    publishableKeyPrefix: string
    publishableKeyWrongPrefix: string
  }
  account?: {
    id: string
    country: string
    defaultCurrency: string
    chargesEnabled: boolean
    payoutsEnabled: boolean
  }
  priceCheck: Array<{
    priceId: string
    exists: boolean
    price?: any
    error?: string
  }>
  availablePrices: Array<any>
  testSession?: {
    success: boolean
    sessionId?: string
    url?: string
    priceUsed?: string
    priceAmount?: number
    priceCurrency?: string
    error?: string
  }
  recommendations: Array<{
    type: string
    severity: "high" | "medium" | "low" | "info" | "warning"
    message: string
    action: string
    details?: string
  }>
}

export default function StripeDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe-diagnostics")
      const data = await response.json()
      setDiagnostics(data)
    } catch (error) {
      console.error("Failed to run diagnostics:", error)
      setDiagnostics({
        success: false,
        error: "Failed to connect to diagnostics API",
        environment: {
          hasSecretKey: false,
          hasPublishableKey: false,
          hasPublishableKeyWrongName: false,
          isTestKey: false,
          isLiveKey: false,
          hasWebhookSecret: false,
          secretKeyPrefix: "Error",
          publishableKeyPrefix: "Error",
          publishableKeyWrongPrefix: "Error",
        },
        priceCheck: [],
        availablePrices: [],
        recommendations: [],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "warning":
        return "secondary"
      case "medium":
        return "secondary"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Running Stripe Diagnostics...</h2>
            <p className="text-muted-foreground">Checking your Stripe configuration</p>
          </div>
        </div>
      </div>
    )
  }

  if (!diagnostics) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load diagnostics. Please try again.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stripe Configuration Diagnostics</h1>
          <p className="text-muted-foreground">Complete analysis of your Stripe integration</p>
        </div>
        <Button onClick={runDiagnostics} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔑 Environment Variables
            {diagnostics.environment.hasSecretKey && diagnostics.environment.hasPublishableKey ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Issues Found
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>STRIPE_SECRET_KEY</span>
                {diagnostics.environment.hasSecretKey ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Present
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>
              {diagnostics.environment.hasSecretKey && (
                <p className="text-sm text-muted-foreground font-mono">{diagnostics.environment.secretKeyPrefix}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</span>
                {diagnostics.environment.hasPublishableKey ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Present
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>
              {diagnostics.environment.hasPublishableKey && (
                <p className="text-sm text-muted-foreground font-mono">
                  {diagnostics.environment.publishableKeyPrefix}
                </p>
              )}
            </div>
          </div>

          {diagnostics.environment.hasPublishableKeyWrongName && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Wrong Environment Variable Name</AlertTitle>
              <AlertDescription>
                Found <code>STRIPE_PUBLISHABLE_KEY</code> but it should be{" "}
                <code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
                <br />
                <span className="font-mono text-sm mt-2 block">
                  Current value: {diagnostics.environment.publishableKeyWrongPrefix}
                </span>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Environment:</span>
              {diagnostics.environment.isLiveKey ? (
                <Badge variant="destructive">LIVE</Badge>
              ) : diagnostics.environment.isTestKey ? (
                <Badge variant="secondary">TEST</Badge>
              ) : (
                <Badge variant="outline">UNKNOWN</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      {diagnostics.account && (
        <Card>
          <CardHeader>
            <CardTitle>🏢 Stripe Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="font-mono">{diagnostics.account.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Country</p>
                <p>{diagnostics.account.country}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Default Currency</p>
                <p>{diagnostics.account.defaultCurrency.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex gap-2">
                  <Badge variant={diagnostics.account.chargesEnabled ? "default" : "destructive"}>
                    Charges: {diagnostics.account.chargesEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Badge variant={diagnostics.account.payoutsEnabled ? "default" : "destructive"}>
                    Payouts: {diagnostics.account.payoutsEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Check */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Price Configuration Check</CardTitle>
          <CardDescription>Checking your specific price IDs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {diagnostics.priceCheck.map((priceCheck) => (
            <div key={priceCheck.priceId} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <code className="text-sm">{priceCheck.priceId}</code>
                {priceCheck.exists ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Found
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Found
                  </Badge>
                )}
              </div>
              {priceCheck.exists && priceCheck.price && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>
                    <p>${((priceCheck.price.amount || 0) / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p>{priceCheck.price.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active:</span>
                    <p>{priceCheck.price.active ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Product:</span>
                    <p>{priceCheck.price.product?.name || "Unknown"}</p>
                  </div>
                </div>
              )}
              {!priceCheck.exists && <p className="text-sm text-red-500">{priceCheck.error}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Available Prices */}
      {diagnostics.availablePrices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Available Prices in Your Account</CardTitle>
            <CardDescription>All prices currently in your Stripe account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {diagnostics.availablePrices.map((price) => (
                <div key={price.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <code className="text-sm">{price.id}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(price.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {price.product?.name} - ${((price.amount || 0) / 100).toFixed(2)} {price.currency}
                      {price.recurring && ` / ${price.recurring.interval}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={price.active ? "default" : "secondary"}>
                      {price.active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{price.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Session */}
      {diagnostics.testSession && (
        <Card>
          <CardHeader>
            <CardTitle>🧪 Test Checkout Session</CardTitle>
            <CardDescription>Testing checkout session creation with a working price</CardDescription>
          </CardHeader>
          <CardContent>
            {diagnostics.testSession.success ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Test Session Created Successfully!</AlertTitle>
                  <AlertDescription>
                    Created checkout session using price {diagnostics.testSession.priceUsed} for $
                    {((diagnostics.testSession.priceAmount || 0) / 100).toFixed(2)}
                  </AlertDescription>
                </Alert>
                <div className="flex gap-2">
                  <Button asChild>
                    <a href={diagnostics.testSession.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test This Checkout Link
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => copyToClipboard(diagnostics.testSession.url || "")}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </Button>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Test Session Failed</AlertTitle>
                <AlertDescription>{diagnostics.testSession.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {diagnostics.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>💡 Recommendations</CardTitle>
            <CardDescription>Issues found and how to fix them</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {diagnostics.recommendations.map((rec, index) => (
              <Alert key={index} variant={getSeverityColor(rec.severity) as any}>
                <div className="flex items-start gap-2">
                  {getSeverityIcon(rec.severity)}
                  <div className="flex-1">
                    <AlertTitle className="flex items-center gap-2">
                      {rec.message}
                      <Badge variant="outline" className="text-xs">
                        {rec.severity}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                      <strong>Action:</strong> {rec.action}
                      {rec.details && <div className="mt-2 p-2 bg-muted rounded text-sm font-mono">{rec.details}</div>}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {!diagnostics.success && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Diagnostics Failed</AlertTitle>
          <AlertDescription>{diagnostics.error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
