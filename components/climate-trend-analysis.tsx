"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cloud, Sun, Thermometer, TrendingUp, MapPin, CheckCircle, BarChart3 } from "lucide-react"

interface ClimateTrendAnalysisProps {
  coordinates: string
  address: string
  onClimateData?: (data: ClimateAnalysis) => void
}

interface ClimateAnalysis {
  // Irradiance Data
  averageIrradiance: number
  monthlyIrradiance: number[]
  peakSunHours: number
  irradianceVariability: number

  // Temperature Data (in Fahrenheit)
  averageTemperatureF: number
  averageMaxTempF: number
  averageMinTempF: number
  monthlyTemperatureF: number[]
  temperatureRange: { min: number; max: number }
  temperatureCorrectionFactor: number

  // Weather Patterns
  averageCloudCover: number
  monthlyCloudCover: number[]
  averageHumidity: number
  rainyDays: number

  // Performance Factors
  weatherAdjustmentFactor: number
  degradationRate: number
  seasonalVariation: number[]

  // Climate Summary
  climateZone: string
  solarPotential: "Excellent" | "Very Good" | "Good" | "Fair" | "Poor"
  recommendations: string[]
}

export function ClimateTrendAnalysis({ coordinates, address, onClimateData }: ClimateTrendAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [climateData, setClimateData] = useState<ClimateAnalysis | null>(null)

  const [lat, lng] = coordinates.split(",").map((coord) => Number.parseFloat(coord.trim()))

  const handleAnalysis = async () => {
    if (!coordinates) {
      alert("Please complete address selection first")
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/climate-trend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          coordinates: coordinates,
          address,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setClimateData(data.climateData)
        onClimateData?.(data.climateData)
        console.log("✅ Climate Trend Analysis Results:", data.climateData)
      } else {
        console.error("❌ Climate analysis failed:", data.error)
        alert(`Climate analysis failed: ${data.error}`)
      }
    } catch (error) {
      console.error("❌ Climate analysis error:", error)
      alert("Climate analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatNumber = (num: number, decimals = 1) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  const getSolarPotentialColor = (potential: string) => {
    switch (potential) {
      case "Excellent":
        return "text-green-600"
      case "Very Good":
        return "text-green-500"
      case "Good":
        return "text-blue-500"
      case "Fair":
        return "text-yellow-500"
      case "Poor":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-purple-500" />
            Step 3: Climate Trend Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">
            Analyze 10 years of historical weather data to optimize your solar system performance
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{address}</span>
            <span className="text-gray-400">
              ({lat.toFixed(4)}, {lng.toFixed(4)})
            </span>
          </div>

          <Button
            onClick={handleAnalysis}
            disabled={isAnalyzing || !coordinates}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            size="lg"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Analyzing Climate Trends..." : "Analyze 10-Year Climate Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {climateData && (
        <div className="space-y-6">
          {/* Climate Overview */}
          <Card className="bg-gray-900 border-2 border-purple-400 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-purple-500" />
                Climate Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-white">
                    {formatNumber(climateData.averageIrradiance)} kWh/m²
                  </div>
                  <p className="text-sm font-medium text-gray-200">Daily Solar Irradiance</p>
                  <p className="text-xs text-gray-400">10-year average</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-white">{formatNumber(climateData.averageTemperatureF)}°F</div>
                  <p className="text-sm font-medium text-gray-200">Average Temperature</p>
                  <p className="text-xs text-gray-400">
                    {formatNumber(climateData.temperatureRange.min)}° to{" "}
                    {formatNumber(climateData.temperatureRange.max)}°F
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-white">{formatNumber(climateData.averageCloudCover)}%</div>
                  <p className="text-sm font-medium text-gray-200">Cloud Cover</p>
                  <p className="text-xs text-gray-400">Average daily</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className={`text-3xl font-bold ${getSolarPotentialColor(climateData.solarPotential)}`}>
                    {climateData.solarPotential}
                  </div>
                  <p className="text-sm font-medium text-gray-200">Solar Potential</p>
                  <p className="text-xs text-gray-400">{climateData.climateZone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Factors */}
          <Card className="bg-gray-900 border border-gray-600 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Climate Performance Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Peak Sun Hours:</span>
                    <span>{formatNumber(climateData.peakSunHours)} hours/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Temperature Correction:</span>
                    <span className={climateData.temperatureCorrectionFactor >= 1 ? "text-green-600" : "text-red-600"}>
                      {formatNumber(climateData.temperatureCorrectionFactor * 100, 1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Weather Adjustment:</span>
                    <span className={climateData.weatherAdjustmentFactor >= 0.9 ? "text-green-600" : "text-yellow-600"}>
                      {formatNumber(climateData.weatherAdjustmentFactor * 100, 1)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Average Humidity:</span>
                    <span>{formatNumber(climateData.averageHumidity)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Rainy Days/Year:</span>
                    <span>{climateData.rainyDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Degradation Rate:</span>
                    <span className={climateData.degradationRate <= 0.5 ? "text-green-600" : "text-yellow-600"}>
                      {formatNumber(climateData.degradationRate, 2)}%/year
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Climate Patterns */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Monthly Climate Patterns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Solar Irradiance */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    Solar Irradiance (kWh/m²/day)
                  </h4>
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                    {climateData.monthlyIrradiance.map((irradiance, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs font-medium text-gray-600 mb-1">{monthNames[index]}</div>
                        <div className="bg-yellow-100 border border-yellow-200 rounded p-2">
                          <div className="text-sm font-bold text-yellow-800">{formatNumber(irradiance, 1)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-500" />
                    Average Temperature (°F)
                  </h4>
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                    {climateData.monthlyTemperatureF.map((temp, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs font-medium text-gray-600 mb-1">{monthNames[index]}</div>
                        <div className="bg-red-100 border border-red-200 rounded p-2">
                          <div className="text-sm font-bold text-red-800">{formatNumber(temp, 0)}°F</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cloud Cover */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-gray-500" />
                    Cloud Cover (%)
                  </h4>
                  <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                    {climateData.monthlyCloudCover.map((clouds, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs font-medium text-gray-600 mb-1">{monthNames[index]}</div>
                        <div className="bg-gray-100 border border-gray-200 rounded p-2">
                          <div className="text-sm font-bold text-gray-800">{formatNumber(clouds, 0)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Climate Recommendations */}
          {climateData.recommendations.length > 0 && (
            <Card className="bg-gray-900 border border-gray-600 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  Climate-Based Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {climateData.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 bg-gray-800 rounded-lg border border-gray-600"
                    >
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-white">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
