"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthReal } from "@/hooks/use-auth-real"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Calculator, FileText, Crown, Zap, Lock } from "lucide-react"

export default function FreeDashboardPage() {
  const { user, profile, loading, isPro, isIONEmployee, signOut } = useAuthReal()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (isPro || isIONEmployee) {
        router.push("/dashboard/pro")
        return
      }
    }
  }, [user, loading, isPro, isIONEmployee, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user || isPro || isIONEmployee) {
    return null // Will redirect via useEffect
  }

  const reportsUsed = profile?.reports_used || 0
  const maxReports = profile?.max_reports || 3
  const reportsRemaining = Math.max(0, maxReports - reportsUsed)
  const usagePercentage = (reportsUsed / maxReports) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Free Dashboard
              <Badge className="ml-2 bg-blue-500">Free Plan</Badge>
            </h1>
            <p className="text-gray-600">
              Welcome back, {profile?.full_name || user.email}! You have {reportsRemaining} reports remaining.
            </p>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Usage Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Report Usage
            </CardTitle>
            <CardDescription>Track your monthly report usage and upgrade when needed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Reports Used</span>
                <span className="text-sm text-gray-600">
                  {reportsUsed} / {maxReports}
                </span>
              </div>
              <Progress value={usagePercentage} className="w-full" />
              {reportsRemaining <= 1 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 text-sm">
                    ⚠️ You're running low on reports! Upgrade to Pro for unlimited access.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Prompt */}
        <Card className="mb-8 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Crown className="h-5 w-5 text-yellow-600" />
              Upgrade to Pro
            </CardTitle>
            <CardDescription className="text-orange-700">
              Unlock unlimited reports, advanced features, and priority support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-800">Pro Features:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Unlimited solar reports</li>
                  <li>• Advanced utility detection</li>
                  <li>• Client management system</li>
                  <li>• Priority customer support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-800">Advanced Tools:</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Detailed financial analysis</li>
                  <li>• Custom branding options</li>
                  <li>• Bulk report generation</li>
                  <li>• API access</li>
                </ul>
              </div>
            </div>
            <Button onClick={() => router.push("/pricing")} className="w-full bg-orange-600 hover:bg-orange-700">
              Upgrade to Pro - $29/month
            </Button>
          </CardContent>
        </Card>

        {/* Available Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/calculator")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Basic Solar Calculator
              </CardTitle>
              <CardDescription>
                Generate basic solar calculations and estimates for residential properties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={reportsRemaining === 0}>
                {reportsRemaining === 0 ? "No Reports Left" : "Start Calculation"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/reports")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                My Reports
              </CardTitle>
              <CardDescription>View and download your previously generated solar reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-400" />
                Pro Calculator
                <Badge variant="secondary">Pro Only</Badge>
              </CardTitle>
              <CardDescription>
                Advanced calculations with utility detection and detailed analysis. Upgrade to unlock.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline" disabled>
                Upgrade Required
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-400" />
                Client Management
                <Badge variant="secondary">Pro Only</Badge>
              </CardTitle>
              <CardDescription>
                Organize clients and track their solar projects. Available with Pro subscription.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline" disabled>
                Upgrade Required
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-400" />
                Visual Analysis
                <Badge variant="secondary">Pro Only</Badge>
              </CardTitle>
              <CardDescription>
                Advanced roof analysis with satellite imagery. Upgrade to access this feature.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline" disabled>
                Upgrade Required
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/pricing")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Upgrade Account
              </CardTitle>
              <CardDescription>View pricing plans and upgrade your account for unlimited access.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                View Pricing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
