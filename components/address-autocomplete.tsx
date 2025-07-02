"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Loader2 } from "lucide-react"

interface AddressResult {
  formatted_address: string
  place_id: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressResult) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

declare global {
  interface Window {
    google: any
    initGoogleMaps: () => void
  }
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Enter an address...",
  className = "",
  disabled = false,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const autocompleteService = useRef<any>(null)
  const placesService = useRef<any>(null)

  // Initialize Google Maps services
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          autocompleteService.current = new window.google.maps.places.AutocompleteService()
          placesService.current = new window.google.maps.places.PlacesService(document.createElement("div"))
          setGoogleMapsLoaded(true)
          return
        }

        // Load Google Maps configuration
        const response = await fetch("/api/google-maps-config")
        const config = await response.json()

        if (!config.configured) {
          console.error("Google Maps API not configured")
          return
        }

        // Load Google Maps script if not already loaded
        if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
          const script = document.createElement("script")
          script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places`
          script.async = true
          script.defer = true
          script.onload = () => {
            autocompleteService.current = new window.google.maps.places.AutocompleteService()
            placesService.current = new window.google.maps.places.PlacesService(document.createElement("div"))
            setGoogleMapsLoaded(true)
          }
          document.head.appendChild(script)
        }
      } catch (error) {
        console.error("Failed to initialize Google Maps:", error)
      }
    }

    initializeGoogleMaps()
  }, [])

  // Search for address predictions
  const searchAddresses = async (searchQuery: string) => {
    if (!googleMapsLoaded || !autocompleteService.current || !searchQuery.trim()) {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    setLoading(true)

    autocompleteService.current.getPlacePredictions(
      {
        input: searchQuery,
        types: ["address"],
        componentRestrictions: { country: "us" },
      },
      (predictions: any, status: any) => {
        setLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions)
          setShowDropdown(true)
        } else {
          setPredictions([])
          setShowDropdown(false)
        }
      },
    )
  }

  // Get detailed place information
  const selectAddress = async (placeId: string) => {
    if (!googleMapsLoaded || !placesService.current) return

    setLoading(true)
    setShowDropdown(false)

    placesService.current.getDetails(
      {
        placeId: placeId,
        fields: ["formatted_address", "geometry", "place_id"],
      },
      (place: any, status: any) => {
        setLoading(false)
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const addressResult: AddressResult = {
            formatted_address: place.formatted_address || "",
            place_id: place.place_id || "",
            geometry: {
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0,
              },
            },
          }

          setQuery(addressResult.formatted_address)
          onAddressSelect(addressResult)
        }
      },
    )
  }

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchAddresses(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, googleMapsLoaded])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false)
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={googleMapsLoaded ? placeholder : "Loading Google Maps..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled || !googleMapsLoaded}
          className="pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Predictions Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              onClick={() => selectAddress(prediction.place_id)}
              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">{prediction.structured_formatting.main_text}</div>
                  <div className="text-xs text-muted-foreground">{prediction.structured_formatting.secondary_text}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
