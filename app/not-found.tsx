"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, Calculator, ArrowLeft, Sun } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Sun className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Page Not Found</CardTitle>
          <CardDescription className="text-gray-600">
            The solar analysis page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">404</div>
            <p className="text-sm text-gray-500 mb-6">
              Don't worry, even the best solar installations need proper navigation!
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
              <Link href="/basic-calculator">
                <Calculator className="h-4 w-4 mr-2" />
                Try Calculator
              </Link>
            </Button>

            <Button variant="ghost" className="w-full" size="lg" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              Need help? Contact our{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                support team
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
