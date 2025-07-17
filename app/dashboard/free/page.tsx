"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getCurrentUser } from "@/lib/supabase-browser"
import { Calculator, FileText, Crown, Zap, Sun, Lock, Star, ArrowRight } from "lucide-react"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    subscription_type?: string
  }
}

export default function FreeDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) {
          router.push("/login")
          return
        }

        // Redirect pro users to pro dashboard
        if (user.user_metadata?.subscription_type === "pro") {
          router.push("/dashboard/pro")
          return
        }

        setUser(user)
      } catch (error) {
        console.error("Error fetching user:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Mock usage data for free tier
  const calculationsUsed = 3
  const calculationsLimit = 5
  const reportsUsed = 1
  const reportsLimit = 2

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Free Dashboard ⚡
            </h1>
            <p className="text-muted-foreground mt-2">Get started with basic solar calculations</p>
          </div>
          <Badge variant="secondary">Free Plan</Badge>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Calculator className="h-5 w-5 mr-2 text-orange-500" />
                Calculations
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {calculationsUsed}/{calculationsLimit}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={(calculationsUsed / calculationsLimit) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {calculationsLimit - calculationsUsed} calculations remaining this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-orange-500" />
                Reports
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {reportsUsed}/{reportsLimit}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={(reportsUsed / reportsLimit) * 100} className="h-2" />
              <p className="text-sm text-muted-foreground">{reportsLimit - reportsUsed} reports remaining this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2 text-orange-500" />
              Basic Calculator
            </CardTitle>
            <CardDescription>Calculate solar potential for residential properties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/calculator")}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                disabled={calculationsUsed >= calculationsLimit}
              >
                {calculationsUsed >= calculationsLimit ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Limit Reached
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Calculation
                  </>
                )}
              </Button>
              {calculationsUsed >= calculationsLimit && (
                <p className="text-sm text-orange-600 text-center">Upgrade to Pro for unlimited calculations</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-500" />
              Basic Reports
            </CardTitle>
            <CardDescription>Generate simple solar analysis reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/reports")}
                variant="outline"
                className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                disabled={reportsUsed >= reportsLimit}
              >
                {reportsUsed >= reportsLimit ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Limit Reached
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
              {reportsUsed >= reportsLimit && (
                <p className="text-sm text-orange-600 text-center">Upgrade to Pro for unlimited reports</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pro Features Preview */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-700">
            <Crown className="h-5 w-5 mr-2" />
            Unlock Pro Features
          </CardTitle>
          <CardDescription>See what you're missing with our professional tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Unlimited calculations</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Advanced AI optimization</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Professional reports</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Client management</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Priority support</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Commercial calculations</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-orange-700">Starting at $29/month</p>
              <p className="text-sm text-orange-600">Cancel anytime • 14-day free trial</p>
            </div>
            <Button
              onClick={() => router.push("/pricing")}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Upgrade Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sun className="h-5 w-5 mr-2 text-orange-500" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your latest calculations and reports</CardDescription>
        </CardHeader>
        <CardContent>
          {calculationsUsed > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">Residential Calculation</p>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                </div>
                <Badge variant="secondary">Complete</Badge>
              </div>
              {calculationsUsed > 1 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">Basic Solar Analysis</p>
                    <p className="text-sm text-muted-foreground">1 day ago</p>
                  </div>
                  <Badge variant="secondary">Complete</Badge>
                </div>
              )}
              {calculationsUsed > 2 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">Energy Estimate</p>
                    <p className="text-sm text-muted-foreground">3 days ago</p>
                  </div>
                  <Badge variant="secondary">Complete</Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sun className="h-12 w-12 text-orange-300 mx-auto mb-4" />
              <p className="text-muted-foreground">No calculations yet. Start your first solar analysis!</p>
              <Button
                onClick={() => router.push("/calculator")}
                className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                Get Started
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
