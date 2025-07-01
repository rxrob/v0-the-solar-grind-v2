"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, CheckCircle, XCircle } from "lucide-react"
import { google } from "google-maps"

interface PlacePrediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

interface PlaceDetails {
  formatted_address: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  place_id: string
}

export default function TestAddressAutocompletePage() {
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        const response = await fetch("/api/google-maps-config")
        const config = await response.json()

        if (!config.configured) {
          setError("Google Maps API not configured")
          return
        }

        // Load Google Maps script
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => setGoogleMapsLoaded(true)
        script.onerror = () => setError("Failed to load Google Maps API")
        document.head.appendChild(script)
      } catch (error) {
        setError("Failed to load Google Maps configuration")
      }
    }

    loadGoogleMaps()
  }, [])

  // Search for place predictions
  const searchPlaces = async (searchQuery: string) => {
    if (!googleMapsLoaded || !searchQuery.trim()) {
      setPredictions([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const service = new google.maps.places.AutocompleteService()

      service.getPlacePredictions(
        {
          input: searchQuery,
          types: ["address"],
          componentRestrictions: { country: "us" },
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions)
          } else {
            setPredictions([])
            if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setError(`Places API error: ${status}`)
            }
          }
          setLoading(false)
        },
      )
    } catch (error) {
      setError("Error searching places")
      setLoading(false)
    }
  }

  // Get place details
  const getPlaceDetails = async (placeId: string) => {
    if (!googleMapsLoaded) return

    setLoading(true)
    setError(null)

    try {
      const service = new google.maps.places.PlacesService(document.createElement("div"))

      service.getDetails(
        {
          placeId: placeId,
          fields: ["formatted_address", "geometry", "place_id"],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            setSelectedPlace({
              formatted_address: place.formatted_address || "",
              geometry: {
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                },
              },
              place_id: place.place_id || "",
            })
            setPredictions([])
            setQuery(place.formatted_address || "")
          } else {
            setError(`Place details error: ${status}`)
          }
          setLoading(false)
        },
      )
    } catch (error) {
      setError("Error getting place details")
      setLoading(false)
    }
  }

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, googleMapsLoaded])

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Autocomplete Test
          </CardTitle>
          <div className="flex items-center gap-2">
            {googleMapsLoaded ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Google Maps Loaded
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="h-3 w-3 mr-1" />
                Loading Google Maps...
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Start typing an address..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
                disabled={!googleMapsLoaded}
              />
            </div>

            {/* Predictions Dropdown */}
            {predictions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {predictions.map((prediction) => (
                  <button
                    key={prediction.place_id}
                    onClick={() => getPlaceDetails(prediction.place_id)}
                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                    <div className="text-sm text-muted-foreground">
                      {prediction.structured_formatting.secondary_text}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Searching...
              </div>
            </div>
          )}

          {/* Selected Place Details */}
          {selectedPlace && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <div className="text-sm">{selectedPlace.formatted_address}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Latitude</label>
                    <div className="text-sm">{selectedPlace.geometry.location.lat.toFixed(6)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Longitude</label>
                    <div className="text-sm">{selectedPlace.geometry.location.lng.toFixed(6)}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Place ID</label>
                  <div className="text-xs font-mono bg-gray-100 p-2 rounded">{selectedPlace.place_id}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Start typing an address in the search box above</p>
              <p>2. Select an address from the dropdown suggestions</p>
              <p>3. View the detailed address information and coordinates</p>
              <p>4. This tests the Google Places API integration</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
