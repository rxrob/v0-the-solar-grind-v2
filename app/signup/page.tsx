"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Eye, EyeOff, CheckCircle, Mail } from "lucide-react"
import { useAuthReal } from "@/hooks/use-auth-real"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { signUp } = useAuthReal()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required")
      return false
    }
    if (!formData.email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    setNeedsConfirmation(false)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(" ")
      const firstName = nameParts[0]
      const lastName = nameParts.slice(1).join(" ")

      const result = await signUp({
        email: formData.email,
        password: formData.password,
        firstName,
        lastName: lastName || undefined,
      })

      if (result.success) {
        if (result.needsConfirmation) {
          setNeedsConfirmation(true)
          setSuccess("Account created! Please check your email to confirm your account before signing in.")
        } else {
          setSuccess("Account created successfully! You are now signed in.")
          // If user is automatically signed in, redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        }
      } else {
        setError(result.error || "Registration failed")
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            {needsConfirmation
              ? "Check your email to complete registration"
              : "Enter your information to create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {needsConfirmation ? (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Mail className="h-4 w-4 text-blue-500" />
                <AlertDescription className="text-blue-700">
                  We've sent a confirmation email to <strong>{formData.email}</strong>. Please click the link in the
                  email to activate your account.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 text-center">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setNeedsConfirmation(false)}
                    className="text-blue-600 hover:text-blue-500 font-medium underline"
                  >
                    try again
                  </button>
                </p>

                <div className="text-center">
                  <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                    Already confirmed? Sign in here
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign in
                  </Link>
                </p>
                <p className="text-xs text-gray-500">
                  <Link href="/test-registration" className="hover:text-gray-700">
                    Test Registration
                  </Link>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
