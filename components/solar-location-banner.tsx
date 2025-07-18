"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Zap, DollarSign, Leaf, ChevronUp, ChevronDown, X } from "lucide-react"

interface LocationData {
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
}

interface SolarAnalysis {
  score: number
  annualProduction: number
  annualSavings: number
  co2Reduction: number
  roiYears: number
  incentives: string[]
}

export default function SolarLocationBanner() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [solarAnalysis, setSolarAnalysis] = useState<SolarAnalysis | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (isDismissed) return

    const getUserLocation = async () => {
      if (!navigator.geolocation) return

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          try {
            // Get city and state from coordinates
            const response = await fetch(`/api/geocoding?lat=${latitude}&lng=${longitude}`)
            const data = await response.json()

            const locationData = {
              latitude,
              longitude,
              city: data.city,
              state: data.state,
              country: data.country,
            }

            setLocation(locationData)

            // Calculate solar analysis
            const analysis = calculateSolarAnalysis(locationData)
            setSolarAnalysis(analysis)
            setIsVisible(true)
          } catch (error) {
            console.error("Error getting location details:", error)
          }
        },
        (error) => {
          console.warn("Error getting location:", error.message)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    }

    getUserLocation()
  }, [isDismissed])

  const calculateSolarAnalysis = (location: LocationData): SolarAnalysis => {
    // Calculate solar score based on latitude and state
    const latitudeScore = Math.max(0, Math.min(100, 100 - Math.abs(location.latitude - 35) * 2))

    // State-based incentive multipliers
    const stateMultipliers: Record<string, number> = {
      CA: 1.2, // California
      TX: 1.1, // Texas
      FL: 1.15, // Florida
      NY: 1.1, // New York
      AZ: 1.25, // Arizona
      NV: 1.2, // Nevada
      NC: 1.1, // North Carolina
      NJ: 1.1, // New Jersey
    }

    const stateMultiplier = location.state ? stateMultipliers[location.state] || 1.0 : 1.0
    const baseScore = latitudeScore * stateMultiplier
    const finalScore = Math.min(100, Math.max(0, Math.round(baseScore)))

    // Calculate estimates based on score
    const annualProduction = Math.round(finalScore * 120 + 8000) // 8,000-20,000 kWh
    const annualSavings = Math.round(annualProduction * 0.12) // $0.12/kWh average
    const co2Reduction = Math.round(annualProduction * 0.0007 * 1000) // lbs CO2
    const roiYears = Math.round((25000 / annualSavings) * 10) / 10 // Assuming $25k system

    const incentives = []
    if (finalScore >= 80) incentives.push("Federal Tax Credit", "State Rebates", "Net Metering")
    else if (finalScore >= 60) incentives.push("Federal Tax Credit", "Net Metering")
    else incentives.push("Federal Tax Credit")

    return {
      score: finalScore,
      annualProduction,
      annualSavings,
      co2Reduction,
      roiYears,
      incentives,
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-orange-400"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Fair"
  }

  if (!isVisible || isDismissed || !location || !solarAnalysis) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <Card className="bg-slate-800/95 backdrop-blur-sm border-orange-500/30 shadow-2xl">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-slate-300">
                {location.city}, {location.state}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-orange-400"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDismissed(true)}
                className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Solar Score */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-400" />
                <span className="text-white font-medium">Solar Score</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-2xl font-bold ${getScoreColor(solarAnalysis.score)}`}>
                  {solarAnalysis.score}
                </span>
                <Badge variant="outline" className="text-xs border-orange-500/30 text-orange-300">
                  {getScoreLabel(solarAnalysis.score)}
                </Badge>
              </div>
            </div>
            <Button size="sm" className="btn-orange">
              Get Full Report
            </Button>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-3 pt-3 border-t border-slate-700">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-400" />
                  <div>
                    <div className="text-slate-400">Annual Production</div>
                    <div className="text-white font-medium">{solarAnalysis.annualProduction.toLocaleString()} kWh</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-400" />
                  <div>
                    <div className="text-slate-400">Annual Savings</div>
                    <div className="text-white font-medium">${solarAnalysis.annualSavings.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-400" />
                  <div>
                    <div className="text-slate-400">CO₂ Reduction</div>
                    <div className="text-white font-medium">{solarAnalysis.co2Reduction.toLocaleString()} lbs</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                  <div>
                    <div className="text-slate-400">Payback Period</div>
                    <div className="text-white font-medium">{solarAnalysis.roiYears} years</div>
                  </div>
                </div>
              </div>

              {/* Incentives */}
              <div>
                <div className="text-sm text-slate-400 mb-2">Available Incentives</div>
                <div className="flex flex-wrap gap-1">
                  {solarAnalysis.incentives.map((incentive, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-orange-500/30 text-orange-300">
                      {incentive}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
