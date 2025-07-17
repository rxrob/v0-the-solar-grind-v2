"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase-browser"
import { Sun, Mail, Lock, ArrowRight, Eye, EyeOff, Crown, User, Zap } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountType, setAccountType] = useState<"free" | "pro" | "ion" | null>(null)
  const [checkingAccount, setCheckingAccount] = useState(false)
  const router = useRouter()

  // Check account type when email changes
  useEffect(() => {
    const checkAccountType = async () => {
      if (!email || !email.includes("@")) {
        setAccountType(null)
        return
      }

      setCheckingAccount(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("users")
          .select("subscription_type")
          .eq("email", email.toLowerCase())
          .single()

        if (data && !error) {
          setAccountType(data.subscription_type as "free" | "pro" | "ion")
        } else {
          // Check if it's an Ion Solar email domain
          if (email.toLowerCase().includes("@ionsolar.com") || email.toLowerCase().includes("@ion.solar")) {
            setAccountType("ion")
          } else {
            setAccountType(null)
          }
        }
      } catch (err) {
        console.log("Account check error:", err)
        // Check for Ion Solar email patterns
        if (email.toLowerCase().includes("@ionsolar.com") || email.toLowerCase().includes("@ion.solar")) {
          setAccountType("ion")
        } else {
          setAccountType(null)
        }
      } finally {
        setCheckingAccount(false)
      }
    }

    const timeoutId = setTimeout(checkAccountType, 500)
    return () => clearTimeout(timeoutId)
  }, [email])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user) {
        // Check if user profile exists in our users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single()

        let userType = "free"

        if (userError && userError.code === "PGRST116") {
          // User doesn't exist in our users table, create profile
          // Determine account type based on email domain
          if (email.toLowerCase().includes("@ionsolar.com") || email.toLowerCase().includes("@ion.solar")) {
            userType = "ion"
          }

          const { error: createError } = await supabase.from("users").insert({
            id: authData.user.id,
            email: authData.user.email!,
            full_name: authData.user.user_metadata?.full_name || null,
            subscription_type: userType,
            subscription_status: "active",
            single_reports_purchased: 0,
            single_reports_used: 0,
            pro_trial_used: false,
          })

          if (createError) {
            console.error("Error creating user profile:", createError)
            setError("Failed to create user profile")
            return
          }
        } else {
          userType = userData?.subscription_type || "free"
        }

        // Redirect based on account type
        if (userType === "ion") {
          router.push("/dashboard/ion")
        } else if (userType === "pro") {
          router.push("/dashboard/pro")
        } else {
          router.push("/dashboard/free")
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      console.error("Google login error:", err)
      setError("Google login failed")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-orange-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative">
        {/* Purple glow effects */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-purple-600/30 rounded-xl blur-sm animate-pulse"></div>
        <div
          className="absolute -inset-2 bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-purple-500/20 rounded-xl blur-md animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute -inset-3 bg-gradient-to-r from-purple-300/10 via-blue-300/10 to-purple-400/10 rounded-xl blur-lg animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <Card className="relative bg-slate-800/90 backdrop-blur-md border-slate-700 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full">
                <Sun className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400">Sign in to your Solar Grind account</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 pr-20 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
                    required
                  />
                  {/* Account type badge */}
                  {checkingAccount && (
                    <div className="absolute right-3 top-3">
                      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {accountType && !checkingAccount && (
                    <div className="absolute right-3 top-2">
                      <Badge
                        variant="default"
                        className={`text-xs ${
                          accountType === "ion"
                            ? "bg-gradient-to-r from-orange-600 to-yellow-600 text-white"
                            : accountType === "pro"
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                              : "bg-slate-600 text-slate-200"
                        }`}
                      >
                        {accountType === "ion" ? (
                          <>
                            <Zap className="w-3 h-3 mr-1" />
                            ION
                          </>
                        ) : accountType === "pro" ? (
                          <>
                            <Crown className="w-3 h-3 mr-1" />
                            PRO
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" />
                            FREE
                          </>
                        )}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <Label htmlFor="remember" className="text-sm text-slate-300">
                    Remember me
                  </Label>
                </div>
                <Link href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 hover:underline">
                  Forgot password?
                </Link>
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Sign In</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="text-center">
              <span className="text-slate-400 text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-purple-400 hover:text-purple-300 hover:underline font-medium">
                  Sign up
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
