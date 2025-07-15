"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-browser"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Zap, ArrowRight, Crown, Loader2 } from "lucide-react"
import Link from "next/link"
import { AnimatedBG } from "@/components/AnimatedBG"

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  subscription_status: string
  subscription_type: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/login")
          return
        }

        setUser(session.user)

        // Try to get the user's profile
        const { data: profileData, error } = await supabase
          .from("users")
          .select("id, email, full_name, subscription_status, subscription_type")
          .eq("id", session.user.id)
          .maybeSingle()

        if (error) {
          console.error("Error fetching profile:", error)
        }

        // If no profile exists, create one via API
        if (!profileData) {
          console.log("No profile found, creating one...")
          try {
            const response = await fetch("/api/create-user-profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: session.user.id,
                email: session.user.email,
                fullName: session.user.user_metadata?.full_name || null,
              }),
            })

            if (response.ok) {
              const result = await response.json()
              if (result.data) {
                setProfile(result.data)
              } else {
                // Fallback profile if API creation succeeded but no data returned
                setProfile({
                  id: session.user.id,
                  email: session.user.email || "",
                  full_name: session.user.user_metadata?.full_name || null,
                  subscription_status: "active",
                  subscription_type: "free",
                })
              }
            } else {
              console.error("Failed to create user profile via API")
              // Set fallback profile
              setProfile({
                id: session.user.id,
                email: session.user.email || "",
                full_name: session.user.user_metadata?.full_name || null,
                subscription_status: "active",
                subscription_type: "free",
              })
            }
          } catch (apiError) {
            console.error("Error calling create-user-profile API:", apiError)
            // Set fallback profile
            setProfile({
              id: session.user.id,
              email: session.user.email || "",
              full_name: session.user.user_metadata?.full_name || null,
              subscription_status: "active",
              subscription_type: "free",
            })
          }
        } else {
          setProfile(profileData)
        }

        setLoading(false)

        // If the user is a pro member, redirect them to the pro dashboard
        if (
          profileData?.subscription_type === "pro" &&
          (profileData?.subscription_status === "active" || profileData?.subscription_status === "trialing")
        ) {
          router.push("/dashboard/pro")
        }
      } catch (error) {
        console.error("Error in getUser:", error)
        setLoading(false)
      }
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login")
      } else {
        setUser(session.user)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const getDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      // Extract name from email as fallback
      const emailName = user.email.split("@")[0]
      return emailName.charAt(0).toUpperCase() + emailName.slice(1)
    }
    return "Solar User"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <AnimatedBG />
        <div className="relative z-10 text-center">
          <Loader2 className="h-16 w-16 animate-spin text-yellow-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <AnimatedBG />

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-md border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <Sun className="h-10 w-10 text-yellow-400" />
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                      Welcome back, {getDisplayName()}!
                    </h1>
                    <p className="text-gray-400">Ready to harness the power of solar?</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-semibold">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-white/10 bg-transparent"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Solar Calculator Card */}
            <Card className="bg-black/40 backdrop-blur-md border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                    <Sun className="h-6 w-6 text-black" />
                  </div>
                  Free Solar Calculator
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Get a quick estimate of your solar potential and savings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Our basic calculator provides a simple way to understand the potential savings and system size for
                  your home. Perfect for getting started with solar planning.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Basic system sizing
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    Savings estimates
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    PDF reports
                  </div>
                </div>
                <Link href="/dashboard/free">
                  <Button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600 font-semibold group-hover:scale-105 transition-transform">
                    Start Calculating
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Features Card */}
            <Card className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-md border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  Unlock Pro Features
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Take your solar analysis to the next level with professional tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Get access to advanced calculations, detailed financial modeling, and professional-grade reports that
                  solar installers use every day.
                </p>
                <div className="space-y-2">
                  {[
                    "Advanced financial modeling",
                    "Detailed PDF reports",
                    "Client and project management",
                    "Unlimited calculations",
                    "Priority support",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-300">
                      <Zap className="h-4 w-4 mr-2 text-purple-400" />
                      {feature}
                    </div>
                  ))}
                </div>
                <Link href="/pricing">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 font-semibold group-hover:scale-105 transition-transform">
                    View Pricing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-black/40 backdrop-blur-md border border-gray-700 text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-yellow-400 mb-2">3</div>
                <p className="text-gray-400">Free Calculations Remaining</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-gray-700 text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-400 mb-2">0</div>
                <p className="text-gray-400">Projects Saved</p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-md border border-gray-700 text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-400 mb-2">Free</div>
                <p className="text-gray-400">Current Plan</p>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started Section */}
          <div className="mt-12">
            <Card className="bg-black/40 backdrop-blur-md border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Getting Started</CardTitle>
                <CardDescription className="text-gray-400">
                  New to solar? Here's how to make the most of your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-black font-bold">1</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Calculate</h3>
                    <p className="text-sm text-gray-400">
                      Use our free calculator to estimate your solar potential and savings.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-black font-bold">2</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Save & Share</h3>
                    <p className="text-sm text-gray-400">
                      Download PDF reports and save your calculations for future reference.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-black font-bold">3</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">Upgrade</h3>
                    <p className="text-sm text-gray-400">
                      Unlock advanced features with our Pro plan for detailed analysis.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
