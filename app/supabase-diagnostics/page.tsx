"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Shield } from "lucide-react"

interface StatusResponse {
  environment: {
    url: boolean
    anonKey: boolean
    serviceKey: boolean
    configured: boolean
  }
  connections: {
    server: { success: boolean; error: string | null }
    service: { success: boolean; error: string | null }
    auth: { success: boolean; error: string | null }
  }
  overall: {
    configured: boolean
    operational: boolean
  }
  timestamp: string
}

export default function SupabaseDiagnosticsPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/supabase-status")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch status")
      }

      setStatus(data)
    } catch (err) {
      console.error("Error fetching Supabase status:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const getStatusIcon = (success: boolean | null) => {
    if (success === null) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = (success: boolean | null, label?: string) => {
    if (success === null) {
      return <Badge variant="secondary">Unknown</Badge>
    }
    return success ? (
      <Badge variant="default" className="bg-green-500">
        {label || "Connected"}
      </Badge>
    ) : (
      <Badge variant="destructive">{label || "Failed"}</Badge>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading diagnostics...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Diagnostics Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchStatus}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supabase Diagnostics</h1>
          <p className="text-muted-foreground">System status and connection diagnostics</p>
        </div>
        <Button onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {status && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(status.overall.operational)}
                Overall Status
              </CardTitle>
              <CardDescription>Last checked: {new Date(status.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Configuration</p>
                  {getStatusBadge(status.overall.configured, status.overall.configured ? "Complete" : "Incomplete")}
                </div>
                <div>
                  <p className="text-sm font-medium">Operational</p>
                  {getStatusBadge(status.overall.operational, status.overall.operational ? "Yes" : "No")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Environment Configuration
              </CardTitle>
              <CardDescription>Environment variables and configuration status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Supabase URL</span>
                  {getStatusBadge(status.environment.url)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Anonymous Key</span>
                  {getStatusBadge(status.environment.anonKey)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Service Role Key</span>
                  {getStatusBadge(status.environment.serviceKey)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Connection Tests
              </CardTitle>
              <CardDescription>Live connection tests to Supabase services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Server Connection</p>
                    <p className="text-xs text-muted-foreground">Server-side database access</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(status.connections.server.success)}
                    {status.connections.server.error && (
                      <p className="text-xs text-red-600 mt-1">{status.connections.server.error}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Service Connection</p>
                    <p className="text-xs text-muted-foreground">Admin/service role access</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(status.connections.service.success)}
                    {status.connections.service.error && (
                      <p className="text-xs text-red-600 mt-1">{status.connections.service.error}</p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Authentication</p>
                    <p className="text-xs text-muted-foreground">Auth service availability</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(status.connections.auth.success)}
                    {status.connections.auth.error && (
                      <p className="text-xs text-red-600 mt-1">{status.connections.auth.error}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          {!status.overall.operational && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  Troubleshooting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {!status.environment.configured && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="font-medium text-yellow-800">Missing Environment Variables</p>
                      <p className="text-yellow-700">
                        Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.
                      </p>
                    </div>
                  )}

                  {status.environment.configured && !status.connections.server.success && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <p className="font-medium text-red-800">Connection Failed</p>
                      <p className="text-red-700">
                        Unable to connect to Supabase. Check your URL and keys, and ensure your Supabase project is
                        active.
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-medium text-blue-800">Need Help?</p>
                    <p className="text-blue-700">
                      Visit the Supabase dashboard to verify your project settings and API keys.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
