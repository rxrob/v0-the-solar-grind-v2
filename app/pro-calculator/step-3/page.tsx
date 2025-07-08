"use client"

import { useState, useEffect } from "react"
import { useProCalculatorStore } from "@/lib/store"

interface RoofAnalysis {
  pitch: number
  material: string
  orientation: string
  suitableArea: number
  shadingScore: number
  overallScore: number
}

interface SunlightAnalysis {
  peakSunHours: number
  annualIrradiance: number
  seasonalVariation: {
    spring: number
    summer: number
    fall: number
    winter: number
  }
  weatherImpact: number
}

export default function ProCalculatorStep3() {
  const { propertyData, energyData, setAnalysisData } = useProCalculatorStore()
  const [loading, setLoading] = useState(true)
  const [roofAnalysis, setRoofAnalysis] = useState<RoofAnalysis | null>(null)
  const [sunlightAnalysis, setSunlightAnalysis] = useState<SunlightAnalysis | null>(null)

  useEffect(() => {
    const performAnalysis = async () => {
      setLoading(true)

      try {
        // Simulate API calls for roof and sunlight analysis
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Mock roof analysis based on coordinates
        const mockRoofAnalysis: RoofAnalysis = {
          pitch: 25 + Math.random() * 15, // 25-40 degrees
          material: "Asphalt Shingles",
          orientation: "South-Southwest",
          suitableArea: 800 + Math.random() * 400, // 800-1200 sq ft
          shadingScore: 75 + Math.random() * 20, // 75-95
          overallScore: 80 + Math.random() * 15, // 80-95
        }

        // Mock sunlight analysis based on location
        const lat = propertyData.coordinates?.lat || 37.7749
        const baseSunHours = 4.5 + (lat - 30) * 0.1 // Rough calculation based on latitude

        const mockSunlightAnalysis: SunlightAnalysis = {
          peakSunHours: Math.max(3.5, Math.min(7.5, baseSunHours + (Math.random() - 0.5))),
          annualIrradiance: 1400 + Math.random() * 400, // kWh/m²/year
          seasonalVariation: {
            spring: baseSunHours * 0.9,
            summer: baseSunHours * 1.2,
            fall: baseSunHours * 0.8,
            winter: baseSunHours * 0.6,
          },
          weatherImpact: 85 + Math.random() * 10, // 85-95%
        }

        setRoofAnalysis(mockRoofAnalysis)
        setSunlightAnalysis(mockSunlightAnalysis)

        // Calculate overall suitability score
        const suitabilityScore = Math.round(
          mockRoofAnalysis.overallScore * 0.6 + (mockSunlightAnalysis.peakSunHours / 7.5) * 100 * 0.4,
        )

        // Generate recommendations
        const recommendations = []
        const advantages = []
        const considerations = []

        if (mockRoofAnalysis.pitch >= 15 && mockRoofAnalysis.pitch <= 40) {
          advantages.push("Optimal roof pitch for solar panels")
        } else {
          considerations.push("Roof pitch may require special mounting systems")
        }

        if (mockSunlightAnalysis.peakSunHours >= 5) {
          advantages.push("Excellent solar resource availability")
        } else if (mockSunlightAnalysis.peakSunHours >= 4) {
          advantages.push("Good solar resource availability")
        } else {
          considerations.push("Limited solar resource - consider efficiency improvements")
        }

        if (mockRoofAnalysis.shadingScore >= 80) {
          advantages.push("Minimal shading from trees and buildings")
        } else {
          considerations.push("Some shading may impact solar production")
        }

        recommendations.push("Install high-efficiency monocrystalline panels")
        recommendations.push("Consider battery storage for energy independence")
        recommendations.push("Optimize panel placement for maximum sun exposure")

        setAnalysisData({
          roofScore: mockRoofAnalysis.overallScore,
          sunlightHours: mockSunlightAnalysis.peakSunHours,
          suitabilityScore,
          recommendations,
          advantages,
          considerations,
        })
      } catch (error) {
        console.error("Analysis failed:", error)
      } finally {
        setLoading(false)
      }
    }

    if (propertyData.coordinates) {
      performAnalysis()
    }
  }, [propertyData.coordinates, setAnalysisData])

  const getSuitabilityColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getSuitabilityLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    return "Fair"
  }

  if (!propertyData.coordinates) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Missing Property Data</h1>
          <p className="text-gray-300 mb-6">Please complete Step 1 first.</p>
          <a href="/pro-calculator" className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg text-white">
            Go to Step 1
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md shadow-md z-50 px-6 py-4 flex justify-between items-center border-b border-orange-500">
        <a href="/" className="text-xl font-bold text-orange-400">
          SolarAI
        </a>
        <nav className="flex gap-6 items-center text-sm font-semibold">
          <a href="/calculator" className="hover:text-orange-400">
            Free Calculator
          </a>
          <a href="/dashboard" className="hover:text-orange-400">
            Dashboard
          </a>
          <a href="/login" className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-white transition">
            Sign In / Sign Up
          </a>
        </nav>
      </header>

      <main className="min-h-screen bg-black text-white px-8 py-32">
        {/* Progress Indicator */}
        <div className="mb-8 max-w-4xl">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="ml-2 text-green-400 font-semibold">Step 1: Address</span>
            </div>
            <div className="flex-1 h-1 bg-gray-700 rounded">
              <div className="h-1 bg-green-500 rounded w-full"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="ml-2 text-green-400 font-semibold">Step 2: Energy Usage</span>
            </div>
            <div className="flex-1 h-1 bg-gray-700 rounded">
              <div className="h-1 bg-orange-500 rounded w-1/2"></div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="ml-2 text-orange-400 font-semibold">Step 3: Analysis</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-orange-400 mb-6">Step 3: Solar Suitability Analysis</h1>
        <p className="text-gray-300 mb-8 max-w-xl">
          Analyzing your property's roof characteristics and solar potential to determine the best solar solution.
        </p>

        {loading ? (
          <div className="max-w-4xl">
            <div className="bg-gray-900 p-8 rounded-lg text-center">
              <div className="animate-spin text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Property</h3>
              <p className="text-gray-400">Evaluating roof characteristics, sun exposure, and shading patterns...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl space-y-8">
            {/* Overall Suitability Score */}
            {roofAnalysis && sunlightAnalysis && (
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-lg border border-orange-500">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Overall Solar Suitability</h2>
                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${getSuitabilityColor(roofAnalysis.overallScore)}`}>
                        {Math.round(roofAnalysis.overallScore)}
                      </div>
                      <p className="text-gray-400 text-sm">out of 100</p>
                      <p className={`font-semibold ${getSuitabilityColor(roofAnalysis.overallScore)}`}>
                        {getSuitabilityLabel(roofAnalysis.overallScore)}
                      </p>
                    </div>
                    <div className="w-px h-16 bg-gray-600"></div>
                    <div className="text-left space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Roof Score: {Math.round(roofAnalysis.overallScore)}/100</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Sun Hours: {sunlightAnalysis.peakSunHours.toFixed(1)}/day</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">
                          Irradiance: {Math.round(sunlightAnalysis.annualIrradiance)} kWh/m²/year
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Roof Analysis */}
              {roofAnalysis && (
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">🏠 Roof Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Roof Pitch</span>
                      <span className="text-white font-semibold">{Math.round(roofAnalysis.pitch)}°</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          roofAnalysis.pitch >= 15 && roofAnalysis.pitch <= 40
                            ? "bg-green-900 text-green-300"
                            : "bg-yellow-900 text-yellow-300"
                        }`}
                      >
                        {roofAnalysis.pitch >= 15 && roofAnalysis.pitch <= 40 ? "Optimal" : "Acceptable"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Material</span>
                      <span className="text-white font-semibold">{roofAnalysis.material}</span>
                      <span className="text-xs px-2 py-1 rounded bg-green-900 text-green-300">Compatible</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Orientation</span>
                      <span className="text-white font-semibold">{roofAnalysis.orientation}</span>
                      <span className="text-xs px-2 py-1 rounded bg-green-900 text-green-300">Good</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Suitable Area</span>
                      <span className="text-white font-semibold">{Math.round(roofAnalysis.suitableArea)} sq ft</span>
                      <span className="text-xs px-2 py-1 rounded bg-green-900 text-green-300">Excellent</span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Shading Score</span>
                      <span className="text-white font-semibold">{Math.round(roofAnalysis.shadingScore)}/100</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          roofAnalysis.shadingScore >= 80
                            ? "bg-green-900 text-green-300"
                            : roofAnalysis.shadingScore >= 60
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                        }`}
                      >
                        {roofAnalysis.shadingScore >= 80
                          ? "Minimal"
                          : roofAnalysis.shadingScore >= 60
                            ? "Moderate"
                            : "Significant"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sunlight Analysis */}
              {sunlightAnalysis && (
                <div className="bg-gray-900 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">☀️ Sunlight Analysis</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Peak Sun Hours</span>
                      <span className="text-white font-semibold">{sunlightAnalysis.peakSunHours.toFixed(1)}/day</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          sunlightAnalysis.peakSunHours >= 5
                            ? "bg-green-900 text-green-300"
                            : sunlightAnalysis.peakSunHours >= 4
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                        }`}
                      >
                        {sunlightAnalysis.peakSunHours >= 5
                          ? "Excellent"
                          : sunlightAnalysis.peakSunHours >= 4
                            ? "Good"
                            : "Fair"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Annual Irradiance</span>
                      <span className="text-white font-semibold">
                        {Math.round(sunlightAnalysis.annualIrradiance)} kWh/m²
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-green-900 text-green-300">High</span>
                    </div>

                    <div className="p-3 bg-gray-800 rounded">
                      <span className="text-gray-300 block mb-2">Seasonal Variation</span>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Spring:</span>
                          <span className="text-white">{sunlightAnalysis.seasonalVariation.spring.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Summer:</span>
                          <span className="text-white">{sunlightAnalysis.seasonalVariation.summer.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fall:</span>
                          <span className="text-white">{sunlightAnalysis.seasonalVariation.fall.toFixed(1)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Winter:</span>
                          <span className="text-white">{sunlightAnalysis.seasonalVariation.winter.toFixed(1)}h</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                      <span className="text-gray-300">Weather Impact</span>
                      <span className="text-white font-semibold">{Math.round(sunlightAnalysis.weatherImpact)}%</span>
                      <span className="text-xs px-2 py-1 rounded bg-green-900 text-green-300">Favorable</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Insights and Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Advantages */}
              <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                <h4 className="text-green-400 font-semibold mb-3 flex items-center">✅ Advantages</h4>
                <ul className="space-y-2 text-sm text-green-300">
                  <li>• Optimal roof pitch for solar panels</li>
                  <li>• Excellent solar resource availability</li>
                  <li>• Minimal shading from obstacles</li>
                  <li>• Compatible roof material</li>
                  <li>• Good south-facing orientation</li>
                </ul>
              </div>

              {/* Considerations */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 p-6 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-3 flex items-center">⚠️ Considerations</h4>
                <ul className="space-y-2 text-sm text-yellow-300">
                  <li>• Seasonal variation in sun hours</li>
                  <li>• Weather impact on production</li>
                  <li>• Roof age and condition check needed</li>
                  <li>• Local permitting requirements</li>
                  <li>• Utility interconnection process</li>
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-lg">
                <h4 className="text-blue-400 font-semibold mb-3 flex items-center">💡 Recommendations</h4>
                <ul className="space-y-2 text-sm text-blue-300">
                  <li>• Install high-efficiency panels</li>
                  <li>• Consider battery storage</li>
                  <li>• Optimize panel placement</li>
                  <li>• Schedule professional assessment</li>
                  <li>• Explore financing options</li>
                </ul>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <a
                href="/pro-calculator/step-2"
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
              >
                ← Back to Step 2
              </a>

              <a
                href="/pro-calculator/step-4"
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 text-lg shadow-lg"
              >
                Continue to Step 4: System Design →
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
