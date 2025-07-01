"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calculator, Zap, Lock, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function FreeDashboardPage() {
  const usageData = {
    calculationsUsed: 3,
    calculationsLimit: 5,
    reportsGenerated: 1,
    reportsLimit: 2,
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Free Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your solar calculation dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculations Used</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData.calculationsUsed}/{usageData.calculationsLimit}
            </div>
            <Progress value={(usageData.calculationsUsed / usageData.calculationsLimit) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {usageData.calculationsLimit - usageData.calculationsUsed} calculations remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageData.reportsGenerated}/{usageData.reportsLimit}
            </div>
            <Progress value={(usageData.reportsGenerated / usageData.reportsLimit) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {usageData.reportsLimit - usageData.reportsGenerated} reports remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Type</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Free</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Limited features available</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Tools</CardTitle>
            <CardDescription>Tools available with your free account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Basic Calculator</h4>
                <p className="text-sm text-muted-foreground">Simple solar estimates</p>
              </div>
              <Button asChild size="sm">
                <Link href="/basic-calculator">Use Tool</Link>
              </Button>
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  Advanced Calculator
                  <Lock className="h-4 w-4" />
                </h4>
                <p className="text-sm text-muted-foreground">Detailed analysis with custom parameters</p>
              </div>
              <Button size="sm" disabled>
                Pro Only
              </Button>
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div>
                <h4 className="font-medium flex items-center gap-2">
                  Pro Calculator
                  <Lock className="h-4 w-4" />
                </h4>
                <p className="text-sm text-muted-foreground">Professional-grade calculations</p>
              </div>
              <Button size="sm" disabled>
                Pro Only
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade to Pro</CardTitle>
            <CardDescription>Unlock all features and unlimited calculations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Unlimited calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Advanced solar analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Professional reports</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Priority support</span>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href="/pricing">Upgrade Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
