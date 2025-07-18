"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sun,
  Calculator,
  FileText,
  Zap,
  DollarSign,
  MapPin,
  TrendingUp,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { AnimatedBG } from "@/components/AnimatedBG"
import { SolarLocationBanner } from "@/components/solar-location-banner"
import { useTracking } from "@/components/user-tracking-provider"

export default function HomePage() {
  const { trackButtonClick, trackFeatureUsage } = useTracking()

  const features = [
    {
      icon: Calculator,
      title: "Advanced Solar Calculator",
      description:
        "Get precise solar estimates with our AI-powered calculator using real satellite data and local utility rates.",
      href: "/pro-calculator",
      badge: "Pro",
      color: "from-orange-500 to-red-500",
      delay: "0ms",
    },
    {
      icon: FileText,
      title: "Professional Reports",
      description:
        "Generate comprehensive solar reports with ROI analysis, financing options, and installation recommendations.",
      href: "/reports",
      badge: "New",
      color: "from-yellow-500 to-orange-500",
      delay: "100ms",
    },
    {
      icon: MapPin,
      title: "Location Intelligence",
      description: "Analyze solar potential with precise location data, roof analysis, and local incentive programs.",
      href: "/visual-analysis",
      badge: "AI",
      color: "from-orange-500 to-yellow-500",
      delay: "200ms",
    },
    {
      icon: TrendingUp,
      title: "ROI Analytics",
      description: "Track your solar investment performance with detailed analytics and savings projections.",
      href: "/dashboard",
      badge: "Pro",
      color: "from-red-500 to-orange-500",
      delay: "300ms",
    },
  ]

  const stats = [
    { icon: Users, value: "50K+", label: "Happy Customers" },
    { icon: Zap, value: "1.2GW", label: "Solar Installed" },
    { icon: DollarSign, value: "$500M", label: "Savings Generated" },
    { icon: Shield, value: "99.9%", label: "Uptime" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBG />

      {/* Floating Mist Overlays */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-r from-yellow-500/15 to-orange-500/15 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-400/10 to-red-500/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          {/* Solar Location Banner */}
          <SolarLocationBanner />

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-sm border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">AI-Powered Solar Intelligence</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent animate-gradient-x drop-shadow-2xl">
              Solar Intelligence
              <br />
              <span className="text-4xl md:text-6xl bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of AI and satellite data to make informed solar decisions. Get precise calculations,
              professional reports, and maximize your solar investment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold animate-pulse-glow"
                onClick={() => trackButtonClick("hero_cta_calculator", { source: "homepage_hero" })}
              >
                <Link href="/pro-calculator" className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Start Solar Analysis</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10 hover:border-orange-400 backdrop-blur-sm px-8 py-4 text-lg font-semibold transition-all duration-300 bg-transparent"
                onClick={() => trackButtonClick("hero_cta_demo", { source: "homepage_hero" })}
              >
                <Link href="/calculator" className="flex items-center space-x-2">
                  <Sun className="h-5 w-5" />
                  <span>Try Free Calculator</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white/5 backdrop-blur-sm border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-white/5 backdrop-blur-sm border-orange-500/20 hover:border-orange-400/40 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2 animate-float-up cursor-pointer"
                style={{ animationDelay: feature.delay }}
                onClick={() => {
                  trackFeatureUsage("feature_card_click", {
                    feature: feature.title,
                    href: feature.href,
                  })
                  window.location.href = feature.href
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-orange-500/20 text-orange-300 border-orange-500/30 group-hover:bg-orange-500/30 transition-all duration-300"
                    >
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl text-white group-hover:text-orange-300 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-4 flex items-center text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                    <span className="text-sm font-medium">Learn more</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 backdrop-blur-sm border-orange-500/30 shadow-2xl">
            <CardContent className="p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Go Solar?</h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join thousands of homeowners who have made the switch to clean, renewable energy. Start your solar
                  journey today with our professional analysis.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold"
                    onClick={() => trackButtonClick("cta_get_started", { source: "homepage_bottom" })}
                  >
                    <Link href="/pro-calculator" className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5" />
                      <span>Get Started Now</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-orange-500/50 text-orange-300 hover:bg-orange-500/10 hover:border-orange-400 backdrop-blur-sm px-8 py-4 text-lg font-semibold bg-transparent"
                    onClick={() => trackButtonClick("cta_learn_more", { source: "homepage_bottom" })}
                  >
                    <Link href="/pricing" className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>View Pricing</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
