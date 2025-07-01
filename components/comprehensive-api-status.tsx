"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Clock } from "lucide-react"

interface ServiceStatus {
  name: string
  status: "operational" | "degraded" | "down" | "unknown"
  responseTime?: number
  lastChecked: string
  error?: string
  details?: Record<string, any>
}

interface ApiStatusData {
  success: boolean
  services: Record<string, ServiceStatus>
  timestamp: string
}

export function ComprehensiveApiStatus() {
  const [data, setData] = useState<ApiStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApiStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/status/all")
      const result = await response.json()

      if (result.success) {
        setData(result)
      } else {
        setError(result.error || "Failed to fetch API status")
      }
    } catch (err) {
      console.error("API status fetch error:", err)
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApiStatus()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchApiStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "down":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Operational
          </Badge>
        )
      case "degraded":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Degraded
          </Badge>
        )
      case "down":
        return <Badge variant="destructive">Down</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatResponseTime = (time?: number) => {
    if (!time) return "N/A"
    if (time < 1000) return `${time}ms`
    return `${(time / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Checking API Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Testing all API endpoints...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            API Status Check Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Failed to check API status: {error}</AlertDescription>
          </Alert>
          <Button onClick={fetchApiStatus} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const services = Object.values(data.services)
  const operationalCount = services.filter((s) => s.status === "operational").length
  const totalCount = services.length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {operationalCount === totalCount ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : operationalCount > totalCount / 2 ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                API Status Overview
              </CardTitle>
              <CardDescription>
                {operationalCount} of {totalCount} services operational
              </CardDescription>
            </div>
            <Button onClick={fetchApiStatus} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">{operationalCount}</div>
              <div className="text-sm text-gray-500">Operational</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {services.filter((s) => s.status === "degraded").length}
              </div>
              <div className="text-sm text-gray-500">Degraded</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {services.filter((s) => s.status === "down").length}
              </div>
              <div className="text-sm text-gray-500">Down</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data.services).map(([serviceName, service]) => (
          <Card key={serviceName}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  {service.name}
                </CardTitle>
                {getStatusBadge(service.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Response Time */}
                {service.responseTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Response Time
                    </span>
                    <span className="font-mono">{formatResponseTime(service.responseTime)}</span>
                  </div>
                )}

                {/* Last Checked */}
                <div className="flex items-center justify-between text-sm">
                  <span>Last Checked</span>
                  <span className="text-gray-600">{new Date(service.lastChecked).toLocaleTimeString()}</span>
                </div>

                {/* Error Message */}
                {service.error && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">{service.error}</AlertDescription>
                  </Alert>
                )}

                {/* Service Details */}
                {service.details && Object.keys(service.details).length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs font-medium text-gray-700 mb-2">Details:</div>
                    <div className="space-y-1">
                      {Object.entries(service.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                          <span className="font-mono text-gray-900">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">Last updated: {new Date(data.timestamp).toLocaleString()}</div>
    </div>
  )
}
