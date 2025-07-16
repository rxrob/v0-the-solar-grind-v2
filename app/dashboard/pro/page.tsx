"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthReal } from "@/hooks/use-auth-real"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Calculator, FileText, Users, Settings, BarChart3, Zap } from "lucide-react"

export default function ProDashboardPage() {
  const { user, profile, loading, isPro, isIONEmployee, signOut } = useAuthReal()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }

      if (!isPro && !isIONEmployee) {
        router.push("/dashboard/free")
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

  if (!user || (!isPro && !isIONEmployee)) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Pro Dashboard
              {isIONEmployee && <Badge className="ml-2 bg-orange-500">ION Solar Team</Badge>}
            </h1>
            <p className="text-gray-600">
              Welcome back, {profile?.full_name || user.email}! You have unlimited access to all features.
            </p>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports Generated</p>
                  <p className="text-2xl font-bold text-gray-900">{profile?.reports_used || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Subscription</p>
                  <p className="text-2xl font-bold text-green-600">Pro</p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-2xl font-bold text-blue-600">Active</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Limit</p>
                  <p className="text-2xl font-bold text-purple-600">∞</p>
                </div>
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/pro-calculator")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Pro Solar Calculator
              </CardTitle>
              <CardDescription>
                Advanced solar calculations with detailed analysis, utility detection, and comprehensive reporting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Start Calculation</Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/dashboard/pro/reports")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Report Management
              </CardTitle>
              <CardDescription>
                View, download, and manage all your generated solar reports in one place.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/dashboard/pro/clients")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Client Management
              </CardTitle>
              <CardDescription>
                Manage your clients, track their projects, and organize your solar installations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Manage Clients
              </Button>
            </CardContent>
          </Card>

          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push("/visual-analysis")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                Visual Analysis
              </CardTitle>
              <CardDescription>
                Advanced roof analysis with satellite imagery and 3D modeling capabilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Analyze Property
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/billing")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Account Settings
              </CardTitle>
              <CardDescription>Manage your subscription, billing information, and account preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Manage Account
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/calculator")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Quick Calculator
              </CardTitle>
              <CardDescription>
                Fast solar calculations for quick estimates and preliminary assessments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-transparent" variant="outline">
                Quick Calc
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
