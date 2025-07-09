"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Settings, Eye, Camera, Zap, ArrowLeft } from "lucide-react"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import Link from "next/link"
import { VisualAnalysisClient } from "@/components/visual-analysis-client"

const presetLocations = [
  { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194, address: "San Francisco, CA" },
  { name: "Austin, TX", lat: 30.2672, lng: -97.7431, address: "Austin, TX" },
  { name: "Denver, CO", lat: 39.7392, lng: -104.9903, address: "Denver, CO" },
  { name: "Phoenix, AZ", lat: 33.4484, lng: -112.074, address: "Phoenix, AZ" },
  { name: "Miami, FL", lat: 25.7617, lng: -80.1918, address: "Miami, FL" },
]

export function VisualAnalysisPageClient() {
  const [address, setAddress] = useState("")
  const [coordinates, setCoordinates] = useState({ lat: 37.7749, lng: -122.4194 })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [analysisKey, setAnalysisKey] = useState(0)

  const handleAddressSelect = (newAddress: string, newCoordinates: { lat: number; lng: number }) => {
    setAddress(newAddress)
    setCoordinates(newCoordinates)
    setAnalysisKey((prev) => prev + 1)
  }

  const handlePresetLocation = (location: (typeof presetLocations)[0]) => {
    setAddress(location.address)
    setCoordinates({ lat: location.lat, lng: location.lng })
    setAnalysisKey((prev) => prev + 1)
  }

  const handleAnalyze = () => {
    setAnalysisKey((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Visual Roof Analysis</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI-powered solar potential assessment using satellite and street view imagery
          </p>
          <div className="flex items-center justify-center gap-4">
            <Badge variant="default" className="px-3 py-1">
              <Camera className="h-4 w-4 mr-1" />
              Live Imagery
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Zap className="h-4 w-4 mr-1" />
              AI Analysis
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Property Analysis
            </CardTitle>
            <CardDescription>Enter your property address for comprehensive solar analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Property Address
              </Label>
              <div className="flex gap-2">
                <AddressAutocomplete
                  onAddressSelect={handleAddressSelect}
                  placeholder="Enter your property address"
                  className="flex-1"
                />
                <Button onClick={handleAnalyze} className="px-6">
                  Analyze
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quick Locations</Label>
              <div className="flex flex-wrap gap-2">
                {presetLocations.map((location) => (
                  <Button
                    key={location.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetLocation(location)}
                    className="text-xs"
                  >
                    {location.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="advanced"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="advanced">Show Advanced Settings</Label>
              </div>

              {showAdvanced && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="lat">Latitude</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.0001"
                      value={coordinates.lat}
                      onChange={(e) => setCoordinates((prev) => ({ ...prev, lat: Number.parseFloat(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lng">Longitude</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="0.0001"
                      value={coordinates.lng}
                      onChange={(e) => setCoordinates((prev) => ({ ...prev, lng: Number.parseFloat(e.target.value) }))}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <VisualAnalysisClient key={analysisKey} address={address} coordinates={coordinates} />
      </div>
    </div>
  )
}
