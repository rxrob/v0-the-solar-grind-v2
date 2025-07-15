"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-browser"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Zap, ArrowRight, Crown } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      setUser(session.user)

      // Check the user's profile for pro status
      const { data: profileData } = await supabase
        .from("users")
        .select("subscription_status")
        .eq("id", session.user.id)
        .single()

      setProfile(profileData)
      setLoading(false)

      // If the user is a pro member, redirect them to the pro dashboard
      if (profileData?.subscription_status === "active" || profileData?.subscription_status === "trialing") {
        router.push("/dashboard/pro")
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Sun className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome, {user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/pricing">
                <Button>
                  <Crown className="mr-2 h-4 w-4" /> Upgrade to Pro
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Free Solar Calculator</CardTitle>
              <CardDescription>Get a quick estimate of your solar potential.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Our basic calculator provides a simple way to understand the potential savings and system size for your
                home.
              </p>
              <Link href="/basic-calculator">
                <Button>
                  Try the Calculator <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle>Unlock Pro Features</CardTitle>
              <CardDescription className="text-purple-200">Take your solar analysis to the next level.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center">
                  <Zap className="h-4 w-4 mr-2" /> Advanced financial modeling
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 mr-2" /> Detailed PDF reports
                </li>
                <li className="flex items-center">
                  <Zap className="h-4 w-4 mr-2" /> Client and project management
                </li>
              </ul>
              <Link href="/pricing">
                <Button variant="secondary">
                  View Pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
