"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react"
import { useAuthReal } from "@/hooks/use-auth-real"

export default function TestRegistrationPage() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [fullName, setFullName] = useState("Test User")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user, loading, signUp, signIn, signOut, error: authError } = useAuthReal()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      const result = await signUp(email, password, fullName)

      if (result.success) {
        setMessage(result.message || "Registration successful! Please check your email to verify your account.")
      } else {
        setMessage(`Registration failed: ${result.error}`)
      }
    } catch (error) {
      setMessage("An unexpected error occurred during registration")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage("")

    try {
      const result = await signIn(email, password)

      if (result.success) {
        setMessage(result.message || "Sign in successful!")
      } else {
        setMessage(`Sign in failed: ${result.error}`)
      }
    } catch (error) {
      setMessage("An unexpected error occurred during sign in")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    setIsSubmitting(true)
    setMessage("")

    try {
      const result = await signOut()

      if (result.success) {
        setMessage(result.message || "Signed out successfully!")
      } else {
        setMessage(`Sign out failed: ${result.error}`)
      }
    } catch (error) {
      setMessage("An unexpected error occurred during sign out")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoData = () => {
    setEmail("demo@solarcalc.ai")
    setPassword("demo123456")
    setFullName("Demo User")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading authentication system...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Authentication Test</h1>
          <p className="mt-2 text-sm text-gray-600">Test the signup/signin functionality</p>
        </div>

        {authError && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-700">
              <strong>Demo Mode Active:</strong> {authError}
              <br />
              <small>All authentication is simulated for testing purposes.</small>
            </AlertDescription>
          </Alert>
        )}

        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            <strong>Demo Instructions:</strong>
            <br />• Use any email/password combination to test • Click "Fill Demo Data" for quick testing • All data is
            simulated and not stored
          </AlertDescription>
        </Alert>

        {user ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Successfully Authenticated</span>
              </CardTitle>
              <CardDescription>Welcome, {user.name}!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="flex justify-between">
                  <strong>Email:</strong>
                  <span className="text-sm">{user.email}</span>
                </p>
                <p className="flex justify-between">
                  <strong>Account Type:</strong>
                  <span className="text-sm capitalize">{user.accountType}</span>
                </p>
                <p className="flex justify-between">
                  <strong>Usage:</strong>
                  <span className="text-sm">
                    {user.calculationsUsed}/{user.monthlyLimit} calculations
                  </span>
                </p>
                <p className="flex justify-between">
                  <strong>Email Verified:</strong>
                  <span className={`text-sm ${user.emailVerified ? "text-green-600" : "text-orange-600"}`}>
                    {user.emailVerified ? "✓ Verified" : "⚠ Pending"}
                  </span>
                </p>
              </div>

              <Button
                onClick={handleSignOut}
                disabled={isSubmitting}
                className="w-full bg-transparent"
                variant="outline"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing Out...
                  </>
                ) : (
                  "Sign Out"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Test Authentication</CardTitle>
              <CardDescription>Try the signup and signin functionality</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <Button type="button" onClick={fillDemoData} variant="ghost" className="w-full text-sm">
                  Fill Demo Data
                </Button>

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    onClick={handleSignUp}
                    disabled={isSubmitting || !email || !password || !fullName}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing Up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSignIn}
                    disabled={isSubmitting || !email || !password}
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {message && (
          <Alert
            className={
              message.includes("successful") || message.includes("Demo mode")
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <div className="flex items-center space-x-2">
              {message.includes("successful") || message.includes("Demo mode") ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription
                className={
                  message.includes("successful") || message.includes("Demo mode") ? "text-green-700" : "text-red-700"
                }
              >
                {message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        <div className="text-center">
          <p className="text-xs text-gray-500">This is a demo environment. No real data is stored or transmitted.</p>
        </div>
      </div>
    </div>
  )
}
