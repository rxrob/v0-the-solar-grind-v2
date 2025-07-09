"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, CheckCircle, XCircle } from "lucide-react"
import type { google } from "google-maps"

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
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load Google Maps API and Places Widget
  useEffect(() => {
    const loadScripts = async () => {
      try {
        const response = await fetch("/api/google-maps-config")
        const config = await response.json()

        if (!config.configured) {
          setError("Google Maps API not configured")
          return
        }

        // Load Google Maps script
        const mapsScript = document.createElement("script")
        mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places,marker&v=beta`
        mapsScript.async = true
        mapsScript.defer = true
        mapsScript.onload = () => setGoogleMapsLoaded(true)
        mapsScript.onerror = () => setError("Failed to load Google Maps API")
        document.head.appendChild(mapsScript)

        // Load Places Widget module from unpkg
        const widgetScript = document.createElement("script")
        widgetScript.src = "https://unpkg.com/@googlemaps/places-widget"
        widgetScript.type = "module"
        widgetScript.async = true
        document.head.appendChild(widgetScript)
      } catch (error) {
        setError("Failed to load Google Maps configuration")
      }
    }

    loadScripts()
  }, [])

  const handlePlaceChange = (event: CustomEvent<{ value: google.maps.places.Place | null }>) => {
    const place = event.detail.value
    if (place && place.geometry && place.geometry.location) {
      setSelectedPlace({
        formatted_address: place.formatted_address || "",
        geometry: {
          location: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          },
        },
        place_id: place.place_id || "",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Autocomplete Test (Modern)
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

          <div className="relative">
            {googleMapsLoaded ? (
              <gmpx-place-autocomplete
                onPlaceChange={handlePlaceChange}
                placeholder="Start typing an address..."
                className="w-full"
              ></gmpx-place-autocomplete>
            ) : (
              <div className="w-full p-3 border rounded-md bg-gray-100 text-gray-500">Loading Autocomplete...</div>
            )}
          </div>

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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Start typing an address in the search box above</p>
              <p>2. Select an address from the dropdown suggestions</p>
              <p>3. View the detailed address information and coordinates</p>
              <p>4. This tests the modern Google Places Autocomplete Web Component</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
