"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/supabase-browser"
import { Calculator, FileText, TrendingUp, Crown, Zap, Sun, BarChart3 } from "lucide-react"

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    subscription_type?: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user, error } = await getCurrentUser()

        // If there's an error and it's not the expected "session missing" error, log it.
        if (error && error.message !== "Auth session missing!") {
          console.error("Dashboard page error fetching user:", error.message)
        }

        if (!user) {
          router.push("/login")
          return
        }
        setUser(user)
      } catch (e) {
        // Catch any unexpected errors during the process
        console.error("An unexpected error occurred in fetchUser:", e)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    )
  }

  if (!user) {
    // This case is handled by the redirect, but as a fallback, return null
    // to prevent rendering the dashboard without a user.
    return null
  }

  const isPro = user.user_metadata?.subscription_type === "pro"

  return (
    <div className="container mx-auto py-8 px-4 text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Welcome back, {user.user_metadata?.full_name || "User"}! 👋
            </h1>
            <p className="text-gray-400 mt-2">Your AI-powered solar dashboard ⚡</p>
          </div>
          <div className="flex items-center space-x-2">
            {isPro ? (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 border-transparent text-white">
                <Crown className="h-4 w-4 mr-1" />
                Pro Member
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-700 border-gray-600 text-gray-300">
                Free Plan
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800/50 border-gray-700 hover:shadow-lg hover:shadow-orange-500/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Calculations</CardTitle>
            <Calculator className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-400">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:shadow-lg hover:shadow-orange-500/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-400">+3 this week</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:shadow-lg hover:shadow-orange-500/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Energy Saved</CardTitle>
            <Sun className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2k kWh</div>
            <p className="text-xs text-gray-400">Estimated monthly</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 hover:shadow-lg hover:shadow-orange-500/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Cost Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$180</div>
            <p className="text-xs text-gray-400">Per month average</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-100">
              <Calculator className="h-5 w-5 mr-2 text-orange-400" />
              Quick Calculate
            </CardTitle>
            <CardDescription className="text-gray-400">
              Start a new solar calculation with AI assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/calculator")}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                Start Basic Calculator
              </Button>
              {isPro && (
                <Button
                  onClick={() => router.push("/pro-calculator")}
                  variant="outline"
                  className="w-full border-orange-400 text-orange-300 hover:bg-orange-500/10 hover:text-orange-200"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Pro Calculator
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-100">
              <BarChart3 className="h-5 w-5 mr-2 text-orange-400" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-gray-400">Your latest solar calculations and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-200">Residential Calculation</p>
                  <p className="text-sm text-gray-400">2 hours ago</p>
                </div>
                <Badge variant="secondary" className="bg-gray-700 border-gray-600 text-gray-300">
                  Complete
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-200">Solar Report #1234</p>
                  <p className="text-sm text-gray-400">1 day ago</p>
                </div>
                <Badge variant="secondary" className="bg-gray-700 border-gray-600 text-gray-300">
                  Generated
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-200">Commercial Analysis</p>
                  <p className="text-sm text-gray-400">3 days ago</p>
                </div>
                <Badge variant="secondary" className="bg-gray-700 border-gray-600 text-gray-300">
                  Complete
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Prompt for Free Users */}
      {!isPro && (
        <Card className="mt-8 border-orange-500/30 bg-gradient-to-r from-gray-800 to-black/50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-400">
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Pro
            </CardTitle>
            <CardDescription className="text-gray-400">
              Unlock advanced features and unlimited calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-sm text-gray-300">• Unlimited calculations • Advanced reports • Priority support</p>
              <Button
                onClick={() => router.push("/pricing")}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shrink-0"
              >
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
