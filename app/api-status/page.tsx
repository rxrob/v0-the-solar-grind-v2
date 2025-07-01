"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowLeft,
  Server,
  Database,
  Globe,
  Sun,
  CreditCard,
  Shield,
  Activity,
  Zap,
} from "lucide-react"
import Link from "next/link"

interface ServiceStatus {
  name: string
  category: string
  endpoint: string
  critical: boolean
  status: "healthy" | "error" | "degraded"
  message: string
  response_time: number
  details: Record<string, any>
  timestamp: string
  http_status: number
}

interface CategoryData {
  services: ServiceStatus[]
  healthy: number
  total: number
  critical: number
  avg_response_time: number
}

interface StatusData {
  status: "healthy" | "degraded" | "unhealthy"
  message: string
  summary: {
    total: number
    healthy: number
    error: number
    critical_total: number
    critical_healthy: number
    average_response_time: number
    overall_health_percentage: number
    critical_health_percentage: number
  }
  categories: Record<string, CategoryData>
  services: ServiceStatus[]
  recommendations: string[]
  timestamp: string
  base_url: string
  total_check_time: number
}

export default function ApiStatusPage() {
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStatus = async () => {
    try {
      setError(null)
      const response = await fetch("/api/status/all")
      const data = await response.json()

      if (response.ok) {
        setStatusData(data)
        setLastUpdated(new Date())
      } else {
        setError(data.message || "Failed to fetch status")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(fetchStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "database":
        return <Database className="h-5 w-5 text-blue-500" />
      case "google services":
        return <Globe className="h-5 w-5 text-green-500" />
      case "solar data":
        return <Sun className="h-5 w-5 text-yellow-500" />
      case "payments":
        return <CreditCard className="h-5 w-5 text-purple-500" />
      case "security":
        return <Shield className="h-5 w-5 text-red-500" />
      default:
        return <Server className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string, critical: boolean) => {
    if (status === "healthy") {
      return <Badge className="bg-green-100 text-green-800">Operational</Badge>
    } else if (status === "degraded") {
      return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
    } else {
      return <Badge variant={critical ? "destructive" : "secondary"}>{critical ? "Critical Error" : "Error"}</Badge>
    }
  }

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>Failed to load API status: {error}</AlertDescription>
        </Alert>
        <Button onClick={fetchStatus} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  if (!statusData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">API Status Dashboard</span>
                <Badge
                  className={
                    statusData.status === "healthy"
                      ? "bg-green-100 text-green-800"
                      : statusData.status === "degraded"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {statusData.status === "healthy"
                    ? "All Systems Operational"
                    : statusData.status === "degraded"
                      ? "Some Issues"
                      : "Service Issues"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? "bg-green-50 border-green-200" : ""}
              >
                <Zap className="h-4 w-4 mr-2" />
                Auto-refresh {autoRefresh ? "ON" : "OFF"}
              </Button>
              <Button onClick={fetchStatus} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        {/* System Overview */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>{statusData.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Overall Health</div>
                <div className="space-y-1">
                  <Progress value={statusData.summary.overall_health_percentage} className="h-3" />
                  <div className="text-xs text-gray-500">
                    {statusData.summary.overall_health_percentage}% operational
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Services</div>
                <div className="text-2xl font-bold text-green-600">
                  {statusData.summary.healthy}/{statusData.summary.total}
                </div>
                <div className="text-xs text-gray-500">Healthy</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Critical Services</div>
                <div className="text-2xl font-bold text-blue-600">
                  {statusData.summary.critical_healthy}/{statusData.summary.critical_total}
                </div>
                <div className="text-xs text-gray-500">Operational</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Response Time</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatResponseTime(statusData.summary.average_response_time)}
                </div>
                <div className="text-xs text-gray-500">Average</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Issues</div>
                <div className="text-2xl font-bold text-red-600">{statusData.summary.error}</div>
                <div className="text-xs text-gray-500">Services Down</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        {statusData.recommendations.length > 0 && (
          <Alert
            variant={statusData.status === "healthy" ? "default" : "destructive"}
            className="shadow-xl border-0 bg-white/90 backdrop-blur-sm"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>System recommendations:</AlertDescription>
          </Alert>
        )}

        {/* Recommendations List - Outside AlertDescription */}
        {statusData.recommendations.length > 0 && (
          <div className="space-y-2 -mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {statusData.recommendations.map((rec, index) => (
              <div key={index} className="text-sm text-blue-800">
                • {rec}
              </div>
            ))}
          </div>
        )}

        {/* Service Status by Category */}
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="critical">Critical Only</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            {Object.entries(statusData.categories).map(([category, data]) => (
              <Card key={category} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {data.healthy}/{data.total} operational
                      </Badge>
                      <Badge variant="secondary">{formatResponseTime(data.avg_response_time)} avg</Badge>
                      {data.critical > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {data.critical} critical
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    <Progress value={(data.healthy / data.total) * 100} className="w-full h-2 mt-2" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.services.map((service) => (
                      <div
                        key={service.endpoint}
                        className={`p-4 rounded-lg border ${
                          service.status === "healthy"
                            ? "bg-green-50 border-green-200"
                            : service.status === "degraded"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(service.status)}
                            <div>
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-gray-600">{service.message}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(service.status, service.critical)}
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatResponseTime(service.response_time)}
                            </div>
                          </div>
                        </div>

                        {/* Service Details */}
                        {Object.keys(service.details).length > 0 && (
                          <div className="mt-3 p-3 bg-white/50 rounded border">
                            <div className="text-xs font-medium text-gray-600 mb-2">Details:</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(service.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-500">{key.replace(/_/g, " ")}:</span>
                                  <span className="font-mono">
                                    {typeof value === "boolean"
                                      ? value
                                        ? "✓"
                                        : "✗"
                                      : typeof value === "object"
                                        ? JSON.stringify(value)
                                        : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>All Services</CardTitle>
                <CardDescription>Complete list of all monitored services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statusData.services.map((service) => (
                    <div
                      key={service.endpoint}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        service.status === "healthy"
                          ? "bg-green-50 border-green-200"
                          : service.status === "degraded"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(service.status)}
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-600">{service.category}</div>
                          <div className="text-xs text-gray-500">{service.message}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {service.critical && (
                          <Badge variant="outline" className="text-xs">
                            Critical
                          </Badge>
                        )}
                        {getStatusBadge(service.status, service.critical)}
                        <div className="text-xs text-gray-500">{formatResponseTime(service.response_time)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="critical" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Critical Services</CardTitle>
                <CardDescription>Services essential for application functionality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statusData.services
                    .filter((service) => service.critical)
                    .map((service) => (
                      <div
                        key={service.endpoint}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          service.status === "healthy"
                            ? "bg-green-50 border-green-200"
                            : service.status === "degraded"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(service.status)}
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-gray-600">{service.category}</div>
                            <div className="text-xs text-gray-500">{service.message}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(service.status, service.critical)}
                          <div className="text-xs text-gray-500">{formatResponseTime(service.response_time)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Information */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Technical details about the status check</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-600">Base URL</div>
                <div className="font-mono text-xs">{statusData.base_url}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Check Duration</div>
                <div>{formatResponseTime(statusData.total_check_time)}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">Last Updated</div>
                <div>{new Date(statusData.timestamp).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and helpful links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" asChild>
                <Link href="/environment-check">
                  <Server className="h-4 w-4 mr-2" />
                  Check Environment
                </Link>
              </Button>
              <Button variant="outline" onClick={fetchStatus}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Application
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
