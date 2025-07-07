"use client"

import { useSupabase } from "@/components/supabase-provider"
import { useAuthReal } from "@/hooks/use-auth-real"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function TestSession() {
  const supabaseContext = useSupabase()
  const authRealHook = useAuthReal()

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Authentication State Test</h1>
        <p className="text-muted-foreground mt-2">Testing consistency between SupabaseProvider and useAuthReal hook</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* SupabaseProvider Context */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              SupabaseProvider Context
              <Badge variant={supabaseContext.loading ? "secondary" : supabaseContext.user ? "default" : "outline"}>
                {supabaseContext.loading ? "Loading" : supabaseContext.user ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </CardTitle>
            <CardDescription>State from useSupabase() hook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Loading:</strong> {supabaseContext.loading ? "true" : "false"}
            </div>
            <div>
              <strong>User ID:</strong> {supabaseContext.user?.id || "null"}
            </div>
            <div>
              <strong>Email:</strong> {supabaseContext.user?.email || "null"}
            </div>
            <div>
              <strong>Session:</strong> {supabaseContext.session ? "exists" : "null"}
            </div>
            {supabaseContext.user && (
              <div>
                <strong>User Metadata:</strong>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(supabaseContext.user.user_metadata, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* useAuthReal Hook */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              useAuthReal Hook
              <Badge variant={authRealHook.loading ? "secondary" : authRealHook.user ? "default" : "outline"}>
                {authRealHook.loading ? "Loading" : authRealHook.user ? "Authenticated" : "Not Authenticated"}
              </Badge>
            </CardTitle>
            <CardDescription>State from useAuthReal() hook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Loading:</strong> {authRealHook.loading ? "true" : "false"}
            </div>
            <div>
              <strong>User ID:</strong> {authRealHook.user?.id || "null"}
            </div>
            <div>
              <strong>Email:</strong> {authRealHook.user?.email || "null"}
            </div>
            <div>
              <strong>Session:</strong> {authRealHook.session ? "exists" : "null"}
            </div>
            <div>
              <strong>Is Authenticated:</strong> {authRealHook.isAuthenticated ? "true" : "false"}
            </div>
            {authRealHook.user && (
              <div>
                <strong>User Metadata:</strong>
                <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(authRealHook.user.user_metadata, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Consistency Check */}
      <Card>
        <CardHeader>
          <CardTitle>Consistency Check</CardTitle>
          <CardDescription>Verifying both contexts are synchronized</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Loading Match:</strong>
              <Badge variant={supabaseContext.loading === authRealHook.loading ? "default" : "destructive"}>
                {supabaseContext.loading === authRealHook.loading ? "✓" : "✗"}
              </Badge>
            </div>
            <div>
              <strong>User ID Match:</strong>
              <Badge variant={supabaseContext.user?.id === authRealHook.user?.id ? "default" : "destructive"}>
                {supabaseContext.user?.id === authRealHook.user?.id ? "✓" : "✗"}
              </Badge>
            </div>
            <div>
              <strong>Email Match:</strong>
              <Badge variant={supabaseContext.user?.email === authRealHook.user?.email ? "default" : "destructive"}>
                {supabaseContext.user?.email === authRealHook.user?.email ? "✓" : "✗"}
              </Badge>
            </div>
            <div>
              <strong>Session Match:</strong>
              <Badge
                variant={
                  supabaseContext.session?.access_token === authRealHook.session?.access_token
                    ? "default"
                    : "destructive"
                }
              >
                {supabaseContext.session?.access_token === authRealHook.session?.access_token ? "✓" : "✗"}
              </Badge>
            </div>
          </div>

          {authRealHook.isAuthenticated && (
            <div className="pt-4">
              <Button onClick={() => authRealHook.signOut()} variant="outline">
                Test Sign Out
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>Raw state for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <strong>SupabaseProvider Raw:</strong>
              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-40">
                {JSON.stringify(
                  {
                    loading: supabaseContext.loading,
                    hasUser: !!supabaseContext.user,
                    hasSession: !!supabaseContext.session,
                    userId: supabaseContext.user?.id,
                    email: supabaseContext.user?.email,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
            <div>
              <strong>useAuthReal Raw:</strong>
              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto max-h-40">
                {JSON.stringify(
                  {
                    loading: authRealHook.loading,
                    hasUser: !!authRealHook.user,
                    hasSession: !!authRealHook.session,
                    isAuthenticated: authRealHook.isAuthenticated,
                    userId: authRealHook.user?.id,
                    email: authRealHook.user?.email,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
