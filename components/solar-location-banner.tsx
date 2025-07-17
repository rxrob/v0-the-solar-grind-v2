"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Sun, TrendingUp, ChevronDown, ChevronUp } from "lucide-react"
import { useRouter } from "next/navigation"

interface LocationData {
  latitude: number
  longitude: number
  city?: string
  state?: string
  zipCode?: string
}

interface SolarData {
  score: number
  factors: {
    sunlight: number
    roofOrientation: number
    shading: number
    incentives: number
  }
  estimatedSavings: {
    monthly: number
    annual: number
  }
  systemSize: number
}

export function SolarLocationBanner() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [solarData, setSolarData] = useState<SolarData | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    detectLocation()
  }, [])

  const detectLocation = async () => {
    try {
      if (!navigator.geolocation) {
        setIsLoading(false)
        return
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // Get location details
          const locationData = await getLocationDetails(latitude, longitude)
          setLocation(locationData)

          // Calculate solar score
          const solar = calculateSolarScore(locationData)
          setSolarData(solar)

          setIsLoading(false)
        },
        (error) => {
          console.warn("Geolocation error:", error)
          setIsLoading(false)
        },
        { timeout: 10000, enableHighAccuracy: false },
      )
    } catch (error) {
      console.warn("Location detection error:", error)
      setIsLoading(false)
    }
  }

  const getLocationDetails = async (lat: number, lng: number): Promise<LocationData> => {
    try {
      // Mock location data - in real app, use Google Geocoding API
      return {
        latitude: lat,
        longitude: lng,
        city: "Austin",
        state: "TX",
        zipCode: "78701",
      }
    } catch (error) {
      return { latitude: lat, longitude: lng }
    }
  }

  const calculateSolarScore = (location: LocationData): SolarData => {
    // Mock solar calculation - in real app, use NREL API
    const baseScore = 75 + Math.floor(Math.random() * 20)

    return {
      score: baseScore,
      factors: {
        sunlight: 85 + Math.floor(Math.random() * 10),
        roofOrientation: 80 + Math.floor(Math.random() * 15),
        shading: 70 + Math.floor(Math.random() * 20),
        incentives: 90 + Math.floor(Math.random() * 10),
      },
      estimatedSavings: {
        monthly: 120 + Math.floor(Math.random() * 80),
        annual: 1400 + Math.floor(Math.random() * 800),
      },
      systemSize: 6 + Math.floor(Math.random() * 4),
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "from-green-500 to-emerald-600"
    if (score >= 80) return "from-yellow-500 to-orange-500"
    if (score >= 70) return "from-orange-500 to-red-500"
    return "from-red-500 to-red-700"
  }

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-500/20 text-green-300 border-green-500/30"
    if (score >= 80) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    if (score >= 70) return "bg-orange-500/20 text-orange-300 border-orange-500/30"
    return "bg-red-500/20 text-red-300 border-red-500/30"
  }

  const handleGetStarted = () => {
    // Track the click event
    if (typeof window !== "undefined" && (window as any).trackEvent) {
      ;(window as any).trackEvent("location_banner_cta_click", {
        location: location,
        solarScore: solarData?.score,
        timestamp: Date.now(),
      })
    }
    router.push("/pro-calculator/step-1")
  }

  if (isLoading) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-gray-900/40 to-black/30 rounded-xl blur-xl"></div>
        <Card className="relative bg-gradient-to-r from-orange-50/90 via-amber-50/90 to-orange-50/90 backdrop-blur-md border-orange-200/50 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Locating your area...</span>
            </div>
            <p className="text-sm text-gray-500">
              Analyzing sunlight exposure and yearly energy savings for your location.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!location || !solarData) {
    return null
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-gray-900/50 to-black/40 rounded-xl blur-2xl"></div>

      <Card className="relative bg-gradient-to-r from-orange-50/95 via-amber-50/95 to-orange-50/95 backdrop-blur-md border-orange-200/50 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-400/30 rounded-full blur-sm"></div>
                <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-full">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {location.city}, {location.state}
                </h3>
                <p className="text-sm text-gray-600">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-lg"></div>
                <div
                  className={`relative bg-gradient-to-r ${getScoreColor(solarData.score)} text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg`}
                >
                  {solarData.score}
                </div>
              </div>
              <Badge className={`mt-2 ${getScoreBadgeColor(solarData.score)}`}>Solar Score</Badge>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-gray-800/10 to-black/10 rounded-lg blur-sm"></div>
            <div className="relative bg-gradient-to-r from-orange-100/80 to-amber-100/80 rounded-lg p-4 border border-orange-200/30">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-gray-800">🤖 AI Solar Analysis:</span>
              </div>
              <p className="text-sm text-gray-700">
                Based on your property's conditions, you're projected to produce around{" "}
                <span className="font-semibold text-green-600">
                  {(solarData.systemSize * 1600).toLocaleString()} kWh/year
                </span>
                . That means you could save up to{" "}
                <span className="text-green-600 font-semibold">
                  ${solarData.estimatedSavings.monthly}–${solarData.estimatedSavings.monthly + 50} monthly
                </span>{" "}
                with a properly sized system. This puts your home in the top 15% of solar-qualified properties in your
                area.
              </p>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-gray-800/5 to-black/5 rounded-lg blur-sm"></div>
                  <div className="relative bg-white/60 rounded-lg p-3 border border-orange-200/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sunlight</span>
                      <span className="font-semibold text-orange-600">{solarData.factors.sunlight}%</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-gray-800/5 to-black/5 rounded-lg blur-sm"></div>
                  <div className="relative bg-white/60 rounded-lg p-3 border border-orange-200/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Roof Angle</span>
                      <span className="font-semibold text-orange-600">{solarData.factors.roofOrientation}%</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-gray-800/5 to-black/5 rounded-lg blur-sm"></div>
                  <div className="relative bg-white/60 rounded-lg p-3 border border-orange-200/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Shading</span>
                      <span className="font-semibold text-orange-600">{solarData.factors.shading}%</span>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-gray-800/5 to-black/5 rounded-lg blur-sm"></div>
                  <div className="relative bg-white/60 rounded-lg p-3 border border-orange-200/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Incentives</span>
                      <span className="font-semibold text-orange-600">{solarData.factors.incentives}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-gray-800/10 to-black/10 rounded-lg blur-sm"></div>
                <div className="relative bg-gradient-to-r from-green-50/80 to-emerald-50/80 rounded-lg p-3 border border-green-200/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-600">Estimated Annual Savings</span>
                      <div className="font-bold text-green-600">
                        ${solarData.estimatedSavings.annual.toLocaleString()}
                      </div>
                    </div>
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              {isExpanded ? (
                <>
                  Less Details <ChevronUp className="ml-1 w-4 h-4" />
                </>
              ) : (
                <>
                  More Details <ChevronDown className="ml-1 w-4 h-4" />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg blur-sm"></div>
              <Button
                onClick={handleGetStarted}
                className="relative bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 text-white shadow-lg"
              >
                Get Full Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
