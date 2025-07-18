"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Activity, CheckCircle, Clock, Globe, Zap, Shield, TrendingUp } from "lucide-react"

export default function MonitoringPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkHealth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealthStatus(data)
    } catch (error) {
      setHealthStatus({
        status: "error",
        message: "Failed to fetch health status",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "ok":
        return "text-green-600 bg-green-50 border-green-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "ok":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <Clock className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-slate-900">System Status</h1>
              <p className="text-slate-600">Lightweight monitoring with external services</p>
            </div>
          </div>
          <Button onClick={checkHealth} disabled={isLoading} variant="outline">
            {isLoading ? "Checking..." : "Check Now"}
          </Button>
        </div>

        {/* Current Status */}
        {healthStatus && (
          <Card className={`border-2 ${getStatusColor(healthStatus.status)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(healthStatus.status)}
                  <div>
                    <CardTitle className="text-2xl">System Status</CardTitle>
                    <CardDescription>{healthStatus.message}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={healthStatus.status === "healthy" ? "default" : "destructive"}>
                    {healthStatus.status.toUpperCase()}
                  </Badge>
                  {healthStatus.response_time && (
                    <div className="text-sm text-slate-500 mt-1">Response: {healthStatus.response_time}ms</div>
                  )}
                </div>
              </div>
            </CardHeader>
            {healthStatus.services && (
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(healthStatus.services).map(([service, status]) => (
                    <div key={service} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="capitalize">{service}</span>
                      <Badge variant={status === "operational" ? "default" : "destructive"}>{status as string}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* External Monitoring Setup */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Uptime Robot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                Uptime Robot
              </CardTitle>
              <CardDescription>Free external uptime monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Monitor your site 24/7 with 5-minute intervals and get instant alerts via email, SMS, or webhook.
                </p>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm font-mono">Monitor URL:</p>
                  <p className="text-sm font-mono text-blue-600">
                    {typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/health
                  </p>
                </div>
              </div>
              <Button asChild className="w-full">
                <a href="https://uptimerobot.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Set up Uptime Robot
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Vercel Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Vercel Analytics
              </CardTitle>
              <CardDescription>Built-in performance monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Track Core Web Vitals, page views, and performance metrics directly in your Vercel dashboard.
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real User Monitoring (RUM)
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Core Web Vitals tracking
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Performance insights
                  </div>
                </div>
              </div>
              <Button asChild className="w-full">
                <a href="https://vercel.com/analytics" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Enable Vercel Analytics
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Setup Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Setup Guide
            </CardTitle>
            <CardDescription>Get monitoring up and running in 5 minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Set up Uptime Robot</h4>
                  <p className="text-sm text-slate-600">
                    Create a free account and add your health check URL:{" "}
                    <code className="bg-slate-100 px-1 rounded">/api/health</code>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Enable Vercel Analytics</h4>
                  <p className="text-sm text-slate-600">
                    Add <code className="bg-slate-100 px-1 rounded">@vercel/analytics</code> to track performance
                    metrics
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Configure Alerts</h4>
                  <p className="text-sm text-slate-600">
                    Set up email/SMS notifications in Uptime Robot for instant downtime alerts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  ✓
                </div>
                <div>
                  <h4 className="font-medium">You're all set!</h4>
                  <p className="text-sm text-slate-600">
                    Your site is now monitored 24/7 with zero impact on Vercel performance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Why This Approach is Better
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Advantages</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Zero impact on Vercel performance</li>
                  <li>• No database storage overhead</li>
                  <li>• Professional external monitoring</li>
                  <li>• 24/7 monitoring from multiple locations</li>
                  <li>• Instant alerts via multiple channels</li>
                  <li>• Free tier available</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">📊 What You Get</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Uptime percentage tracking</li>
                  <li>• Response time monitoring</li>
                  <li>• Downtime alerts</li>
                  <li>• Historical data and reports</li>
                  <li>• Status page creation</li>
                  <li>• Performance insights</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
