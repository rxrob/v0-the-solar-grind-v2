import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sun, Zap, ArrowRight, Crown } from "lucide-react"
import Link from "next/link"
import type { CookieOptions } from "@supabase/ssr"

export default async function DashboardPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // This is handled by middleware, but serves as a robust fallback.
    redirect("/login")
  }

  // Check the user's profile for pro status from the 'users' table
  const { data: profile } = await supabase.from("users").select("subscription_status").eq("id", user.id).single()

  // If the user is a pro member, redirect them to the pro dashboard.
  if (profile?.subscription_status === "active" || profile?.subscription_status === "trialing") {
    redirect("/dashboard/pro")
  }

  // Otherwise, render the standard user dashboard.
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
