"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Sun, Zap, DollarSign, ChevronDown, ChevronUp } from "lucide-react"
import { useTracking } from "./user-tracking-provider"

interface LocationData {
  city: string
  state: string
  zipCode: string
  lat: number
  lng: number
}

interface SolarData {
  solarScore: number
  avgSunHours: number
  potentialSavings: number
  roofSuitability: string
  utilityPrograms: string[]
}

export function SolarLocationBanner() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [solarData, setSolarData] = useState<SolarData | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { trackButtonClick, trackFeatureUsage } = useTracking()

  const requestLocation = async () => {
    setIsLoading(true)
    setError(null)
    trackButtonClick("request_location", { source: "solar_banner" })

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser")
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Reverse geocode to get location details
      const geocodeResponse = await fetch(`/api/geocoding?lat=${latitude}&lng=${longitude}`)

      if (!geocodeResponse.ok) {
        throw new Error("Failed to get location details")
      }

      const geocodeData = await geocodeResponse.json()

      const locationData: LocationData = {
        city: geocodeData.city || "Unknown City",
        state: geocodeData.state || "Unknown State",
        zipCode: geocodeData.zipCode || "00000",
        lat: latitude,
        lng: longitude,
      }

      setLocation(locationData)
      trackFeatureUsage("location_detected", locationData)

      // Generate mock solar data based on location
      const mockSolarData: SolarData = {
        solarScore: Math.floor(Math.random() * 30) + 70, // 70-100
        avgSunHours: Math.floor(Math.random() * 3) + 4.5, // 4.5-7.5
        potentialSavings: Math.floor(Math.random() * 50000) + 15000, // $15k-65k
        roofSuitability: ["Excellent", "Good", "Fair"][Math.floor(Math.random() * 3)],
        utilityPrograms: ["Net Metering", "Solar Rebates", "Tax Credits"].slice(0, Math.floor(Math.random() * 3) + 1),
      }

      setSolarData(mockSolarData)
      trackFeatureUsage("solar_data_generated", {
        solar_score: mockSolarData.solarScore,
        location: `${locationData.city}, ${locationData.state}`,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get location"
      setError(errorMessage)
      trackFeatureUsage("location_error", { error: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const getSolarScoreColor = (score: number) => {
    if (score >= 85) return "bg-green-500"
    if (score >= 70) return "bg-yellow-500"
    return "bg-orange-500"
  }

  const getSolarScoreText = (score: number) => {
    if (score >= 85) return "Excellent"
    if (score >= 70) return "Good"
    return "Fair"
  }

  if (!location) {
    return (
      <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Get Your Solar Potential</h3>
                <p className="text-sm text-gray-600">
                  Allow location access to see your area's solar score and savings potential
                </p>
              </div>
            </div>
            <Button
              onClick={requestLocation}
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Getting Location...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Allow Location</span>
                </div>
              )}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full shadow-lg">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-gray-900">
                  {location.city}, {location.state}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {location.zipCode}
                </Badge>
              </div>
              {solarData && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getSolarScoreColor(solarData.solarScore)}`} />
                    <span className="text-sm font-medium text-gray-700">
                      Solar Score: {solarData.solarScore}/100 ({getSolarScoreText(solarData.solarScore)})
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>~${solarData.potentialSavings.toLocaleString()} potential savings</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(!isExpanded)
              trackButtonClick("toggle_solar_details", { expanded: !isExpanded })
            }}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {isExpanded && solarData && (
          <div className="mt-6 pt-6 border-t border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium text-gray-900">Sun Hours</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{solarData.avgSunHours}</p>
                <p className="text-sm text-gray-600">hours/day average</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  <span className="font-medium text-gray-900">Roof Suitability</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{solarData.roofSuitability}</p>
                <p className="text-sm text-gray-600">for solar installation</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-100">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-900">Programs Available</span>
                </div>
                <div className="space-y-1">
                  {solarData.utilityPrograms.map((program, index) => (
                    <Badge key={index} variant="outline" className="text-xs mr-1">
                      {program}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                onClick={() => {
                  trackButtonClick("start_solar_calculation", {
                    location: `${location.city}, ${location.state}`,
                    solar_score: solarData.solarScore,
                  })
                  window.location.href = "/pro-calculator"
                }}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Solar Analysis
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
