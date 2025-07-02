"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  CreditCard,
  Map,
  Sun,
  ExternalLink,
} from "lucide-react"

interface EnvironmentStatus {
  supabase: {
    configured: boolean
    url_present: boolean
    anon_key_present: boolean
    service_role_present: boolean
    issues: string[]
  }
  stripe: {
    configured: boolean
    secret_key_present: boolean
    publishable_key_present: boolean
    webhook_secret_present: boolean
    environment_type: "test" | "live" | "unknown"
    issues: string[]
  }
  google: {
    configured: boolean
    maps_key_present: boolean
    geocoding_key_present: boolean
    elevation_key_present: boolean
    issues: string[]
  }
  nrel: {
    configured: boolean
    api_key_present: boolean
    issues: string[]
  }
  overall: {
    status: "healthy" | "partial" | "critical" | "unknown"
    critical_issues: number
    warnings: number
  }
}

export default function EnvironmentCheckPage() {
  const [status, setStatus] = useState<EnvironmentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/check-environment")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      console.error("Failed to fetch environment status:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const getStatusIcon = (configured: boolean) => {
    return configured ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = (configured: boolean) => {
    return (
      <Badge variant={configured ? "default" : "destructive"} className="ml-2">
        {configured ? "Configured" : "Missing"}
      </Badge>
    )
  }

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200"
      case "partial":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Checking environment configuration...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" />
              Environment Check Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchStatus} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Check
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No status data available</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Environment Configuration</h1>
          <p className="text-gray-600">Check the status of all required services and API keys</p>
        </div>

        {/* Overall Status */}
        <Card className={`mb-8 border-2 ${getOverallStatusColor(status.overall.status)}`}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {status.overall.status === "healthy" ? (
                <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
              ) : status.overall.status === "partial" ? (
                <AlertTriangle className="h-6 w-6 mr-2 text-yellow-500" />
              ) : (
                <XCircle className="h-6 w-6 mr-2 text-red-500" />
              )}
              Overall Status: {status.overall.status.toUpperCase()}
            </CardTitle>
            <CardDescription>
              {status.overall.critical_issues === 0
                ? "All services are properly configured"
                : `${status.overall.critical_issues} configuration issues found`}
            </CardDescription>
          </CardHeader>
          {status.overall.critical_issues > 0 && (
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some services are not configured. The application will work in limited mode until all issues are
                  resolved.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        {/* Service Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supabase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-500" />
                Supabase Database
                {getStatusBadge(status.supabase.configured)}
              </CardTitle>
              <CardDescription>User authentication and data storage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Project URL</span>
                  {getStatusIcon(status.supabase.url_present)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Anonymous Key</span>
                  {getStatusIcon(status.supabase.anon_key_present)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Service Role Key</span>
                  {getStatusIcon(status.supabase.service_role_present)}
                </div>
              </div>

              {status.supabase.issues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-red-600 mb-2">Issues:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {status.supabase.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Supabase Dashboard
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stripe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
                Stripe Payments
                {getStatusBadge(status.stripe.configured)}
              </CardTitle>
              <CardDescription>Payment processing ({status.stripe.environment_type} mode)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Secret Key</span>
                  {getStatusIcon(status.stripe.secret_key_present)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Publishable Key</span>
                  {getStatusIcon(status.stripe.publishable_key_present)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Webhook Secret</span>
                  {getStatusIcon(status.stripe.webhook_secret_present)}
                </div>
              </div>

              {status.stripe.issues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-red-600 mb-2">Issues:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {status.stripe.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Stripe Dashboard
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google APIs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="h-5 w-5 mr-2 text-green-500" />
                Google APIs
                {getStatusBadge(status.google.configured)}
              </CardTitle>
              <CardDescription>Maps, geocoding, and elevation data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Maps API Key</span>
                  {getStatusIcon(status.google.maps_key_present)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Geocoding API Key</span>
                  {getStatusIcon(status.google.geocoding_key_present)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Elevation API Key</span>
                  {getStatusIcon(status.google.elevation_key_present)}
                </div>
              </div>

              {status.google.issues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-red-600 mb-2">Issues:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {status.google.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Google Cloud Console
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NREL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sun className="h-5 w-5 mr-2 text-orange-500" />
                NREL Solar Data
                {getStatusBadge(status.nrel.configured)}
              </CardTitle>
              <CardDescription>Solar irradiance and weather data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Key</span>
                  {getStatusIcon(status.nrel.api_key_present)}
                </div>
              </div>

              {status.nrel.issues.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-red-600 mb-2">Issues:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {status.nrel.issues.map((issue, index) => (
                      <li key={index}>• {issue}</li>
                    ))}
                  </ul>
                  <div className="mt-3">
                    <Button size="sm" variant="outline" asChild>
                      <a href="https://developer.nrel.gov" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        NREL Developer Portal
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-8 text-center">
          <Button onClick={fetchStatus} className="mr-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button variant="outline" asChild>
            <a href="/stripe-environment-check">
              <CreditCard className="h-4 w-4 mr-2" />
              Detailed Stripe Check
            </a>
          </Button>
        </div>

        {/* Help Section */}
        {status.overall.critical_issues > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Follow these steps to configure your environment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">1. Create your .env.local file</h4>
                  <p className="text-sm text-gray-600">
                    Copy .env.local.example to .env.local and fill in your actual API keys
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">2. Get your API keys</h4>
                  <p className="text-sm text-gray-600">
                    Visit each service's dashboard to get your API keys and configuration values
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">3. Restart your application</h4>
                  <p className="text-sm text-gray-600">
                    After updating your environment variables, restart your development server
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
