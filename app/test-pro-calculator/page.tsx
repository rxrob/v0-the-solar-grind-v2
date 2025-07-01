"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, MapPin, Compass } from "lucide-react"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import Image from "next/image"

interface ImageStatus {
  loading: boolean
  loaded: boolean
  error: string | null
  url: string | null
  apiUrl?: string
}

export default function TestProCalculatorPage() {
  const [selectedAddress, setSelectedAddress] = useState("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [placeId, setPlaceId] = useState("")

  const [roofImage, setRoofImage] = useState<ImageStatus>({
    loading: false,
    loaded: false,
    error: null,
    url: null,
  })

  const [streetViews, setStreetViews] = useState<Record<string, ImageStatus>>({
    north: { loading: false, loaded: false, error: null, url: null },
    east: { loading: false, loaded: false, error: null, url: null },
    south: { loading: false, loaded: false, error: null, url: null },
    west: { loading: false, loaded: false, error: null, url: null },
  })

  const handleAddressSelect = (address: string, coords: { lat: number; lng: number }, placeIdValue: string) => {
    setSelectedAddress(address)
    setCoordinates(coords)
    setPlaceId(placeIdValue)
    console.log("🏠 Address selected:", { address, coords, placeIdValue })
  }

  const loadPropertyImages = async () => {
    if (!coordinates) {
      console.error("No coordinates available")
      return
    }

    // Load roof close-up
    setRoofImage({ loading: true, loaded: false, error: null, url: null })

    try {
      const roofApiUrl = `/api/aerial-view?lat=${coordinates.lat}&lng=${coordinates.lng}&zoom=21&size=640x640`
      const roofResponse = await fetch(roofApiUrl)

      if (roofResponse.ok) {
        const roofBlob = await roofResponse.blob()
        const roofUrl = URL.createObjectURL(roofBlob)
        setRoofImage({ loading: false, loaded: true, error: null, url: roofUrl, apiUrl: roofApiUrl })
      } else {
        setRoofImage({ loading: false, loaded: false, error: "Failed to load roof image", url: null })
      }
    } catch (error) {
      setRoofImage({
        loading: false,
        loaded: false,
        error: error instanceof Error ? error.message : "Unknown error",
        url: null,
      })
    }

    // Load street views from 4 directions
    const directions = [
      { key: "north", heading: 0, name: "North View" },
      { key: "east", heading: 90, name: "East View" },
      { key: "south", heading: 180, name: "South View" },
      { key: "west", heading: 270, name: "West View" },
    ]

    for (const direction of directions) {
      setStreetViews((prev) => ({
        ...prev,
        [direction.key]: { loading: true, loaded: false, error: null, url: null },
      }))

      try {
        const streetApiUrl = `/api/street-view?lat=${coordinates.lat}&lng=${coordinates.lng}&heading=${direction.heading}&pitch=10&fov=90&size=400x300`
        const streetResponse = await fetch(streetApiUrl)

        if (streetResponse.ok) {
          const streetBlob = await streetResponse.blob()
          const streetUrl = URL.createObjectURL(streetBlob)
          setStreetViews((prev) => ({
            ...prev,
            [direction.key]: { loading: false, loaded: true, error: null, url: streetUrl, apiUrl: streetApiUrl },
          }))
        } else {
          setStreetViews((prev) => ({
            ...prev,
            [direction.key]: { loading: false, loaded: false, error: "Failed to load street view", url: null },
          }))
        }
      } catch (error) {
        setStreetViews((prev) => ({
          ...prev,
          [direction.key]: {
            loading: false,
            loaded: false,
            error: error instanceof Error ? error.message : "Unknown error",
            url: null,
          },
        }))
      }
    }
  }

  const getStatusBadge = (status: ImageStatus) => {
    if (status.loading) return <Badge variant="secondary">Loading...</Badge>
    if (status.loaded) return <Badge className="bg-green-500">Loaded</Badge>
    if (status.error) return <Badge variant="destructive">Error</Badge>
    return <Badge variant="outline">Not Loaded</Badge>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Pro Solar Calculator Test</h1>
          <p className="text-gray-600">Test Google Maps integration and property image loading</p>
        </div>

        {/* Address Input */}
        <Card>
          <CardHeader>
            <CardTitle>Property Address</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              placeholder="Enter property address (e.g., 1600 Amphitheatre Parkway, Mountain View, CA)"
              label="Property Address"
            />
          </CardContent>
        </Card>

        {/* Selected Address Details */}
        {selectedAddress && coordinates && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Selected Property Details
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="bg-white">
                <CardContent className="pt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-700">Address</p>
                    <p className="text-sm text-gray-900 break-all">{selectedAddress}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="pt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-700">Coordinates</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="pt-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-700">Place ID</p>
                    <p className="text-sm text-gray-900 font-mono break-all">{placeId}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Load Images Button */}
        {coordinates && (
          <div className="flex justify-center">
            <Button onClick={loadPropertyImages} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Eye className="h-5 w-5 mr-2" />
              Load 5 Property Images
            </Button>
          </div>
        )}

        {/* Roof Close-up */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Roof Close-up (Eagle View)
              </CardTitle>
              {getStatusBadge(roofImage)}
            </div>
          </CardHeader>
          <CardContent>
            {roofImage.url ? (
              <div className="space-y-4">
                <div className="relative w-full max-w-2xl mx-auto">
                  <Image
                    src={roofImage.url || "/placeholder.svg"}
                    alt="Roof close-up view"
                    width={640}
                    height={640}
                    className="w-full h-auto rounded-lg border"
                  />
                </div>
                {process.env.NODE_ENV === "development" && roofImage.apiUrl && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <p className="font-mono break-all">API URL: {roofImage.apiUrl}</p>
                  </div>
                )}
              </div>
            ) : roofImage.loading ? (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading roof view...</p>
                </div>
              </div>
            ) : roofImage.error ? (
              <div className="w-full h-64 bg-red-50 rounded-lg flex items-center justify-center">
                <p className="text-red-600">Error: {roofImage.error}</p>
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Click "Load 5 Property Images" to view roof</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Street Views Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-5 w-5" />
              Directional Street Views (Shading Analysis)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: "north", name: "North View (0°)", description: "View from north side" },
                { key: "east", name: "East View (90°)", description: "Morning sun direction" },
                { key: "south", name: "South View (180°)", description: "Peak sun direction" },
                { key: "west", name: "West View (270°)", description: "Evening sun direction" },
              ].map((direction) => {
                const status = streetViews[direction.key]
                return (
                  <div key={direction.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{direction.name}</h4>
                      {getStatusBadge(status)}
                    </div>
                    <p className="text-sm text-gray-600">{direction.description}</p>
                    {status.url ? (
                      <div className="space-y-2">
                        <Image
                          src={status.url || "/placeholder.svg"}
                          alt={direction.name}
                          width={400}
                          height={300}
                          className="w-full h-auto rounded-lg border"
                        />
                        {process.env.NODE_ENV === "development" && status.apiUrl && (
                          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            <p className="font-mono break-all">API URL: {status.apiUrl}</p>
                          </div>
                        )}
                      </div>
                    ) : status.loading ? (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Loading...</p>
                        </div>
                      </div>
                    ) : status.error ? (
                      <div className="w-full h-48 bg-red-50 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-red-600">Error: {status.error}</p>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                        <p className="text-sm text-gray-500">Not loaded</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        {process.env.NODE_ENV === "development" && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm font-mono">
                <p>Google Maps Ready: {typeof window !== "undefined" && window.googleMapsReady ? "✅ Yes" : "❌ No"}</p>
                <p>Google Object Available: {typeof window !== "undefined" && window.google ? "✅ Yes" : "❌ No"}</p>
                <p>
                  Places API Available:{" "}
                  {typeof window !== "undefined" && window.google?.maps?.places ? "✅ Yes" : "❌ No"}
                </p>
                <p>Selected Address: {selectedAddress || "None"}</p>
                <p>Coordinates: {coordinates ? `${coordinates.lat}, ${coordinates.lng}` : "None"}</p>
                <p>Place ID: {placeId || "None"}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
