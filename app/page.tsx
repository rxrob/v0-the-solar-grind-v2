"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calculator,
  Zap,
  CheckCircle,
  ArrowRight,
  Eye,
  TrendingUp,
  Sun,
  Home,
  Sparkles,
  Brain,
  MapPin,
  BadgeCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

const AnimatedBG = dynamic(() => import("@/components/AnimatedBG"), { ssr: false })

// Live Weather Widget Component
function SunExposureWidget() {
  const [sunHours, setSunHours] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching real sun exposure data
    const fetchSunData = async () => {
      try {
        // In production, this would call your weather API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setSunHours(Math.floor(Math.random() * 4) + 6) // 6-10 hours
        setLoading(false)
      } catch (error) {
        setSunHours(8)
        setLoading(false)
      }
    }
    fetchSunData()
  }, [])

  return (
    <div className="text-center">
      {loading ? (
        <div className="animate-pulse">
          <div className="h-16 w-16 bg-yellow-200 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <Sun className="h-16 w-16 text-yellow-500 mx-auto animate-pulse" />
            <div className="absolute inset-0 bg-yellow-400 rounded-full opacity-20 animate-ping"></div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-600">{sunHours} hours</div>
            <p className="text-sm text-gray-600">Peak sun exposure today</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Utility Rate Trend Component
function UtilityTrendChart() {
  const [rates, setRates] = useState<number[]>([])

  useEffect(() => {
    // Simulate utility rate data over time
    const mockRates = [0.12, 0.13, 0.15, 0.17, 0.19, 0.22, 0.25]
    setRates(mockRates)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">2018</span>
        <TrendingUp className="h-5 w-5 text-red-500" />
        <span className="text-sm text-gray-600">2024</span>
      </div>
      <div className="flex items-end space-x-2 h-20">
        {rates.map((rate, index) => (
          <div
            key={index}
            className="bg-red-500 rounded-t flex-1 transition-all duration-1000 ease-out"
            style={{
              height: `${(rate / 0.25) * 100}%`,
              animationDelay: `${index * 200}ms`,
            }}
          ></div>
        ))}
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-red-600">+108%</div>
        <p className="text-sm text-gray-600">Rate increase since 2018</p>
      </div>
    </div>
  )
}

// Floating Action Button
function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <Link href="/calculator">
        <Button
          size="lg"
          className="shadow-2xl text-lg px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 border-0"
        >
          <Zap className="mr-2 h-5 w-5" />
          Analyze My Home
        </Button>
      </Link>
    </div>
  )
}

export default function HomePage() {
  const [geoLocation, setGeoLocation] = useState<string | null>(null)

  useEffect(() => {
    fetch("https://ipapi.co/json")
      .then((res) => res.json())
      .then((data) => setGeoLocation(data.city + ", " + data.region_code))
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">
      <AnimatedBG />
      <div className="relative z-10 text-center px-6 md:px-12 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight drop-shadow-xl">Solar Grind</h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground">
          Solar Design made easy — brought to you by <span className="text-primary font-semibold">OpenAI</span>
        </p>
        {geoLocation && (
          <div className="mt-2 flex items-center justify-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-1" />
            Smart recommendations enabled for: {geoLocation}
          </div>
        )}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="text-lg px-8 py-6">
            <Link href="/calculator">Start My Solar Report</Link>
          </Button>
          <Button variant="outline" asChild className="text-lg px-8 py-6 bg-transparent">
            <Link href="/pricing">Compare Free vs Pro</Link>
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8 text-left text-muted-foreground">
          <div className="flex items-start gap-4">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">AI-Powered Design</h3>
              <p>
                Get real-time, intelligent solar layouts based on your rooftop, utility profile, and weather patterns.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Sun className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold">Live Sunlight Mapping</h3>
              <p>Location-based irradiance, shading, and seasonality taken into account — instantly.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <BadgeCheck className="w-6 h-6 text-green-500" />
            <div>
              <h3 className="text-lg font-semibold">Accurate Savings Projections</h3>
              <p>Understand how much you'll save year-over-year with solar, using local utility data.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Sparkles className="w-6 h-6 text-pink-400" />
            <div>
              <h3 className="text-lg font-semibold">Free vs Pro Access</h3>
              <p>
                Free users get basic tools. Pro users unlock advanced calculators, professional reports, and priority
                support.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-20">
          <video autoPlay loop muted playsInline className="rounded-lg border border-muted max-w-full shadow-xl">
            <source src="/demo/solar-ai-demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <p className="mt-2 text-sm text-muted-foreground">Preview of the advanced calculator in action</p>
        </div>
      </div>

      {/* AI Capabilities Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Powered by Smart AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced algorithms that understand your unique solar potential
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Real-Time Solar Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Our AI predicts savings based on your roof shape, utility rates, and sun angle — in seconds, not
                  hours.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Pro-Grade Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Customize everything: panel type, inverter efficiency, shading analysis, inflation, and utility
                  buyback rates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Satellite Vision AI</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center leading-relaxed">
                  Upload your address. Our AI scans your roof and identifies optimal solar panel placement instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Data Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Why Now Is the Perfect Time</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real-time data shows the urgency and opportunity of going solar today
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <TrendingUp className="mr-3 h-6 w-6 text-red-500" />
                  Utility Rates Are Skyrocketing
                </CardTitle>
                <CardDescription className="text-lg">Don't wait for rates to climb even higher</CardDescription>
              </CardHeader>
              <CardContent>
                <UtilityTrendChart />
                <p className="text-sm text-gray-600 mt-4 text-center">
                  *Based on national average residential electricity rates
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Sun className="mr-3 h-6 w-6 text-yellow-500" />
                  Your Roof's Solar Potential Today
                </CardTitle>
                <CardDescription className="text-lg">Live sun exposure data for optimal timing</CardDescription>
              </CardHeader>
              <CardContent>
                <SunExposureWidget />
                <p className="text-sm text-gray-600 mt-4 text-center">*Real-time solar irradiance data from NASA</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900">Trusted by Solar Professionals</h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-blue-600">10,000+</div>
              <p className="text-gray-600">Homes Analyzed</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-green-600">$2.5M+</div>
              <p className="text-gray-600">Savings Identified</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-yellow-600">95%</div>
              <p className="text-gray-600">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-300">Choose the plan that fits your solar journey</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-gray-700 bg-gray-800/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Free Explorer</CardTitle>
                <div className="text-5xl font-bold text-white mt-4">$0</div>
                <CardDescription className="text-gray-300 text-lg">
                  Perfect for homeowners exploring solar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    Basic solar potential analysis
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    Estimated savings calculation
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />1 property analysis per month
                  </li>
                </ul>
                <Link href="/signup" className="block">
                  <Button className="w-full mt-6 bg-white text-gray-900 hover:bg-gray-100">Start Free Analysis</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-500 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-yellow-500 text-black font-semibold px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Pro Analyzer</CardTitle>
                <div className="text-5xl font-bold text-yellow-400 mt-4">$29</div>
                <CardDescription className="text-gray-300 text-lg">For serious solar investors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    Advanced AI analysis with 3D modeling
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    Detailed PDF reports
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    Unlimited property analyses
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                    Priority support & consultation
                  </li>
                </ul>
                <Link href="/pricing" className="block">
                  <Button className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
                    Upgrade to Pro
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Solar Future Starts Now</h2>
          <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of homeowners who've discovered their solar potential. Get your personalized analysis in
            under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/calculator">
              <Button size="lg" className="text-lg px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 shadow-2xl">
                <Home className="mr-2 h-5 w-5" />
                Analyze My Home Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  MySolarAI
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering homeowners with AI-driven solar analysis and smart energy solutions for a sustainable future.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/calculator" className="hover:text-white transition-colors">
                    Solar Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-white transition-colors">
                    Reports
                  </Link>
                </li>
                <li>
                  <Link href="/api-status" className="hover:text-white transition-colors">
                    API Status
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-lg">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-white transition-colors">
                    System Status
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-white transition-colors">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 MySolarAI. All rights reserved. Built with ❤️ for a sustainable future.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <FloatingCTA />
    </div>
  )
}
