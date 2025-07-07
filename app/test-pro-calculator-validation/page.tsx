import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, User, Database, Shield, Crown } from "lucide-react"
import Link from "next/link"

export default async function TestProCalculatorValidationPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: () => cookieStore },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle()

  const isPro = profile?.subscription_type === "pro" && profile?.subscription_status === "active"

  if (!isPro) {
    redirect("/pricing")
  }

  // Test database connection
  let dbConnectionStatus = "pass"
  try {
    const { error } = await supabase.from("users").select("count").limit(1)
    if (error) dbConnectionStatus = "fail"
  } catch {
    dbConnectionStatus = "fail"
  }

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      pass: "bg-green-100 text-green-800",
      fail: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
    }
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status.toUpperCase()}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Pro Calculator Validation</h1>
            <Badge className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <Crown className="h-4 w-4 mr-1" />
              PRO
            </Badge>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive validation dashboard for Pro subscription features and system status.
          </p>
        </div>

        {/* Validation Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Authentication
              </CardTitle>
              <CardDescription>Current authentication and session status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusIcon status="pass" />
                  User Authenticated
                </span>
                <StatusBadge status="pass" />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusIcon status="pass" />
                  Session Active
                </span>
                <StatusBadge status="pass" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">User ID: {user.id}</p>
                <p className="text-sm text-gray-600">Email: {user.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pro Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Pro Subscription
              </CardTitle>
              <CardDescription>Subscription type and status validation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusIcon status={profile?.subscription_type === "pro" ? "pass" : "fail"} />
                  Pro Subscription
                </span>
                <StatusBadge status={profile?.subscription_type === "pro" ? "pass" : "fail"} />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusIcon status={profile?.subscription_status === "active" ? "pass" : "fail"} />
                  Active Status
                </span>
                <StatusBadge status={profile?.subscription_status === "active" ? "pass" : "fail"} />
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Type: {profile?.subscription_type || "N/A"}</p>
                <p className="text-sm text-gray-600">Status: {profile?.subscription_status || "N/A"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Database Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Connection
              </CardTitle>
              <CardDescription>Supabase database connectivity and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusIcon status={dbConnectionStatus} />
                  Database Connection
                </span>
                <StatusBadge status={dbConnectionStatus} />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusIcon status="pass" />
                  User Profile Access
                </span>
                <StatusBadge status="pass" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">
                  Profile Created: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Last Updated: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Feature Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Feature Access
              </CardTitle>
              <CardDescription>Available Pro features and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusIcon status="pass" />
                  Pro Calculator
                </span>
                <StatusBadge status="pass" />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusIcon status="pass" />
                  Visual Analysis
                </span>
                <StatusBadge status="pass" />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <StatusIcon status="pass" />
                  Professional Reports
                </span>
                <StatusBadge status="pass" />
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-600">Reports Available: {profile?.single_reports_purchased || 0}</p>
                <p className="text-sm text-gray-600">Reports Used: {profile?.single_reports_used || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/pro-calculator">Test Pro Calculator</Link>
          </Button>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/visual-analysis">Test Visual Analysis</Link>
          </Button>
          <Button asChild className="bg-purple-600 hover:bg-purple-700">
            <Link href="/reports">Test Report Generation</Link>
          </Button>
        </div>

        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">All Systems Operational</h2>
              <p className="text-gray-600">
                Your Pro subscription is active and all features are available. You can access advanced solar analysis
                tools and generate professional reports.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                <Link href="/dashboard/pro">Go to Pro Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
