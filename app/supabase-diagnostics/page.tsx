"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Shield, Server, Globe } from "lucide-react"

interface StatusResult {
  success: boolean
  status?: {
    healthy: boolean
    issues: string[]
  }
  details?: {
    environment: {
      url: boolean
      anonKey: boolean
      serviceKey: boolean
    }
    connections: {
      client: { success: boolean; error: string | null }
      server: { success: boolean; error: string | null }
      service: { success: boolean; error: string | null }
    }
    database: {
      accessible: boolean
      tablesExist: boolean
      error: string | null
    }
    auth: {
      configured: boolean
      working: boolean
      error: string | null
    }
  }
  error?: string
  timestamp?: string
}

export default function SupabaseDiagnosticsPage() {
  const [status, setStatus] = useState<StatusResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/supabase-status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Status check failed:", error)
      setStatus({
        success: false,
        error: error instanceof Error ? error.message : "Failed to check status",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await checkStatus()
  }

  const StatusIcon = ({ success, error }: { success?: boolean; error?: string | null }) => {
    if (error) return <XCircle className="h-5 w-5 text-red-500" />
    if (success) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <AlertCircle className="h-5 w-5 text-yellow-500" />
  }

  const StatusBadge = ({ success, error }: { success?: boolean; error?: string | null }) => {
    if (error) return <Badge variant="destructive">Error</Badge>
    if (success)
      return (
        <Badge variant="default" className="bg-green-500">
          Connected
        </Badge>
      )
    return <Badge variant="secondary">Unknown</Badge>
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Checking Supabase status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supabase Diagnostics</h1>
          <p className="text-muted-foreground">Comprehensive status check for all Supabase connections and services</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {status?.error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              Diagnostics Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{status.error}</p>
          </CardContent>
        </Card>
      )}

      {status?.details && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Overall Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <StatusIcon success={status.status?.healthy} />
                <div>
                  <p className="font-medium">{status.status?.healthy ? "System Healthy" : "Issues Detected"}</p>
                  {status.status?.issues && status.status.issues.length > 0 && (
                    <ul className="text-sm text-muted-foreground mt-2">
                      {status.status.issues.map((issue, index) => (
                        <li key={index} className="flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Environment Configuration
              </CardTitle>
              <CardDescription>Environment variables and configuration status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span>Supabase URL</span>
                  <StatusBadge success={status.details.environment.url} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Anonymous Key</span>
                  <StatusBadge success={status.details.environment.anonKey} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Service Role Key</span>
                  <StatusBadge success={status.details.environment.serviceKey} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="h-5 w-5 mr-2" />
                Connection Status
              </CardTitle>
              <CardDescription>Status of different Supabase client connections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Server Client</span>
                    <p className="text-sm text-muted-foreground">Server-side connection with cookies</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon
                      success={status.details.connections.server.success}
                      error={status.details.connections.server.error}
                    />
                    <StatusBadge
                      success={status.details.connections.server.success}
                      error={status.details.connections.server.error}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Service Client</span>
                    <p className="text-sm text-muted-foreground">Admin client with service role key</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusIcon
                      success={status.details.connections.service.success}
                      error={status.details.connections.service.error}
                    />
                    <StatusBadge
                      success={status.details.connections.service.success}
                      error={status.details.connections.service.error}
                    />
                  </div>
                </div>
              </div>

              {(status.details.connections.server.error || status.details.connections.service.error) && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-700 mb-2">Connection Errors:</h4>
                  <ul className="text-sm text-red-600 space-y-1">
                    {status.details.connections.server.error && (
                      <li>Server: {status.details.connections.server.error}</li>
                    )}
                    {status.details.connections.service.error && (
                      <li>Service: {status.details.connections.service.error}</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Database Status
              </CardTitle>
              <CardDescription>Database accessibility and table structure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span>Database Accessible</span>
                  <StatusBadge success={status.details.database.accessible} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Tables Exist</span>
                  <StatusBadge success={status.details.database.tablesExist} />
                </div>
              </div>

              {status.details.database.error && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{status.details.database.error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Authentication Status
              </CardTitle>
              <CardDescription>Authentication service configuration and functionality</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span>Auth Configured</span>
                  <StatusBadge success={status.details.auth.configured} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Auth Working</span>
                  <StatusBadge success={status.details.auth.working} />
                </div>
              </div>

              {status.details.auth.error && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{status.details.auth.error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Troubleshooting Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Troubleshooting Guide</CardTitle>
              <CardDescription>Common issues and solutions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Environment Variables Missing</h4>
                  <p className="text-sm text-muted-foreground">
                    Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium">Connection Errors</h4>
                  <p className="text-sm text-muted-foreground">
                    Check your Supabase project settings and ensure the URL and keys are correct
                  </p>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium">Database Access Issues</h4>
                  <p className="text-sm text-muted-foreground">
                    Verify that your database tables exist and RLS policies are configured correctly
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {status?.timestamp && (
        <p className="text-sm text-muted-foreground text-center">
          Last checked: {new Date(status.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  )
}
