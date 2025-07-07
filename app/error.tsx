"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Home, AlertTriangle, Sun } from "lucide-react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Something went wrong!</CardTitle>
          <CardDescription className="text-gray-600">
            We encountered an error while processing your solar analysis. Don't worry, we're here to help!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error.digest && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Error Details:</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">Error ID: {error.digest}</p>
                  <p className="text-xs text-gray-600">Please include this ID when contacting support.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button onClick={reset} className="w-full" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>

            <Button asChild variant="outline" className="w-full bg-transparent" size="lg">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full" size="lg">
              <Link href="/basic-calculator">
                <Sun className="h-4 w-4 mr-2" />
                Basic Calculator
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              If this problem persists, please{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                contact our support team
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
