"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Database, Server } from "lucide-react"

interface StatusResult {
  success: boolean
  error?: string
  message?: string
}

interface SupabaseStatus {
  configuration: {
    url: string
    anonKey: string
    serviceKey: string
    isConfigured: boolean
  }
  connections: {
    server: StatusResult
    database: StatusResult
    auth: StatusResult
  }
  overall: boolean
}

export default function SupabaseDiagnosticsPage() {
  const [status, setStatus] = useState<SupabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/supabase-status")
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to check status")
      }

      setStatus(data.status)
    } catch (err) {
      console.error("Status check error:", err)
      setError(err instanceof Error ? err.message : "Failed to check status")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const getStatusIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusBadge = (success: boolean, label?: string) => {
    if (success) {
      return (
        <Badge variant="default" className="bg-green-500">
          {label || "Connected"}
        </Badge>
      )
    }
    return <Badge variant="destructive">{label || "Failed"}</Badge>
  }

  const getConfigBadge = (value: string) => {
    if (value === "Configured") {
      return (
        <Badge variant="default" className="bg-green-500">
          Configured
        </Badge>
      )
    }
    if (value === "Missing") {
      return <Badge variant="destructive">Missing</Badge>
    }
    return <Badge variant="secondary">{value}</Badge>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Supabase Diagnostics</h1>
            <p className="text-muted-foreground mt-2">
              Check the status of your Supabase configuration and connections
            </p>
          </div>
          <Button onClick={checkStatus} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {loading && !status && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                <span>Checking Supabase status...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {status && (
          <div className="space-y-6">
            {/* Overall Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(status.overall)}
                  Overall Status
                </CardTitle>
                <CardDescription>
                  {status.overall
                    ? "Supabase is properly configured and all connections are working"
                    : "There are issues with your Supabase configuration or connections"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getStatusBadge(status.overall, status.overall ? "All Systems Operational" : "Issues Detected")}
              </CardContent>
            </Card>

            {/* Configuration Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>Environment variables and configuration status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Supabase URL</span>
                    {getConfigBadge(status.configuration.url)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Anon Key</span>
                    {getConfigBadge(status.configuration.anonKey)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Service Key</span>
                    {getConfigBadge(status.configuration.serviceKey)}
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-medium">Overall Configuration</span>
                  {getStatusBadge(status.configuration.isConfigured)}
                </div>
              </CardContent>
            </Card>

            {/* Connection Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Connection Tests
                </CardTitle>
                <CardDescription>Live connection tests to Supabase services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.connections.server.success)}
                      <span className="font-medium">Server Connection</span>
                    </div>
                    {getStatusBadge(status.connections.server.success)}
                  </div>
                  {status.connections.server.error && (
                    <p className="text-sm text-red-600 ml-7">{status.connections.server.error}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.connections.database.success)}
                      <span className="font-medium">Database Connection</span>
                    </div>
                    {getStatusBadge(status.connections.database.success)}
                  </div>
                  {status.connections.database.error && (
                    <p className="text-sm text-red-600 ml-7">{status.connections.database.error}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.connections.auth.success)}
                      <span className="font-medium">Authentication</span>
                    </div>
                    {getStatusBadge(status.connections.auth.success)}
                  </div>
                  {status.connections.auth.error && (
                    <p className="text-sm text-red-600 ml-7">{status.connections.auth.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            {!status.overall && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Troubleshooting
                  </CardTitle>
                  <CardDescription>Common issues and solutions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {!status.configuration.isConfigured && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <h4 className="font-medium text-orange-800 mb-2">Configuration Issues</h4>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Check that all environment variables are set in your .env.local file</li>
                          <li>• Verify your Supabase project URL and keys are correct</li>
                          <li>• Ensure SUPABASE_SERVICE_ROLE_KEY is set for server operations</li>
                        </ul>
                      </div>
                    )}

                    {!status.connections.server.success && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Server Connection Issues</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Check your internet connection</li>
                          <li>• Verify your Supabase project is active</li>
                          <li>• Check if your Supabase URL is correct</li>
                        </ul>
                      </div>
                    )}

                    {!status.connections.database.success && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Database Connection Issues</h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Verify your service role key has the correct permissions</li>
                          <li>• Check if the 'users' table exists in your database</li>
                          <li>• Ensure Row Level Security (RLS) policies are configured correctly</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
