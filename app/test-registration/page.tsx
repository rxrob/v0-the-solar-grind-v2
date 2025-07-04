"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Loader2, User, Wifi, AlertTriangle, Settings, Bug } from "lucide-react"
import { signUpReal } from "@/app/actions/auth-real"

export default function TestRegistrationPage() {
  const [debugResults, setDebugResults] = useState<any>(null)
  const [debugLoading, setDebugLoading] = useState(false)
  const [registrationResult, setRegistrationResult] = useState<any>(null)
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [connectionTest, setConnectionTest] = useState<any>(null)
  const [connectionLoading, setConnectionLoading] = useState(false)

  const runDebugTest = async () => {
    setDebugLoading(true)
    try {
      const response = await fetch("/api/debug-supabase-config")
      const data = await response.json()
      setDebugResults(data)
    } catch (error) {
      setDebugResults({
        success: false,
        error: "Failed to run debug test",
        message: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setDebugLoading(false)
    }
  }

  const testSupabaseConnection = async () => {
    setConnectionLoading(true)
    try {
      const response = await fetch("/api/test-supabase-connection")
      const data = await response.json()
      setConnectionTest(data)
    } catch (error) {
      setConnectionTest({
        success: false,
        error: "Failed to test connection",
        details: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setConnectionLoading(false)
    }
  }

  const testRegistration = async (formData: FormData) => {
    setRegistrationLoading(true)
    try {
      const result = await signUpReal(formData)
      setRegistrationResult(result)
    } catch (error) {
      setRegistrationResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setRegistrationLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Supabase Integration Debug</h1>
          <div className="text-lg text-gray-600">Debug and test Supabase configuration and user registration</div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Debug Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Debug Config
              </CardTitle>
              <CardDescription>Debug Supabase environment and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={runDebugTest} disabled={debugLoading} className="w-full">
                {debugLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Debugging...
                  </>
                ) : (
                  "Debug Configuration"
                )}
              </Button>

              {debugResults && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {debugResults.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {debugResults.success ? "Configuration OK" : "Configuration Issues"}
                    </span>
                  </div>

                  {debugResults.envCheck && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Environment Variables:</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Has URL:</span>
                          <Badge variant={debugResults.envCheck.hasUrl ? "default" : "destructive"}>
                            {debugResults.envCheck.hasUrl ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Has Key:</span>
                          <Badge variant={debugResults.envCheck.hasKey ? "default" : "destructive"}>
                            {debugResults.envCheck.hasKey ? "Yes" : "No"}
                          </Badge>
                        </div>
                        {debugResults.envCheck.hasUrl && (
                          <div className="text-xs text-gray-600">URL: {debugResults.envCheck.urlPrefix}...</div>
                        )}
                        {debugResults.envCheck.hasKey && (
                          <div className="text-xs text-gray-600">Key: {debugResults.envCheck.keyPrefix}...</div>
                        )}
                      </div>
                    </div>
                  )}

                  {debugResults.formatCheck && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Format Validation:</div>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>URL Format:</span>
                          <Badge variant={debugResults.formatCheck.urlFormat ? "default" : "destructive"}>
                            {debugResults.formatCheck.urlFormat ? "Valid" : "Invalid"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Key Format:</span>
                          <Badge variant={debugResults.formatCheck.keyFormat ? "default" : "destructive"}>
                            {debugResults.formatCheck.keyFormat ? "Valid" : "Invalid"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {debugResults.tests && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Connectivity Tests:</div>
                      {debugResults.tests.map((test: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="flex justify-between items-center">
                            <span>{test.name}</span>
                            <Badge variant={test.status === "pass" ? "default" : "destructive"}>{test.status}</Badge>
                          </div>
                          <div className="text-gray-600 mt-1">{test.details}</div>
                          {test.responsePreview && (
                            <div className="text-gray-500 mt-1 font-mono">Response: {test.responsePreview}...</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {debugResults.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="text-sm text-red-700 font-medium">{debugResults.error}</div>
                      {debugResults.suggestion && (
                        <div className="text-xs text-red-600 mt-2">{debugResults.suggestion}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Connection Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Connection Test
              </CardTitle>
              <CardDescription>Test Supabase API endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testSupabaseConnection} disabled={connectionLoading} className="w-full">
                {connectionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>

              {connectionTest && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {connectionTest.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {connectionTest.success ? "Connection OK" : "Connection Failed"}
                    </span>
                  </div>

                  {connectionTest.details && (
                    <div className="space-y-2">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>REST API:</span>
                          <Badge variant={connectionTest.details.restApiWorking ? "default" : "destructive"}>
                            {connectionTest.details.restApiWorking ? "OK" : "Failed"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Auth API:</span>
                          <Badge variant={connectionTest.details.authApiWorking ? "default" : "destructive"}>
                            {connectionTest.details.authApiWorking ? "OK" : "Failed"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Signup Test:</span>
                          <Badge variant={connectionTest.details.signupTestWorking ? "default" : "destructive"}>
                            {connectionTest.details.signupTestWorking ? "OK" : "Failed"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {connectionTest.details?.responses && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">API Responses:</div>
                      {connectionTest.details.responses.restApi && (
                        <div className="p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium">REST API:</div>
                          <div className="font-mono text-gray-600">{connectionTest.details.responses.restApi}</div>
                        </div>
                      )}
                      {connectionTest.details.responses.authApi && (
                        <div className="p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium">Auth API:</div>
                          <div className="font-mono text-gray-600">{connectionTest.details.responses.authApi}</div>
                        </div>
                      )}
                      {connectionTest.details.responses.signupTest && (
                        <div className="p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium">Signup Test:</div>
                          <div className="font-mono text-gray-600">{connectionTest.details.responses.signupTest}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {connectionTest.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded">
                      <div className="text-sm text-red-700 font-medium">{connectionTest.error}</div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registration Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Registration Test
              </CardTitle>
              <CardDescription>Test user signup with raw fetch</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={testRegistration} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" placeholder="Test User" defaultValue="Test User" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="test@example.com"
                    defaultValue={`test-${Date.now()}@example.com`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Test123!" defaultValue="Test123!" />
                </div>
                <Button type="submit" disabled={registrationLoading} className="w-full">
                  {registrationLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Test Registration"
                  )}
                </Button>
              </form>

              {registrationResult && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    {registrationResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="font-medium">
                      {registrationResult.success ? "Registration Successful" : "Registration Failed"}
                    </span>
                  </div>

                  {registrationResult.warning && (
                    <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700">{registrationResult.warning}</span>
                    </div>
                  )}

                  <div className="p-3 bg-gray-50 border rounded">
                    <div className="text-sm">{registrationResult.message || registrationResult.error}</div>
                    {registrationResult.details && (
                      <div className="text-xs text-gray-600 mt-1">{registrationResult.details}</div>
                    )}
                    {registrationResult.suggestion && (
                      <div className="text-xs text-blue-600 mt-2 font-medium">{registrationResult.suggestion}</div>
                    )}
                  </div>

                  {registrationResult.rawResponse && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded">
                      <div className="text-xs text-red-600 font-medium">Raw Response:</div>
                      <div className="text-xs text-red-600 font-mono mt-1">{registrationResult.rawResponse}</div>
                    </div>
                  )}

                  {registrationResult.user && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="text-sm text-green-700">
                        User created: {registrationResult.user.email} (ID: {registrationResult.user.id?.substring(0, 8)}
                        ...)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Debug Instructions
            </CardTitle>
            <CardDescription>Follow these steps to debug your Supabase configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">1. Run Debug Configuration First</h4>
              <div className="text-sm text-gray-600">
                This will check your environment variables and basic connectivity
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Check Connection Test</h4>
              <div className="text-sm text-gray-600">
                This tests the actual API endpoints and shows you what responses you're getting
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Test Registration</h4>
              <div className="text-sm text-gray-600">
                This uses raw fetch requests to bypass the Supabase client and show exactly what's happening
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Common Issues:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>• Wrong Supabase URL (should be https://your-project.supabase.co)</div>
                <div>• Wrong API key (should start with eyJ)</div>
                <div>• Project doesn't exist or is paused</div>
                <div>• Network/firewall issues</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
