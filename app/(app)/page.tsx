"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { ArrowRight, Zap, TrendingUp, Shield, Users, Sun, BarChart3, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useSafeTracking } from "@/hooks/useSafeTracking"
import { LocationPermissionBanner } from "@/components/location-permission-banner"

const stats = [
  {
    icon: <Users className="h-8 w-8 text-white" />,
    value: "50K+",
    label: "Happy Customers",
  },
  {
    icon: <Zap className="h-8 w-8 text-white" />,
    value: "1.2GW",
    label: "Solar Installed",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-white" />,
    value: "$500M",
    label: "Savings Generated",
  },
  {
    icon: <Shield className="h-8 w-8 text-white" />,
    value: "99.9%",
    label: "Uptime",
  },
]

export default function HomePage() {
  const { trackEvent } = useSafeTracking()
  const pathname = usePathname()

  useEffect(() => {
    trackEvent("page_view", { path: pathname, page_name: "Home" })
  }, [trackEvent, pathname])

  const handleCTAClick = (ctaName: string, href: string) => {
    trackEvent("cta_click", { cta_name: ctaName, destination: href, location: "hero" })
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full container px-4 md:px-6 mt-8">
        <LocationPermissionBanner />
      </div>

      <main className="w-full flex-grow flex flex-col items-center space-y-20 md:space-y-28 py-16 md:py-24">
        <section className="text-center">
          <div className="container px-4 md:px-6">
            <Badge
              variant="outline"
              className="mb-4 py-1 px-4 rounded-full text-sm bg-white/10 border-white/20 backdrop-blur-sm"
            >
              <Sun className="h-4 w-4 mr-2 text-orange-400" />
              AI-Powered Solar Intelligence
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4">
              Solar Intelligence
              <br />
              <span className="text-gradient">Reimagined</span>
            </h1>
            <p className="max-w-[700px] mx-auto text-slate-300 md:text-xl mb-8">
              Harness the power of AI and satellite data to make informed solar decisions. Get precise calculations,
              professional reports, and maximize your solar investment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                onClick={() => handleCTAClick("start_solar_analysis", "/pro-calculator")}
              >
                <Link href="/pro-calculator">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Start Solar Analysis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-orange-500 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                onClick={() => handleCTAClick("try_free_calculator", "/calculator")}
              >
                <Link href="/calculator">
                  <Calculator className="mr-2 h-5 w-5" />
                  Try Free Calculator
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container px-4 md:px-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/20 bg-white/10 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                  {stat.icon}
                </div>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
