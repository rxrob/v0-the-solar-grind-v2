"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Server,
  Shield,
  Globe,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

interface DiagnosticsData {
  success: boolean
  timestamp: string
  environment: {
    url: string
    anonKey: string
    serviceKey: string
    configured: boolean
  }
  client: {
    hasInstance: boolean
    configured: boolean
    url: string
    anonKey: string
  }
  server: {
    success: boolean
    error?: string
  }
  database: {
    success: boolean
    error?: string
  }
  auth: {
    success: boolean
    error?: string
  }
  overall: {
    healthy: boolean
    issues: string[]
  }
  error?: string
}

export default function SupabaseDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDiagnostics = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Fetching diagnostics...")
      const response = await fetch("/api/supabase-status")

      console.log("📡 Response status:", response.status)
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Response not ok:", errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        const responseText = await response.text()
        console.error("❌ Invalid content type:", contentType, responseText)
        throw new Error(`Expected JSON, got ${contentType}. Response: ${responseText.slice(0, 200)}...`)
      }

      const data = await response.json()
      console.log("✅ Diagnostics data:", data)

      setDiagnostics(data)
    } catch (err) {
      console.error("❌ Failed to fetch diagnostics:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")

      // Provide fallback data for debugging
      setDiagnostics({
        success: false,
        timestamp: new Date().toISOString(),
        environment: { url: "Unknown", anonKey: "Unknown", serviceKey: "Unknown", configured: false },
        client: { hasInstance: false, configured: false, url: "Unknown", anonKey: "Unknown" },
        server: { success: false, error: "Failed to test" },
        database: { success: false, error: "Failed to test" },
        auth: { success: false, error: "Failed to test" },
        overall: { healthy: false, issues: ["Failed to fetch diagnostics"] },
        error: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiagnostics()
  }, [])

  const getStatusIcon = (success: boolean) => {
    return success ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (success: boolean, label?: string) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className={success ? "bg-green-100 text-green-800" : ""}>
        {label || (success ? "Healthy" : "Error")}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Supabase Diagnostics</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Supabase Diagnostics</h1>
            <p className="text-gray-600">System health and configuration status</p>
          </div>
        </div>
        <Button onClick={fetchDiagnostics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Failed to fetch diagnostics: {error}</AlertDescription>
        </Alert>
      )}

      {/* Debug Information */}
      {error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono bg-gray-100 p-3 rounded">
              <div>Error: {error}</div>
              <div>Timestamp: {new Date().toISOString()}</div>
              <div>URL: {window.location.href}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {diagnostics && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(diagnostics.overall.healthy)}
                Overall System Health
              </CardTitle>
              <CardDescription>Last checked: {new Date(diagnostics.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getStatusBadge(
                  diagnostics.overall.healthy,
                  diagnostics.overall.healthy ? "All Systems Operational" : "Issues Detected",
                )}

                {diagnostics.overall.issues.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Issues Found:</h4>
                    <ul className="space-y-1">
                      {diagnostics.overall.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-center gap-2">
                          <XCircle className="h-3 w-3" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Status */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Environment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Environment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(diagnostics.environment.configured)}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Supabase URL:</span>
                      <span className="font-mono">{diagnostics.environment.url}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Anon Key:</span>
                      <span className="font-mono">{diagnostics.environment.anonKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Key:</span>
                      <span className="font-mono">{diagnostics.environment.serviceKey}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(diagnostics.client.configured)}
                  Client Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(diagnostics.client.configured)}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Has Instance:</span>
                      <span>{diagnostics.client.hasInstance ? "Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Configured:</span>
                      <span>{diagnostics.client.configured ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Server */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Server Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(diagnostics.server.success)}
                  {diagnostics.server.error && (
                    <div className="text-sm text-red-600">Error: {diagnostics.server.error}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Database */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(diagnostics.database.success)}
                  {diagnostics.database.error && (
                    <div className="text-sm text-red-600">Error: {diagnostics.database.error}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Auth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(diagnostics.auth.success)}
                  {diagnostics.auth.error && (
                    <div className="text-sm text-red-600">Error: {diagnostics.auth.error}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Raw Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Raw Diagnostics Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                {JSON.stringify(diagnostics, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
