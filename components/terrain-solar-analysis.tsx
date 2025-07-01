"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Mountain, Sun, TrendingUp, Satellite, Loader2, Crown, BarChart3, Compass, Clock } from "lucide-react"
import { getAdvancedSolarAnalysis, formatSolarAnalysis, type SolarAnalysis } from "@/lib/solar-calculations"

interface TerrainSolarAnalysisProps {
  address: string
  coordinates?: string
  onAnalysisComplete: (analysis: SolarAnalysis) => void
}

export function TerrainSolarAnalysis({ address, coordinates, onAnalysisComplete }: TerrainSolarAnalysisProps) {
  const [analysis, setAnalysis] = useState<SolarAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runAnalysis = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getAdvancedSolarAnalysis(address, coordinates)
      setAnalysis(result)
      onAnalysisComplete(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-300">Analyzing terrain and solar conditions...</p>
            <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={runAnalysis} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Satellite className="h-5 w-5 text-blue-500" />
            Advanced Terrain & Solar Analysis
            <Badge className="bg-gradient-to-r from-amber-500 to-blue-500 text-white text-xs">
              <Crown className="h-3 w-3 mr-1" />
              PRO
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Get precise terrain analysis and solar modeling using Google Elevation API and advanced solar
              calculations.
            </p>
            <Button
              onClick={runAnalysis}
              className="bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600"
            >
              <Mountain className="h-4 w-4 mr-2" />
              Analyze Terrain & Solar Conditions
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatted = formatSolarAnalysis(analysis)

  return (
    <div className="space-y-6">
      {/* Location Overview */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MapPin className="h-5 w-5 text-blue-500" />
            Location Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Coordinates</p>
            <p className="text-white font-medium">{formatted.location.coordinates}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Elevation</p>
            <p className="text-white font-medium">{formatted.location.elevation}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Terrain Type</p>
            <Badge className="capitalize">{formatted.location.terrainType}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Terrain Analysis */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mountain className="h-5 w-5 text-green-500" />
            Terrain Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Overall Slope</p>
              <p className="text-white font-medium">{formatted.terrain.overallSlope}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Aspect Direction</p>
              <p className="text-white font-medium flex items-center justify-center gap-1">
                <Compass className="h-4 w-4" />
                {formatted.terrain.aspect}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Terrain Shading</p>
              <p className="text-white font-medium">{formatted.terrain.shadingImpact}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Terrain Impact on Solar Production</span>
              <span className="text-white">{100 - Number.parseInt(formatted.terrain.shadingImpact)}% optimal</span>
            </div>
            <Progress value={100 - Number.parseInt(formatted.terrain.shadingImpact)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Solar Exposure Analysis */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sun className="h-5 w-5 text-amber-500" />
            Solar Exposure Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Annual Average</p>
              <p className="text-white font-medium">{formatted.solarExposure.annualAverage}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Best Month</p>
              <p className="text-white font-medium">{formatted.solarExposure.bestMonth}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Worst Month</p>
              <p className="text-white font-medium">{formatted.solarExposure.worstMonth}</p>
            </div>
          </div>

          {/* Monthly Exposure Chart */}
          <div className="space-y-2">
            <h4 className="text-white font-medium">Seasonal Solar Exposure</h4>
            {analysis.solarExposure.monthlyExposure.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 w-20">{month.month}</span>
                <div className="flex-1 mx-4">
                  <Progress value={(month.effectiveHours / 12) * 100} className="h-2" />
                </div>
                <span className="text-white w-16 text-right">{month.effectiveHours.toFixed(1)}h</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Irradiance */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Hourly Solar Irradiance (Typical Day)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.hourlyIrradiance.map((hour, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 w-16 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {hour.hour}:00
                </span>
                <div className="flex-1 mx-4">
                  <Progress value={(hour.totalIrradiance / 1000) * 100} className="h-2" />
                </div>
                <span className="text-white w-20 text-right">{hour.totalIrradiance} W/m²</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shading Analysis */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Advanced Shading Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Morning Shading</p>
              <p className="text-white font-medium">{analysis.shadingAnalysis.morningShading}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Noon Shading</p>
              <p className="text-white font-medium">{analysis.shadingAnalysis.noonShading}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Evening Shading</p>
              <p className="text-white font-medium">{analysis.shadingAnalysis.eveningShading}%</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-medium">Seasonal Shading Variation</h4>
            {Object.entries(analysis.shadingAnalysis.seasonalVariation).map(([season, shading]) => (
              <div key={season} className="flex items-center justify-between">
                <span className="text-gray-300 w-20 capitalize">{season}</span>
                <div className="flex-1 mx-4">
                  <Progress value={100 - (shading as number)} className="h-2" />
                </div>
                <span className="text-white w-16 text-right">{shading}% shaded</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
