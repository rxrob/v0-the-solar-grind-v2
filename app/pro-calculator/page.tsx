"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SmartSolarAnalysis } from "@/components/smart-solar-analysis"
import { useAuthReal } from "@/hooks/use-auth-real"
import { Crown, Lock, Zap } from "lucide-react"
import Link from "next/link"

export default function ProCalculatorPage() {
  const { user, profile, loading, isPro } = useAuthReal()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Authentication Required
            </CardTitle>
            <CardDescription>Please sign in to access the Pro Calculator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>You need to be signed in to use the Pro Solar Calculator.</AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 bg-transparent">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isPro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Pro Features Required
            </CardTitle>
            <CardDescription>Upgrade to Pro to access advanced solar analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                The Pro Calculator includes advanced features like satellite imagery analysis, detailed financial
                projections, and environmental impact assessments.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Unlimited calculations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Satellite imagery analysis</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Advanced financial modeling</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-green-500" />
                <span>Environmental impact reports</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/pricing">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pro Solar Calculator</h1>
              <p className="text-gray-600 mt-2">Advanced solar analysis with AI-powered insights</p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Pro User
            </Badge>
          </div>
        </div>

        <SmartSolarAnalysis />
      </div>
    </div>
  )
}
