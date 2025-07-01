"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sun,
  Calculator,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Crown,
  BarChart3,
  MapPin,
  Mail,
  Award,
  Target,
  Lightbulb,
} from "lucide-react"

export default function HomePage() {
  const [email, setEmail] = useState("")

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
    console.log("Newsletter signup:", email)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
                <Sun className="h-8 w-8" />
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                MySolar.AI
              </h1>
            </div>

            <h2 className="text-2xl lg:text-4xl font-bold mb-6 leading-tight">
              Advanced Solar Analysis & Design Platform
            </h2>

            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Get professional-grade solar analysis with AI-powered calculations, satellite imagery, and comprehensive
              financial modeling. Design the perfect solar system for any property.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/basic-calculator">
                  <Calculator className="h-5 w-5 mr-2" />
                  Start Free Analysis
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 rounded-full backdrop-blur-sm transition-all duration-300 bg-transparent"
              >
                <Link href="/test-pro-calculator">
                  <Crown className="h-5 w-5 mr-2" />
                  Pro Calculator
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="text-3xl font-bold text-yellow-300">50,000+</div>
                <div className="text-blue-100">Solar Analyses</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="text-3xl font-bold text-green-300">$2.5B+</div>
                <div className="text-blue-100">Savings Calculated</div>
              </div>
              <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <div className="text-3xl font-bold text-orange-300">98%</div>
                <div className="text-blue-100">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Professional Solar Analysis Tools</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to design, analyze, and present solar solutions with confidence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <div className="p-3 bg-blue-600 rounded-full w-fit mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-blue-900">Satellite Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  High-resolution satellite imagery with AI-powered roof analysis, shading detection, and optimal panel
                  placement recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="p-3 bg-green-600 rounded-full w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-green-900">Financial Modeling</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comprehensive financial analysis with multiple financing options, incentive calculations, and 25-year
                  performance projections.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader>
                <div className="p-3 bg-purple-600 rounded-full w-fit mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-purple-900">NREL Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Real-time solar irradiance data from NREL PVWatts API for accurate production estimates and climate
                  analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-yellow-50">
              <CardHeader>
                <div className="p-3 bg-amber-600 rounded-full w-fit mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-amber-900">System Design</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Advanced system sizing with component selection, inverter optimization, and battery storage
                  integration options.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-50 to-pink-50">
              <CardHeader>
                <div className="p-3 bg-red-600 rounded-full w-fit mb-4">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-red-900">Professional Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Generate comprehensive PDF reports with executive summaries, technical specifications, and
                  professional presentations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-teal-50 to-cyan-50">
              <CardHeader>
                <div className="p-3 bg-teal-600 rounded-full w-fit mb-4">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl text-teal-900">AI Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Machine learning algorithms optimize system design for maximum efficiency, cost-effectiveness, and
                  return on investment.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Calculator Options */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Analysis Level</h2>
            <p className="text-xl text-gray-600">From quick estimates to comprehensive professional analysis</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
              <CardHeader className="text-center pb-6">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-fit mx-auto mb-4">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Basic Calculator</CardTitle>
                <CardDescription className="text-lg">Quick solar analysis for homeowners</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Basic system sizing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Cost estimates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Savings projections</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Payback analysis</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">FREE</div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <Link href="/basic-calculator">
                      Start Basic Analysis
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-indigo-50 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2">
                  <Crown className="h-4 w-4 mr-1" />
                  PROFESSIONAL
                </Badge>
              </div>
              <CardHeader className="text-center pb-6 pt-8">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full w-fit mx-auto mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Pro Calculator</CardTitle>
                <CardDescription className="text-lg">Comprehensive analysis for professionals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Satellite imagery analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Advanced financial modeling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Professional PDF reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>8-step guided analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Component optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Environmental impact analysis</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-3xl font-bold text-purple-600 mb-2">FREE TRIAL</div>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    <Link href="/test-pro-calculator">
                      Start Pro Analysis
                      <Crown className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Solar Professionals</h2>
            <p className="text-xl text-gray-600">See what industry experts are saying about MySolar.AI</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "MySolar.AI has revolutionized our sales process. The professional reports and accurate calculations
                  have increased our close rate by 40%."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">MJ</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Mike Johnson</div>
                    <div className="text-sm text-gray-600">Solar Sales Director</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The satellite analysis and shading detection are incredibly accurate. It's like having a site survey
                  without leaving the office."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">SR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sarah Rodriguez</div>
                    <div className="text-sm text-gray-600">System Designer</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">
                  "The financial modeling is spot-on. Our customers love the detailed reports and it builds tremendous
                  trust in our proposals."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">DL</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">David Lee</div>
                    <div className="text-sm text-gray-600">Solar Consultant</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Stay Updated with Solar Industry Insights</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Get the latest solar technology updates, market trends, and exclusive features delivered to your inbox.
          </p>

          <form onSubmit={handleNewsletterSignup} className="max-w-md mx-auto flex gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/20 border-white/30 text-white placeholder:text-white/70"
              required
            />
            <Button type="submit" className="bg-white text-blue-600 hover:bg-blue-50">
              Subscribe
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sun className="h-8 w-8 text-yellow-400" />
                <span className="text-2xl font-bold">MySolar.AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Professional solar analysis and design platform powered by AI and satellite imagery.
              </p>
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-400">support@mysolar.ai</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tools</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/basic-calculator" className="hover:text-white transition-colors">
                    Basic Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/test-pro-calculator" className="hover:text-white transition-colors">
                    Pro Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/api-status" className="hover:text-white transition-colors">
                    API Status
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Solar Guide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MySolar.AI. All rights reserved. Built with precision for solar professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
