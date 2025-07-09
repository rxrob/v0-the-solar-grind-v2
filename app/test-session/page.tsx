"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuthReal } from "@/hooks/use-auth-real"
import { CheckCircle, XCircle, User, Mail, Clock, Database, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

export default function TestSessionPage() {
  const authContext = useAuthReal()
  const [refreshCount, setRefreshCount] = useState(0)

  // Auto-refresh every 2 seconds to show real-time state
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshCount((prev) => prev + 1)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Authentication Context Test</h1>
          <p className="text-muted-foreground">Real-time verification of the useAuthReal hook</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Auto-refreshing every 2s (refresh #{refreshCount})</span>
          </div>
        </div>

        {/* Context Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>useAuthReal Context</span>
            </CardTitle>
            <CardDescription>Live data from the primary authentication hook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded border">
                <span className="font-medium">Is Authenticated:</span>
                {authContext.isAuthenticated ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    True
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    False
                  </Badge>
                )}
              </div>

              {authContext.user && (
                <div className="p-3 rounded border bg-muted/50 space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Email:</span>
                    <span>{authContext.user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Database className="h-4 w-4" />
                    <span className="font-medium">User ID:</span>
                    <span className="font-mono text-xs">{authContext.user.id}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-2 rounded border">
                <span className="font-medium">Session:</span>
                {authContext.session ? (
                  <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>

              <div className="flex items-center justify-between p-2 rounded border">
                <span className="font-medium">Loading State:</span>
                {authContext.loading ? (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    Loading
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">Ready</Badge>
                )}
              </div>

              {authContext.error && (
                <div className="p-3 rounded border bg-red-50 text-red-700">
                  <span className="font-medium">Error:</span> {authContext.error}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test Actions</CardTitle>
            <CardDescription>Test functions and verify state changes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {authContext.isAuthenticated ? (
              <Button onClick={authContext.signOut} variant="destructive">
                Sign Out
              </Button>
            ) : (
              <>
                <Button asChild>
                  <a href="/login">Go to Login</a>
                </Button>
                <Button asChild variant="secondary">
                  <a href="/signup">Go to Signup</a>
                </Button>
              </>
            )}
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Page Reload
            </Button>
          </CardContent>
        </Card>

        {/* Detailed Context Data */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Context Data</CardTitle>
            <CardDescription>Full JSON object for debugging</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96 border">
              {JSON.stringify(authContext, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
