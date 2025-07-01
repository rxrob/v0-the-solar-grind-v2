"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sun,
  Zap,
  TrendingUp,
  Calendar,
  CloudRain,
  BarChart3,
  Settings,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"

interface NRELPVWattsAnalysisProps {
  address: string
  coordinates: string
  onAnalysisComplete?: (data: any) => void
}

export function NRELPVWattsAnalysis({ address, coordinates, onAnalysisComplete }: NRELPVWattsAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [systemParams, setSystemParams] = useState({
    systemSizeKw: "10",
    tilt: "30",
    azimuth: "180", // South-facing
    arrayType: "1", // Fixed Open Rack
    moduleType: "0", // Standard
    losses: "14",
  })

  const handleAnalysis = async () => {
    if (!address && !coordinates) {
      alert("Please enter an address first")
      return
    }

    setIsAnalyzing(true)
    try {
      console.log("🌞 Starting NREL PVWatts analysis...")

      const response = await fetch("/api/nrel-pvwatts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          coordinates,
          ...systemParams,
        }),
      })

      const data = await response.json()
      console.log("📊 NREL Analysis complete:", data)

      if (data.success) {
        setAnalysisData(data)
        onAnalysisComplete?.(data)
      } else {
        alert(`Analysis failed: ${data.error}`)
      }
    } catch (error) {
      console.error("❌ NREL Analysis error:", error)
      alert("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(Math.round(num))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* System Configuration */}
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="h-5 w-5 mr-2 text-blue-500" />
            Step 3: NREL PVWatts System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="systemSize" className="text-gray-100">
                System Size (kW)
              </Label>
              <Input
                id="systemSize"
                type="number"
                step="0.1"
                value={systemParams.systemSizeKw}
                onChange={(e) => setSystemParams((prev) => ({ ...prev, systemSizeKw: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="tilt" className="text-gray-100">
                Tilt Angle (°)
              </Label>
              <Input
                id="tilt"
                type="number"
                min="0"
                max="90"
                value={systemParams.tilt}
                onChange={(e) => setSystemParams((prev) => ({ ...prev, tilt: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="azimuth" className="text-gray-100">
                Azimuth (°)
              </Label>
              <Input
                id="azimuth"
                type="number"
                min="0"
                max="360"
                value={systemParams.azimuth}
                onChange={(e) => setSystemParams((prev) => ({ ...prev, azimuth: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">180° = South, 270° = West</p>
            </div>
            <div>
              <Label htmlFor="arrayType" className="text-gray-100">
                Array Type
              </Label>
              <Select
                value={systemParams.arrayType}
                onValueChange={(value) => setSystemParams((prev) => ({ ...prev, arrayType: value }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Fixed Open Rack</SelectItem>
                  <SelectItem value="1">Fixed Roof Mount</SelectItem>
                  <SelectItem value="2">1-Axis Tracking</SelectItem>
                  <SelectItem value="4">2-Axis Tracking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="moduleType" className="text-gray-100">
                Module Type
              </Label>
              <Select
                value={systemParams.moduleType}
                onValueChange={(value) => setSystemParams((prev) => ({ ...prev, moduleType: value }))}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Standard</SelectItem>
                  <SelectItem value="1">Premium</SelectItem>
                  <SelectItem value="2">Thin Film</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="losses" className="text-gray-100">
                System Losses (%)
              </Label>
              <Input
                id="losses"
                type="number"
                min="0"
                max="50"
                value={systemParams.losses}
                onChange={(e) => setSystemParams((prev) => ({ ...prev, losses: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <Button
            onClick={handleAnalysis}
            disabled={isAnalyzing || (!address && !coordinates)}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running NREL PVWatts Analysis...
              </>
            ) : (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Run NREL PVWatts Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Annual Production</p>
                    <p className="text-2xl font-bold text-green-400">{formatNumber(analysisData.production.annual)}</p>
                    <p className="text-xs text-gray-400">kWh/year</p>
                  </div>
                  <Zap className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Capacity Factor</p>
                    <p className="text-2xl font-bold text-blue-400">{analysisData.performance.capacityFactor}%</p>
                    <p className="text-xs text-gray-400">efficiency</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Specific Yield</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {formatNumber(analysisData.performance.specificYield)}
                    </p>
                    <p className="text-xs text-gray-400">kWh/kW</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Performance Ratio</p>
                    <p className="text-2xl font-bold text-amber-400">{analysisData.performance.performanceRatio}%</p>
                    <p className="text-xs text-gray-400">vs ideal</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="monthly" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-800">
              <TabsTrigger value="monthly" className="data-[state=active]:bg-gray-700">
                Monthly
              </TabsTrigger>
              <TabsTrigger value="seasonal" className="data-[state=active]:bg-gray-700">
                Seasonal
              </TabsTrigger>
              <TabsTrigger value="losses" className="data-[state=active]:bg-gray-700">
                Losses
              </TabsTrigger>
              <TabsTrigger value="weather" className="data-[state=active]:bg-gray-700">
                Weather
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monthly" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Monthly Production Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData.production.monthly.map((month: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-medium">{month.month}</span>
                            <span className="text-green-400 font-semibold">{formatNumber(month.production)} kWh</span>
                          </div>
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Daily Avg: {formatNumber(month.dailyAverage)} kWh</span>
                            <span>Sun Hours: {month.peakSunHours.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-900/20 border border-green-700 rounded">
                      <h4 className="text-green-400 font-medium mb-2">Best Month</h4>
                      <p className="text-white text-lg font-semibold">{analysisData.production.bestMonth.month}</p>
                      <p className="text-green-400">{formatNumber(analysisData.production.bestMonth.production)} kWh</p>
                    </div>
                    <div className="p-4 bg-blue-900/20 border border-blue-700 rounded">
                      <h4 className="text-blue-400 font-medium mb-2">Lowest Month</h4>
                      <p className="text-white text-lg font-semibold">{analysisData.production.worstMonth.month}</p>
                      <p className="text-blue-400">{formatNumber(analysisData.production.worstMonth.production)} kWh</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seasonal" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Sun className="h-5 w-5 mr-2 text-amber-500" />
                    Seasonal Production Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analysisData.production.seasonal.map((season: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-700 rounded text-center">
                        <h4 className="text-white font-medium mb-2">{season.season}</h4>
                        <p className="text-2xl font-bold text-blue-400 mb-1">{season.percentage}%</p>
                        <p className="text-sm text-gray-400">{formatNumber(season.production)} kWh</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Avg: {formatNumber(season.averageMonthly)} kWh/month
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="losses" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                    System Loss Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analysisData.losses).map(([key, value]: [string, any]) => {
                      if (key === "totalSystemLoss") return null
                      const lossName = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
                      const lossValue = typeof value === "number" ? value : 0

                      return (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                          <span className="text-gray-300">{lossName.replace("Loss", "")} Loss</span>
                          <div className="flex items-center space-x-3">
                            <Progress value={Math.min(lossValue, 20)} className="w-24" />
                            <span className="text-white font-medium w-12 text-right">{lossValue.toFixed(1)}%</span>
                          </div>
                        </div>
                      )
                    })}

                    <div className="mt-4 p-4 bg-red-900/20 border border-red-700 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-red-400 font-medium">Total System Losses</span>
                        <span className="text-red-400 font-bold text-lg">{analysisData.losses.totalSystemLoss}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weather" className="space-y-4">
              <Card className="bg-gray-800 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CloudRain className="h-5 w-5 mr-2 text-blue-500" />
                    Weather & Location Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-700 rounded">
                      <h4 className="text-gray-400 text-sm mb-1">Location</h4>
                      <p className="text-white font-medium">
                        {analysisData.weather.location.lat.toFixed(4)}, {analysisData.weather.location.lon.toFixed(4)}
                      </p>
                      <p className="text-gray-400 text-sm">Elevation: {analysisData.weather.location.elevation}m</p>
                    </div>

                    <div className="p-4 bg-gray-700 rounded">
                      <h4 className="text-gray-400 text-sm mb-1">Annual Solar Irradiance</h4>
                      <p className="text-amber-400 font-bold text-lg">
                        {analysisData.weather.climate.annualSolarIrradiance.toFixed(1)}
                      </p>
                      <p className="text-gray-400 text-sm">kWh/m²/year</p>
                    </div>

                    <div className="p-4 bg-gray-700 rounded">
                      <h4 className="text-gray-400 text-sm mb-1">Daily Average</h4>
                      <p className="text-blue-400 font-bold text-lg">
                        {analysisData.weather.climate.averageDailyIrradiance.toFixed(1)}
                      </p>
                      <p className="text-gray-400 text-sm">kWh/m²/day</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
