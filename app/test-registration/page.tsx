"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { signUpReal } from "@/app/actions/auth-real"

export default function TestRegistration() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("testpassword123")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [connectionTest, setConnectionTest] = useState<any>(null)

  const testRegistration = async () => {
    setLoading(true)
    setResult(null)

    try {
      console.log("🧪 Testing registration with:", { email, password: "***" })
      const response = await signUpReal(email, password)
      console.log("🧪 Registration response:", response)
      setResult(response)
    } catch (error) {
      console.error("🧪 Registration test error:", error)
      setResult({
        success: false,
        message: "Test failed with error",
        error: error.message,
        debug: error,
      })
    } finally {
      setLoading(false)
    }
  }

  const debugConfiguration = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-supabase-config")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      setDebugInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-supabase-connection")
      const data = await response.json()
      setConnectionTest(data)
    } catch (error) {
      setConnectionTest({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🧪 Registration Test Suite</CardTitle>
            <CardDescription>Test user registration and debug Supabase configuration issues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={debugConfiguration} disabled={loading} variant="outline">
                Debug Configuration
              </Button>
              <Button onClick={testConnection} disabled={loading} variant="outline">
                Test Connection
              </Button>
              <Button onClick={testRegistration} disabled={loading} variant="default">
                Test Registration
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            <Button onClick={testRegistration} disabled={loading || !email || !password} className="w-full">
              {loading ? "Testing..." : "Test Registration"}
            </Button>
          </CardContent>
        </Card>

        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔍 Configuration Debug
                <Badge variant={debugInfo.config?.hasUrl && debugInfo.config?.hasKey ? "default" : "destructive"}>
                  {debugInfo.config?.hasUrl && debugInfo.config?.hasKey ? "Config OK" : "Config Issues"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Supabase URL:</strong> {debugInfo.config?.hasUrl ? "✅" : "❌"}
                    <br />
                    <code className="text-xs bg-gray-100 p-1 rounded">{debugInfo.config?.urlPreview}</code>
                  </div>
                  <div>
                    <strong>API Key:</strong> {debugInfo.config?.hasKey ? "✅" : "❌"}
                    <br />
                    <code className="text-xs bg-gray-100 p-1 rounded">{debugInfo.config?.keyPreview}</code>
                  </div>
                </div>

                {debugInfo.connectivityTest && (
                  <div>
                    <strong>Connectivity Test:</strong>
                    <Badge variant={debugInfo.connectivityTest.success ? "default" : "destructive"} className="ml-2">
                      {debugInfo.connectivityTest.success ? "Success" : "Failed"}
                    </Badge>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(debugInfo.connectivityTest, null, 2)}
                    </pre>
                  </div>
                )}

                {debugInfo.authTest && (
                  <div>
                    <strong>Auth Test:</strong>
                    <Badge variant={debugInfo.authTest.success ? "default" : "destructive"} className="ml-2">
                      {debugInfo.authTest.success ? "Success" : "Failed"}
                    </Badge>
                    <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                      {JSON.stringify(debugInfo.authTest, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {connectionTest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔗 Connection Test Results
                <Badge variant={connectionTest.success ? "default" : "destructive"}>
                  {connectionTest.success ? "All Tests Passed" : "Some Tests Failed"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <strong>Summary:</strong> {connectionTest.summary?.successful}/{connectionTest.summary?.total} tests
                  passed
                </div>

                {connectionTest.tests?.map((test: any, index: number) => (
                  <div key={index} className="border rounded p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <strong>{test.name}</strong>
                      <Badge variant={test.success ? "default" : "destructive"}>{test.success ? "Pass" : "Fail"}</Badge>
                      {test.status && <Badge variant="outline">{test.status}</Badge>}
                    </div>
                    {test.url && <div className="text-xs text-gray-600 mb-1">URL: {test.url}</div>}
                    {test.responsePreview && (
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{test.responsePreview}</pre>
                    )}
                    {test.error && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded">Error: {test.error}</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📝 Registration Test Result
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Failed"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <AlertDescription>
                  <strong>Message:</strong> {result.message}
                  {result.error && (
                    <div className="mt-2">
                      <strong>Error Code:</strong> {result.error}
                    </div>
                  )}
                </AlertDescription>
              </Alert>

              {result.debug && (
                <div className="mt-4">
                  <strong>Debug Information:</strong>
                  <pre className="text-xs bg-gray-100 p-3 rounded mt-2 overflow-auto">
                    {JSON.stringify(result.debug, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>💡 Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              • <strong>Invalid JSON Response:</strong> Usually means wrong Supabase URL or the project doesn't exist
            </div>
            <div>
              • <strong>401 Unauthorized:</strong> Check your API key is correct and has the right permissions
            </div>
            <div>
              • <strong>404 Not Found:</strong> Verify your Supabase project URL is correct
            </div>
            <div>
              • <strong>CORS Errors:</strong> Make sure your domain is added to Supabase allowed origins
            </div>
            <div>
              • <strong>Connection Failed:</strong> Check if Supabase is accessible from your deployment environment
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
