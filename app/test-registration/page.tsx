"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { signUpReal } from "@/app/actions/auth-real"

interface TestResult {
  success: boolean
  message: string
  details?: any
  error?: string
  timestamp: string
}

export default function TestRegistrationPage() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("testpassword123")
  const [fullName, setFullName] = useState("Test User")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    config?: TestResult
    connection?: TestResult
    registration?: TestResult
  }>({})

  const testConfiguration = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/debug-supabase-config")
      const result = await response.json()

      setResults((prev) => ({
        ...prev,
        config: {
          ...result,
          timestamp: new Date().toISOString(),
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        config: {
          success: false,
          message: "Failed to test configuration",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      }))
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-supabase-connection")
      const result = await response.json()

      setResults((prev) => ({
        ...prev,
        connection: {
          ...result,
          timestamp: new Date().toISOString(),
        },
      }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        connection: {
          success: false,
          message: "Failed to test connection",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      }))
    } finally {
      setLoading(false)
    }
  }

  const testRegistration = async () => {
    if (!email || !password) {
      alert("Please enter email and password")
      return
    }

    setLoading(true)
    try {
      console.log("🧪 Testing registration with:", { email, fullName })

      const result = await signUpReal(email, password, fullName)

      console.log("📊 Registration result:", result)

      setResults((prev) => ({
        ...prev,
        registration: {
          ...result,
          timestamp: new Date().toISOString(),
        },
      }))
    } catch (error) {
      console.error("❌ Registration test error:", error)
      setResults((prev) => ({
        ...prev,
        registration: {
          success: false,
          message: "Registration test failed",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      }))
    } finally {
      setLoading(false)
    }
  }

  const clearResults = () => {
    setResults({})
  }

  const ResultCard = ({ title, result }: { title: string; result?: TestResult }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {result && (
            <Badge variant={result.success ? "default" : "destructive"}>{result.success ? "✅ Pass" : "❌ Fail"}</Badge>
          )}
        </CardTitle>
        {result && (
          <CardDescription>
            {result.timestamp && `Tested at: ${new Date(result.timestamp).toLocaleString()}`}
          </CardDescription>
        )}
      </CardHeader>
      {result && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Message:</Label>
              <p className={result.success ? "text-green-600" : "text-red-600"}>{result.message}</p>
            </div>

            {result.error && (
              <div>
                <Label className="font-semibold text-red-600">Error:</Label>
                <Textarea value={result.error} readOnly className="mt-1 font-mono text-sm" rows={3} />
              </div>
            )}

            {result.details && (
              <div>
                <Label className="font-semibold">Details:</Label>
                <Textarea
                  value={JSON.stringify(result.details, null, 2)}
                  readOnly
                  className="mt-1 font-mono text-sm"
                  rows={8}
                />
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Supabase Registration Test Suite</h1>
        <p className="text-muted-foreground">
          This page helps debug Supabase authentication issues by testing configuration, connectivity, and registration
          flow step by step.
        </p>
      </div>

      {/* Test Controls */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Test Controls</CardTitle>
          <CardDescription>Run tests in order: Configuration → Connection → Registration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Button onClick={testConfiguration} disabled={loading} variant="outline">
              {loading ? "Testing..." : "1. Test Configuration"}
            </Button>
            <Button onClick={testConnection} disabled={loading} variant="outline">
              {loading ? "Testing..." : "2. Test Connection"}
            </Button>
            <Button onClick={testRegistration} disabled={loading} variant="outline">
              {loading ? "Testing..." : "3. Test Registration"}
            </Button>
            <Button onClick={clearResults} disabled={loading} variant="secondary">
              Clear Results
            </Button>
          </div>

          <Separator className="my-6" />

          {/* Registration Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Registration Test Data</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="testpassword123"
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Test User"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Test Results</h2>

        <ResultCard title="1. Configuration Test" result={results.config} />
        <ResultCard title="2. Connection Test" result={results.connection} />
        <ResultCard title="3. Registration Test" result={results.registration} />
      </div>

      {/* Help Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <Alert>
              <AlertDescription>
                <strong>Important:</strong> Run tests in order. Each test builds on the previous one to help identify
                the exact source of any issues.
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-semibold">Configuration Test Failures:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Check that NEXT_PUBLIC_SUPABASE_URL is set correctly</li>
                <li>Verify SUPABASE_SERVICE_ROLE_KEY is the service role key, not anon key</li>
                <li>Ensure your Supabase project is active and not paused</li>
                <li>Verify URL format: https://your-project.supabase.co</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Connection Test Failures:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Check your internet connection</li>
                <li>Verify the Supabase URL format (should end with .supabase.co)</li>
                <li>Check if your Supabase project exists and is accessible</li>
                <li>Verify API keys are not expired or revoked</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Registration Test Failures:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Check if email confirmations are required in Supabase Auth settings</li>
                <li>Verify your auth policies allow user registration</li>
                <li>Check if the email domain is allowed in your Supabase settings</li>
                <li>Ensure password meets minimum requirements</li>
                <li>Check for duplicate email addresses</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Common JSON Parsing Errors:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Wrong Supabase URL (returns HTML error page instead of JSON)</li>
                <li>Invalid API key (returns authentication error page)</li>
                <li>Project paused or deleted (returns Supabase error page)</li>
                <li>Network issues (returns ISP or proxy error pages)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
