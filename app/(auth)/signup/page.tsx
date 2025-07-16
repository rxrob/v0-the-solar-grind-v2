"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, Sun, Crown, CheckCircle } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const isIONEmployee = email.toLowerCase().includes("@ionsolar.com")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message || "Account created successfully!")
        setShowSuccess(true)
      } else {
        setError(data.error || "Sign up failed")
      }
    } catch (error) {
      console.error("Sign up error:", error)
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Account Created!</h2>
              <p className="text-gray-300">{success}</p>
              {isIONEmployee && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-200 font-medium">Pro Access Granted!</span>
                  </div>
                </div>
              )}
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sun className="h-8 w-8 text-orange-400" />
            <span className="text-2xl font-bold text-white">Solar Grind</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">Create your account</CardTitle>
          <CardDescription className="text-gray-300">Get started with your solar analysis journey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertDescription className="text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {isIONEmployee && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-200 font-medium">ION Solar Team Member Detected</span>
              </div>
              <p className="text-yellow-100 text-sm mt-1">You'll get pro access with unlimited reports! 👑</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400">Password must be at least 6 characters long</p>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200 transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <div className="text-center">
            <p className="text-gray-300 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
