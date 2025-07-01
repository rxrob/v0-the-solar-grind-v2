"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Copy,
  Eye,
  EyeOff,
  ArrowLeft,
  Server,
  Database,
  Globe,
  CreditCard,
  Shield,
  Sun,
  Key,
} from "lucide-react"
import Link from "next/link"

interface EnvironmentData {
  status: "complete" | "partial" | "missing"
  message: string
  categories: Record<
    string,
    {
      variables: Array<{
        name: string
        value: string | null
        required: boolean
        description: string
        category: string
      }>
      total: number
      configured: number
      required: number
      required_configured: number
    }
  >
  missing_required: Array<{
    name: string
    description: string
    category: string
  }>
  recommendations: string[]
  env_template: string
  summary: {
    total_variables: number
    configured_variables: number
    required_variables: number
    required_configured: number
    configuration_percentage: number
    required_percentage: number
  }
}

export default function EnvironmentCheckPage() {
  const [envData, setEnvData] = useState<EnvironmentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showValues, setShowValues] = useState(false)
  const [copiedTemplate, setCopiedTemplate] = useState(false)

  const fetchEnvironmentData = async () => {
    try {
      setError(null)
      const response = await fetch("/api/check-environment")
      const data = await response.json()

      if (response.ok) {
        setEnvData(data)
      } else {
        setError(data.message || "Failed to fetch environment data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnvironmentData()
  }, [])

  const maskValue = (value: string | null) => {
    if (!value) return "Not set"
    if (showValues) return value
    return value?.substring(0, 8) + "..." || "Not set"
  }

  const downloadTemplate = () => {
    if (!envData) return

    const blob = new Blob([envData.env_template], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = ".env.local"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyTemplate = async () => {
    if (!envData) return

    try {
      await navigator.clipboard.writeText(envData.env_template)
      setCopiedTemplate(true)
      setTimeout(() => setCopiedTemplate(false), 2000)
    } catch (err) {
      console.error("Failed to copy template:", err)
    }
  }

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
        return <Key className="h-5 w-5 text-gray-500" />
    }
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
          <AlertDescription>Failed to load environment data: {error}</AlertDescription>
        </Alert>
        <Button onClick={fetchEnvironmentData} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!envData) return null

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
                <Server className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Environment Configuration</span>
                <Badge
                  className={
                    envData.status === "complete"
                      ? "bg-green-100 text-green-800"
                      : envData.status === "partial"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {envData.status === "complete" ? "Complete" : envData.status === "partial" ? "Partial" : "Incomplete"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setShowValues(!showValues)} className="min-w-[120px]">
                <span className="inline-block w-[100px]">
                  {showValues ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2 inline" />
                      Hide Values
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2 inline" />
                      Show Values
                    </>
                  )}
                </span>
              </Button>
              <Button onClick={fetchEnvironmentData} size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
        {/* Configuration Overview */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Configuration Overview
            </CardTitle>
            <CardDescription>{envData.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Overall Progress</div>
                <div className="text-2xl font-bold text-blue-600">{envData.summary.configuration_percentage}%</div>
                <div className="text-xs text-gray-500">
                  {envData.summary.configured_variables}/{envData.summary.total_variables} configured
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Required Variables</div>
                <div className="text-2xl font-bold text-green-600">
                  {envData.summary.required_configured}/{envData.summary.required_variables}
                </div>
                <div className="text-xs text-gray-500">{envData.summary.required_percentage}% complete</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Missing Required</div>
                <div className="text-2xl font-bold text-red-600">{envData.missing_required.length}</div>
                <div className="text-xs text-gray-500">Need attention</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600">Categories</div>
                <div className="text-2xl font-bold text-purple-600">{Object.keys(envData.categories).length}</div>
                <div className="text-xs text-gray-500">Service groups</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missing Required Variables Alert */}
        {envData.missing_required.length > 0 && (
          <>
            <Alert variant="destructive" className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Missing required environment variables:</AlertDescription>
            </Alert>
            <div className="space-y-2 -mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              {envData.missing_required.map((env, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded border border-red-200"
                >
                  <div>
                    <div className="font-medium text-red-800">{env.name}</div>
                    <div className="text-sm text-red-600">{env.description}</div>
                  </div>
                  <Badge variant="outline" className="text-red-700 border-red-300">
                    {env.category}
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Recommendations */}
        {envData.recommendations.length > 0 && (
          <>
            <Alert className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Configuration recommendations:</AlertDescription>
            </Alert>
            <div className="space-y-2 -mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              {envData.recommendations.map((rec, index) => (
                <div key={index} className="text-sm text-blue-800">
                  • {rec}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Environment Variables by Category */}
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList>
            <TabsTrigger value="categories">By Category</TabsTrigger>
            <TabsTrigger value="all">All Variables</TabsTrigger>
            <TabsTrigger value="missing">Missing Only</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            {Object.entries(envData.categories).map(([category, data]) => (
              <Card key={category} className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category)}
                      {category}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {data.configured}/{data.total} configured
                      </Badge>
                      <Badge variant="secondary">
                        {data.required_configured}/{data.required} required
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>Configuration status for {category.toLowerCase()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.variables.map((variable) => (
                      <div
                        key={variable.name}
                        className={`p-4 rounded-lg border ${
                          variable.value
                            ? "bg-green-50 border-green-200"
                            : variable.required
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {variable.value ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <div>
                              <div className="font-medium">{variable.name}</div>
                              <div className="text-sm text-gray-600">{variable.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {variable.required && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                            <Badge
                              className={variable.value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                            >
                              {variable.value ? "Set" : "Missing"}
                            </Badge>
                          </div>
                        </div>
                        {variable.value && (
                          <div className="mt-2 p-2 bg-white/50 rounded border">
                            <div className="text-xs font-medium text-gray-600 mb-1">Current Value:</div>
                            <div className="font-mono text-sm">{maskValue(variable.value)}</div>
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
                <CardTitle>All Environment Variables</CardTitle>
                <CardDescription>Complete list of all environment variables</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.values(envData.categories)
                    .flatMap((cat) => cat.variables)
                    .map((variable) => (
                      <div
                        key={variable.name}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          variable.value
                            ? "bg-green-50 border-green-200"
                            : variable.required
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {variable.value ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">{variable.name}</div>
                            <div className="text-sm text-gray-600">{variable.category}</div>
                            <div className="text-xs text-gray-500">{variable.description}</div>
                            {variable.value && (
                              <div className="text-xs font-mono mt-1">{maskValue(variable.value)}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {variable.required && (
                            <Badge variant="outline" className="text-xs">
                              Required
                            </Badge>
                          )}
                          <Badge className={variable.value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {variable.value ? "Set" : "Missing"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missing" className="space-y-4">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Missing Variables</CardTitle>
                <CardDescription>Environment variables that need to be configured</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.values(envData.categories)
                    .flatMap((cat) => cat.variables)
                    .filter((variable) => !variable.value)
                    .map((variable) => (
                      <div
                        key={variable.name}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          variable.required ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <div>
                            <div className="font-medium">{variable.name}</div>
                            <div className="text-sm text-gray-600">{variable.category}</div>
                            <div className="text-xs text-gray-500">{variable.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {variable.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                          <Badge variant="secondary">Missing</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Template Download */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Environment Template</CardTitle>
            <CardDescription>Download or copy the complete .env.local template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={downloadTemplate} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download .env.local
              </Button>
              <Button
                variant="outline"
                onClick={copyTemplate}
                className="flex items-center gap-2 min-w-[140px] bg-transparent"
              >
                <Copy className="h-4 w-4" />
                <span className="inline-block w-[120px]">{copiedTemplate ? "Copied!" : "Copy to Clipboard"}</span>
              </Button>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="text-xs font-medium text-gray-600 mb-2">Template Preview:</div>
              <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {envData.env_template.split("\n").slice(0, 10).join("\n")}
                {envData.env_template.split("\n").length > 10 && "\n... (truncated)"}
              </pre>
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
                <Link href="/api-status">
                  <Server className="h-4 w-4 mr-2" />
                  Check API Status
                </Link>
              </Button>
              <Button variant="outline" onClick={fetchEnvironmentData}>
                Refresh Configuration
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
