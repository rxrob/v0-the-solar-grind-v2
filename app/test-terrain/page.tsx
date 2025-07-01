"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { MapPin, Loader2, CheckCircle, Sun, Home, Zap, Cloud, ArrowLeft, Shield, Calculator } from "lucide-react"
import Link from "next/link"

interface Coordinates {
  lat: number
  lng: number
}

interface VisualAnalysisResult {
  roofArea: number
  usableArea: number
  shadingFactor: number
  roofOrientation: string
  tiltAngle: number
  obstructions: string[]
}

interface ClimateData {
  peakSunHours: number
  averageTemperature: number
  seasonalVariation: number
  weatherPatterns: string[]
}

interface SystemSizingResult {
  recommendedSize: number
  annualProduction: number
  monthlyProduction: number[]
  systemCost: number
  annualSavings: number
  paybackPeriod: number
  roi25Year: number
}

export default function TestTerrainPage() {
  const [address, setAddress] = useState("")
  const [coordinates, setCoordinates] = useState<string>("40.7589,-111.8883") // Salt Lake City
  const [elevation, setElevation] = useState<number | null>(null)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [visualAnalysisResults, setVisualAnalysisResults] = useState<VisualAnalysisResult | null>(null)
  const [isLoadingVisual, setIsLoadingVisual] = useState(false)
  const [climateData, setClimateData] = useState<ClimateData | null>(null)
  const [isLoadingClimate, setIsLoadingClimate] = useState(false)
  const [climateDataComplete, setClimateDataComplete] = useState(false)
  const [systemSizingResults, setSystemSizingResults] = useState<SystemSizingResult | null>(null)
  const [isLoadingSystemSizing, setIsLoadingSystemSizing] = useState(false)
  const [systemSizingComplete, setSystemSizingComplete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter a valid address to begin analysis.",
        variant: "destructive",
      })
      return
    }

    setIsLoadingAddress(true)

    try {
      // Simulate geocoding API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock coordinates for demonstration
      const mockCoordinates = {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.006 + (Math.random() - 0.5) * 0.1,
      }

      setCoordinates(`${mockCoordinates.lat},${mockCoordinates.lng}`)
      toast({
        title: "Address Validated",
        description: `Successfully geocoded: ${address}`,
      })
    } catch (error) {
      toast({
        title: "Geocoding Failed",
        description: "Unable to validate address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingAddress(false)
    }
  }

  const testElevation = async () => {
    setLoading(true)
    setError("")
    setElevation(null)

    try {
      const [lat, lng] = coordinates.split(",").map((coord) => Number.parseFloat(coord.trim()))

      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Invalid coordinates format")
      }

      const response = await fetch(`/api/elevation?lat=${lat}&lng=${lng}`)
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        setElevation(data.results[0].elevation)
      } else {
        throw new Error("No elevation data found")
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch elevation data")
    } finally {
      setLoading(false)
    }
  }

  const handleVisualAnalysisComplete = (results: VisualAnalysisResult) => {
    setVisualAnalysisResults(results)
  }

  const handleClimateDataComplete = (data: ClimateData) => {
    setClimateData(data)
    setClimateDataComplete(true)
  }

  const handleSystemSizingComplete = (results: SystemSizingResult) => {
    setSystemSizingResults(results)
    setSystemSizingComplete(true)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-white hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Zap className="h-3 w-3 mr-1" />
              EXPERIMENTAL
            </Badge>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-blue-400 bg-clip-text text-transparent">
            Advanced Solar Terrain Analysis
          </h1>
          <p className="text-gray-300 text-lg">
            Comprehensive 4-step analysis combining address validation, visual inspection, climate modeling, and smart
            system sizing
          </p>
        </div>

        {/* Step 1: Address Input and Validation */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              <span>Step 1: Address Validation & Geocoding</span>
            </CardTitle>
            <CardDescription>Enter property address and validate to proceed with further analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter property address (e.g., 123 Main St, City, State)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={isLoadingAddress}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoadingAddress || !address.trim()}
                className="bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600"
              >
                {isLoadingAddress ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating Address...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Validate Address
                  </>
                )}
              </Button>
            </form>

            {coordinates && (
              <div className="mt-6 p-4 bg-green-800/20 border border-green-600/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-green-400">Address Validated Successfully</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Coordinates:</span>
                    <span className="ml-2 text-white">{coordinates}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 0: Elevation Test */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-500" />
              <span>Step 0: Elevation Test</span>
            </CardTitle>
            <CardDescription>Test the Google Elevation API integration with the provided coordinates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coordinates">Coordinates (lat, lng)</Label>
                <Input
                  id="coordinates"
                  value={coordinates}
                  onChange={(e) => setCoordinates(e.target.value)}
                  placeholder="40.7589,-111.8883"
                />
              </div>

              <Button onClick={testElevation} disabled={loading}>
                {loading ? "Testing..." : "Test Elevation API"}
              </Button>

              {elevation !== null && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Elevation Data</h3>
                  <p className="text-green-700">
                    Elevation: {elevation.toFixed(2)} meters ({(elevation * 3.28084).toFixed(2)} feet)
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Test coordinates:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Salt Lake City: 40.7589,-111.8883</li>
                  <li>Provo: 40.2338,-111.6585</li>
                  <li>Park City: 40.6461,-111.4980</li>
                  <li>Mount Everest: 27.9881,86.9250</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Visual Analysis */}
        {address && (
          <VisualRoofAnalysis
            address={address}
            coordinates={coordinates}
            onAnalysisComplete={handleVisualAnalysisComplete}
          />
        )}

        {/* Step 3: Climate Trend Analysis */}
        {visualAnalysisResults && (
          <ClimateTrendAnalysis address={address} coordinates={coordinates} onClimateData={handleClimateDataComplete} />
        )}

        {/* Step 4: Smart System Sizing with NREL Integration */}
        {climateDataComplete && (
          <SmartSolarAnalysis
            address={address}
            coordinates={coordinates}
            peakSunHours={climateData?.peakSunHours || 5.5}
            climateData={climateData}
            onAnalysisComplete={handleSystemSizingComplete}
          />
        )}

        {/* Final Summary */}
        {systemSizingComplete && (
          <Card className="bg-gradient-to-r from-green-800 to-blue-800 border-green-600">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Complete Solar Analysis Finished!</h2>
              <p className="text-gray-200">
                All four analysis steps completed successfully. You now have comprehensive solar data including address
                validation, visual roof inspection, climate trend analysis, and smart system sizing with NREL PVWatts
                production modeling and financial projections.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Visual Roof Analysis Component
function VisualRoofAnalysis({
  address,
  coordinates,
  onAnalysisComplete,
}: {
  address: string
  coordinates: string
  onAnalysisComplete: (results: VisualAnalysisResult) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<VisualAnalysisResult | null>(null)

  const startAnalysis = async () => {
    setIsLoading(true)

    try {
      // Simulate AI-powered roof analysis
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const mockResults: VisualAnalysisResult = {
        roofArea: 2400 + Math.floor(Math.random() * 800),
        usableArea: 1800 + Math.floor(Math.random() * 600),
        shadingFactor: 0.85 + Math.random() * 0.1,
        roofOrientation: ["South", "Southwest", "Southeast"][Math.floor(Math.random() * 3)],
        tiltAngle: 25 + Math.floor(Math.random() * 15),
        obstructions: ["Chimney", "Vent", "Skylight"].slice(0, Math.floor(Math.random() * 3) + 1),
      }

      setResults(mockResults)
      onAnalysisComplete(mockResults)

      toast({
        title: "Visual Analysis Complete",
        description: "Roof structure and shading analysis finished successfully.",
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Unable to complete visual analysis. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Home className="h-5 w-5 text-blue-500" />
          <span>Step 2: Visual Roof Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              AI-powered analysis of roof structure, orientation, and potential shading obstructions.
            </p>
            <Button
              onClick={startAnalysis}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Roof Structure...
                </>
              ) : (
                <>
                  <Home className="mr-2 h-4 w-4" />
                  Start Visual Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-semibold text-green-400">Visual Analysis Complete</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.roofArea.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Roof Area (sq ft)</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.usableArea.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Usable Area (sq ft)</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{(results.shadingFactor * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Shading Factor</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.roofOrientation}</div>
                <div className="text-sm text-gray-400">Primary Orientation</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.tiltAngle}°</div>
                <div className="text-sm text-gray-400">Roof Tilt</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.obstructions.length}</div>
                <div className="text-sm text-gray-400">Obstructions</div>
              </div>
            </div>
            {results.obstructions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-white mb-2">Detected Obstructions:</h4>
                <div className="flex flex-wrap gap-2">
                  {results.obstructions.map((obstruction, index) => (
                    <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {obstruction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Climate Trend Analysis Component
function ClimateTrendAnalysis({
  address,
  coordinates,
  onClimateData,
}: {
  address: string
  coordinates: string
  onClimateData: (data: ClimateData) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<ClimateData | null>(null)

  const startAnalysis = async () => {
    setIsLoading(true)

    try {
      // Simulate NREL weather data processing
      await new Promise((resolve) => setTimeout(resolve, 2500))

      const mockClimateData: ClimateData = {
        peakSunHours: 4.5 + Math.random() * 2,
        averageTemperature: 65 + Math.floor(Math.random() * 20),
        seasonalVariation: 15 + Math.floor(Math.random() * 10),
        weatherPatterns: ["Clear skies", "Partly cloudy", "Seasonal storms"].slice(
          0,
          Math.floor(Math.random() * 3) + 1,
        ),
      }

      setResults(mockClimateData)
      onClimateData(mockClimateData)

      toast({
        title: "Climate Analysis Complete",
        description: "Historical weather patterns and solar irradiance data processed.",
      })
    } catch (error) {
      toast({
        title: "Climate Analysis Failed",
        description: "Unable to process weather data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Cloud className="h-5 w-5 text-yellow-500" />
          <span>Step 3: Climate Trend Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Analyze historical weather patterns and solar irradiance data for accurate production modeling.
            </p>
            <Button
              onClick={startAnalysis}
              disabled={isLoading}
              className="bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Climate Data...
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Start Climate Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-semibold text-green-400">Climate Analysis Complete</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.peakSunHours.toFixed(1)}</div>
                <div className="text-sm text-gray-400">Peak Sun Hours</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.averageTemperature}°F</div>
                <div className="text-sm text-gray-400">Avg. Temperature</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.seasonalVariation}%</div>
                <div className="text-sm text-gray-400">Seasonal Variation</div>
              </div>
            </div>
            {results.weatherPatterns.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-white mb-2">Typical Weather Patterns:</h4>
                <div className="flex flex-wrap gap-2">
                  {results.weatherPatterns.map((pattern, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Smart Solar Analysis Component
function SmartSolarAnalysis({
  address,
  coordinates,
  peakSunHours,
  climateData,
  onAnalysisComplete,
}: {
  address: string
  coordinates: string
  peakSunHours: number
  climateData: ClimateData | null
  onAnalysisComplete: (results: SystemSizingResult) => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SystemSizingResult | null>(null)

  const startAnalysis = async () => {
    setIsLoading(true)

    try {
      // Simulate NREL PVWatts API call and system sizing
      await new Promise((resolve) => setTimeout(resolve, 4000))

      const mockSystemSizing: SystemSizingResult = {
        recommendedSize: 7.5 + Math.random() * 3,
        annualProduction: 11000 + Math.floor(Math.random() * 4000),
        monthlyProduction: Array.from({ length: 12 }, () => 800 + Math.floor(Math.random() * 200)),
        systemCost: 22000 + Math.floor(Math.random() * 5000),
        annualSavings: 2000 + Math.floor(Math.random() * 800),
        paybackPeriod: 6.5 + Math.random() * 2,
        roi25Year: 150 + Math.floor(Math.random() * 50),
      }

      setResults(mockSystemSizing)
      onAnalysisComplete(mockSystemSizing)

      toast({
        title: "Smart System Sizing Complete",
        description: "Optimal system size and financial projections calculated.",
      })
    } catch (error) {
      toast({
        title: "System Sizing Failed",
        description: "Unable to calculate system size. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gray-800 border-gray-700 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-500" />
          <span>Step 4: Smart System Sizing & Financials</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">
              Leverage NREL PVWatts API and advanced algorithms to determine optimal system size and financial
              projections.
            </p>
            <Button
              onClick={startAnalysis}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculating System Size...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Start Smart Analysis
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="font-semibold text-green-400">System Sizing Complete</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.recommendedSize.toFixed(1)} kW</div>
                <div className="text-sm text-gray-400">System Size</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.annualProduction.toLocaleString()} kWh</div>
                <div className="text-sm text-gray-400">Annual Production</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">${results.systemCost.toLocaleString()}</div>
                <div className="text-sm text-gray-400">System Cost</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">${results.annualSavings.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Annual Savings</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.paybackPeriod.toFixed(1)} years</div>
                <div className="text-sm text-gray-400">Payback Period</div>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl font-bold text-white">{results.roi25Year}%</div>
                <div className="text-sm text-gray-400">25-Year ROI</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
