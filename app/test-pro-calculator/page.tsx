import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Calculator, Zap, FileText, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default async function TestProCalculatorPage() {
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

  const { data: profile } = await supabase
    .from("users")
    .select("subscription_type, subscription_status")
    .eq("id", user.id)
    .maybeSingle()

  const isPro = profile?.subscription_type === "pro" && profile?.subscription_status === "active"

  if (!isPro) {
    redirect("/pricing")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">Pro Calculator Suite</h1>
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">PRO ACCESS</Badge>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced solar analysis tools powered by AI and satellite data for professional-grade results.
          </p>
        </div>

        {/* Pro Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Smart Analysis */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                Smart Solar Analysis
              </CardTitle>
              <CardDescription>AI-powered comprehensive analysis with multiple data sources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Satellite imagery analysis
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Shading analysis
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Weather pattern integration
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Custom equipment recommendations
                </li>
              </ul>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/pro-calculator">
                  <Calculator className="h-4 w-4 mr-2" />
                  Launch Calculator
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Visual Analysis */}
          <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-green-600" />
                Visual Roof Analysis
              </CardTitle>
              <CardDescription>3D roof modeling and panel placement optimization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  3D roof reconstruction
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Optimal panel placement
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Obstruction detection
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Production heatmaps
                </li>
              </ul>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/visual-analysis">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Analysis
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Professional Reports */}
          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-purple-600" />
                Professional Reports
              </CardTitle>
              <CardDescription>Detailed PDF reports for clients and stakeholders</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Branded PDF reports
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Financial projections
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Environmental impact
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Equipment specifications
                </li>
              </ul>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/reports">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Pro Dashboard Access */}
        <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <TrendingUp className="h-12 w-12 mx-auto" />
              <h2 className="text-2xl font-bold">Pro Dashboard</h2>
              <p className="text-blue-100 max-w-2xl mx-auto">
                Access your complete project history, client management tools, and advanced analytics.
              </p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/dashboard/pro">View Pro Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Subscription</p>
                <Badge className="bg-green-100 text-green-800">Pro Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
