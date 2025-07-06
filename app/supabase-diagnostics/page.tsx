"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Map, Shield, Clock } from "lucide-react"

interface DiagnosticResult {
  success: boolean
  configured: boolean
  status?: string
  error?: string
  message?: string
  connectionTest?: {
    success: boolean
    error?: string
    message?: string
  }
  details?: {
    url: string
    anonKey: string
    serviceKey: string
  }
  timestamp?: string
}

export default function SupabaseDiagnosticsPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<DiagnosticResult | null>(null)
  const [googleMapsStatus, setGoogleMapsStatus] = useState<DiagnosticResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const checkSupabaseStatus = async () => {
    try {
      const response = await fetch("/api/supabase-status", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()
      setSupabaseStatus(data)
    } catch (error: any) {
      console.error("Supabase status check failed:", error)
      setSupabaseStatus({
        success: false,
        configured: false,
        status: "error",
        error: error.message || "Failed to check Supabase status",
        timestamp: new Date().toISOString(),
      })
    }
  }

  const checkGoogleMapsStatus = async () => {
    try {
      const response = await fetch("/api/google-maps-config", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })
      const data = await response.json()
      setGoogleMapsStatus(data)
    } catch (error: any) {
      console.error("Google Maps status check failed:", error)
      setGoogleMapsStatus({
        success: false,
        configured: false,
        status: "error",
        error: error.message || "Failed to check Google Maps status",
        timestamp: new Date().toISOString(),
      })
    }
  }

  const runDiagnostics = async () => {
    setLoading(true)
    setLastRefresh(new Date())

    await Promise.all([checkSupabaseStatus(), checkGoogleMapsStatus()])

    setLoading(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  const getStatusIcon = (status: DiagnosticResult | null) => {
    if (!status || loading) return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    if (status.success && status.configured) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (!status.configured) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (status: DiagnosticResult | null) => {
    if (!status || loading) return <Badge variant="secondary">Checking...</Badge>
    if (status.success && status.configured) return <Badge className="bg-green-500 text-white">Healthy</Badge>
    if (!status.configured) return <Badge variant="secondary">Not Configured</Badge>
    return <Badge variant="destructive">Error</Badge>
  }

  const getConnectionStatus = (status: DiagnosticResult | null) => {
    if (!status?.connectionTest) return null

    if (status.connectionTest.success) {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {status.connectionTest.message || "Connection successful"}
          </AlertDescription>
        </Alert>
      )
    }

    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {status.connectionTest.error || "Connection failed"}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">System Diagnostics</h1>
          </div>
          <p className="text-slate-600 text-lg">
            Comprehensive security and health monitoring for all system components
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button onClick={runDiagnostics} disabled={loading} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Checking..." : "Refresh All"}
            </Button>

            {lastRefresh && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Overall Status Summary */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>Quick overview of all system components and their health status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-slate-600" />
                  <span className="font-medium">Supabase Database</span>
                </div>
                {getStatusBadge(supabaseStatus)}
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-slate-600" />
                  <span className="font-medium">Google Maps API</span>
                </div>
                {getStatusBadge(googleMapsStatus)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Supabase Status */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(supabaseStatus)}
                  <CardTitle>Supabase Database</CardTitle>
                </div>
                {getStatusBadge(supabaseStatus)}
              </div>
              <CardDescription>Authentication, database connection, and security status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {supabaseStatus ? (
                <>
                  {/* Configuration Details */}
                  {supabaseStatus.details && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Configuration Status</h4>
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Database URL</span>
                          <Badge variant={supabaseStatus.details.url === "Configured" ? "default" : "destructive"}>
                            {supabaseStatus.details.url}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Anonymous Key</span>
                          <Badge variant={supabaseStatus.details.anonKey === "Configured" ? "default" : "destructive"}>
                            {supabaseStatus.details.anonKey}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Service Role Key</span>
                          <Badge variant={supabaseStatus.details.serviceKey === "Configured" ? "default" : "secondary"}>
                            {supabaseStatus.details.serviceKey}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Connection Test */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Connection Test</h4>
                    {getConnectionStatus(supabaseStatus)}
                  </div>

                  {/* Error Details */}
                  {supabaseStatus.error && (
                    <>
                      <Separator />
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Error:</strong> {supabaseStatus.error}
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking Supabase configuration and connection...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Maps Status */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(googleMapsStatus)}
                  <CardTitle>Google Maps API</CardTitle>
                </div>
                {getStatusBadge(googleMapsStatus)}
              </div>
              <CardDescription>Google Maps integration and API key configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {googleMapsStatus ? (
                <>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">API Configuration</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Key Status</span>
                      <Badge variant={googleMapsStatus.configured ? "default" : "secondary"}>
                        {googleMapsStatus.configured ? "Configured" : "Not Configured"}
                      </Badge>
                    </div>
                  </div>

                  {googleMapsStatus.error && (
                    <>
                      <Separator />
                      <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          <strong>Error:</strong> {googleMapsStatus.error}
                        </AlertDescription>
                      </Alert>
                    </>
                  )}

                  {googleMapsStatus.configured && (
                    <>
                      <Separator />
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          Google Maps API is properly configured and ready for use
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking Google Maps API configuration...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Security & Troubleshooting Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Security & Troubleshooting Guide
            </CardTitle>
            <CardDescription>Security best practices and common issue resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold text-green-700">✅ Security Features Enabled</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Environment variable validation with Zod schemas
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Input sanitization and validation on all endpoints
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Rate limiting on authentication endpoints
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Secure API key handling (server-side only)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    No-cache headers on sensitive endpoints
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-blue-700">🔧 Troubleshooting Steps</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-medium">Supabase Issues:</h5>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                      <li>Verify environment variables are set correctly</li>
                      <li>Check Supabase project is active and not paused</li>
                      <li>Ensure RLS policies allow required operations</li>
                      <li>Confirm database tables exist with correct schema</li>
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium">Google Maps Issues:</h5>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                      <li>Verify API key has proper restrictions</li>
                      <li>Check billing is enabled for Google Cloud project</li>
                      <li>Ensure required APIs are enabled</li>
                      <li>Confirm domain restrictions are configured</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
