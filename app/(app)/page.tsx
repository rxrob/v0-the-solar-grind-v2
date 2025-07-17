"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, BarChart3, FileText, MapPin, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface LocationData {
  city: string
  state: string
  country: string
  lat: number
  lng: number
  zip_code?: string
  source?: string
}

export default function HomePage() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    detectLocation()
  }, [])

  const detectLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      // Get user's coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported"))
          return
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5 minutes cache
        })
      })

      const { latitude: lat, longitude: lng } = position.coords
      console.log("Got coordinates:", { lat, lng })

      // Get location details from coordinates
      try {
        const response = await fetch(`/api/geocoding?lat=${lat}&lng=${lng}`)
        const data = await response.json()

        console.log("Geocoding response:", data)

        if (response.ok && data.success) {
          setLocation({
            city: data.city || "Unknown City",
            state: data.state || "",
            country: data.country || "US",
            lat,
            lng,
            zip_code: data.zip_code,
            source: data.source,
          })
        } else {
          // Fallback to showing coordinates with basic location
          const fallbackCity = getFallbackCityName(lat, lng)
          setLocation({
            city: fallbackCity,
            state: "",
            country: "US",
            lat,
            lng,
          })
        }
      } catch (geocodingError) {
        console.error("Geocoding error:", geocodingError)
        // Show coordinates as fallback with better naming
        const fallbackCity = getFallbackCityName(lat, lng)
        setLocation({
          city: fallbackCity,
          state: "",
          country: "US",
          lat,
          lng,
        })
      }
    } catch (error) {
      console.error("Location detection error:", error)
      setLocationError("Unable to detect location. Please enable location services.")

      // Use a default location for demo
      setLocation({
        city: "Demo Location",
        state: "TX",
        country: "US",
        lat: 30.2672,
        lng: -97.7431,
      })
    } finally {
      setLocationLoading(false)
    }
  }

  // Simple fallback city naming based on coordinates
  const getFallbackCityName = (lat: number, lng: number): string => {
    // Texas coordinates
    if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) {
      if (lat >= 32.5 && lat <= 33.0 && lng >= -97.5 && lng <= -96.5) {
        return "Dallas Area"
      } else if (lat >= 29.5 && lat <= 30.0 && lng >= -95.8 && lng <= -95.0) {
        return "Houston Area"
      } else if (lat >= 30.0 && lat <= 30.5 && lng >= -98.0 && lng <= -97.5) {
        return "Austin Area"
      } else {
        return "Texas"
      }
    }

    // California
    if (lat >= 32.5 && lat <= 42.0 && lng >= -124.0 && lng <= -114.0) {
      return "California"
    }

    // General US
    if (lat >= 24.0 && lat <= 49.0 && lng >= -125.0 && lng <= -66.0) {
      return "United States"
    }

    return "Your Location"
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
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

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-16 text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30">⚡ AI-Powered Solar Analysis</Badge>

          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Smarter Solar Starts Here
            </h1>

            {/* Yellowish-orange mist effect */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-4">
              <div className="w-full h-20 bg-gradient-to-b from-yellow-400/20 via-orange-400/15 to-transparent blur-3xl"></div>
              <div className="absolute top-0 left-1/4 w-3/4 h-16 bg-gradient-to-b from-orange-400/25 via-yellow-400/20 to-transparent blur-2xl"></div>
              <div className="absolute top-0 left-1/3 w-1/2 h-12 bg-gradient-to-b from-yellow-500/30 via-orange-500/25 to-transparent blur-xl"></div>
            </div>
          </div>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto mt-12">
            AI-powered solar tools designed to maximize your home's savings and energy independence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg"
            >
              <Link href="/calculator">Start Free Analysis →</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 text-lg bg-transparent"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>

        {/* Secondary Hero */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Instant, AI-Powered Solar Analysis</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Get detailed solar potential reports, system size recommendations, and savings estimates for any property in
            seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-lg font-semibold">
              <Link href="/calculator">Get Started for Free</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 text-lg bg-transparent"
            >
              <Link href="/pricing">View Pro Pricing</Link>
            </Button>
          </div>

          {/* How It Works */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-12 text-white">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <CardContent className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    1
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-white">Enter Address</h4>
                  <p className="text-slate-300">Provide a property address to begin the analysis.</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <CardContent className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    2
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-white">AI Analysis</h4>
                  <p className="text-slate-300">
                    Our AI analyzes roof geometry, sun exposure, and local utility rates.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <CardContent className="text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl">
                    3
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-white">Get Your Report</h4>
                  <p className="text-slate-300">
                    Receive a comprehensive report with system recommendations and financial projections.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Location Status */}
          <div className="mb-8">
            {locationLoading ? (
              <div className="flex items-center justify-center text-slate-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Locating your area...
              </div>
            ) : locationError ? (
              <div className="flex items-center justify-center text-orange-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                {locationError}
              </div>
            ) : location ? (
              <div className="flex items-center justify-center text-green-400">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Analyzing sunlight exposure and yearly energy savings for your location.
              </div>
            ) : null}
          </div>
        </section>

        {/* Solar Score Section */}
        {location && (
          <section className="container mx-auto px-4 py-16 text-center">
            {/* Location Display */}
            <div className="mb-8">
              <div className="flex items-center justify-center text-slate-300 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-lg">
                  {location.city}
                  {location.state && `, ${location.state}`}
                  {location.country && location.country !== "US" && `, ${location.country}`}
                </span>
              </div>
              <div className="text-sm text-slate-500">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                {location.source && (
                  <span className="ml-2 text-xs text-slate-600">
                    ({location.source === "google" ? "Google Maps" : "Estimated"})
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-12 text-white">Your Solar Score</h2>

            {/* Solar Score Circle */}
            <div className="mb-8">
              <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center">
                <span className="text-6xl font-bold text-white">92</span>
              </div>
            </div>

            <p className="text-lg text-slate-300 mb-8 max-w-3xl mx-auto">
              This home receives above-average sunlight, has optimal roof orientation, and qualifies for generous local
              incentives — making it an ideal candidate for solar.
            </p>

            {/* SolarGPT Analysis */}
            <Card className="max-w-4xl mx-auto bg-slate-800/50 border-orange-500/50 border-2">
              <CardContent className="p-6 text-left">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-orange-500 rounded mr-3">🤖</div>
                  <h3 className="text-xl font-semibold text-orange-400">SolarGPT Analysis:</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Based on your property's conditions, you're projected to produce around{" "}
                  <span className="text-green-400 font-semibold">10,400 kWh/year</span>. That means you could save up to{" "}
                  <span className="text-green-400 font-semibold">$1,400–$1,800 annually</span> with a properly sized
                  system. This puts your home in the top 15% of solar-qualified properties in your area.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">Why Choose The Solar Grind?</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Advanced AI technology meets solar expertise to deliver the most accurate analysis available.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Smart Solar Calculator</h3>
                <p className="text-slate-300">AI-powered calculations using real weather data and satellite imagery</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Advanced Analytics</h3>
                <p className="text-slate-300">Detailed performance predictions and ROI analysis</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Professional Reports</h3>
                <p className="text-slate-300">Generate comprehensive PDF reports for clients and stakeholders</p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">50,000+</div>
              <div className="text-slate-400">Solar Analyses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">2.5M kWh</div>
              <div className="text-slate-400">Energy Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1,200 tons</div>
              <div className="text-slate-400">CO₂ Reduced</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">10,000+</div>
              <div className="text-slate-400">Happy Users</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
