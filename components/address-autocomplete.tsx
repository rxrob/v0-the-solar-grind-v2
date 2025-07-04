"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, AlertCircle } from "lucide-react"

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, coordinates?: { lat: number; lng: number }) => void
  placeholder?: string
  label?: string
  required?: boolean
}

interface GoogleMapsConfig {
  configured: boolean
  apiKey?: string
  error?: string
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Enter your address",
  label = "Property Address",
  required = false,
}: AddressAutocompleteProps) {
  const [address, setAddress] = useState("")
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any | null>(null)

  useEffect(() => {
    initializeGoogleMaps()
  }, [])

  const initializeGoogleMaps = async () => {
    try {
      setIsLoading(true)

      // Check if Google Maps is configured
      const configResponse = await fetch("/api/google-maps-config")
      const config: GoogleMapsConfig = await configResponse.json()

      if (!config.configured) {
        setGoogleMapsError(config.error || "Google Maps API not configured")
        setIsLoading(false)
        return
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete()
        setIsGoogleMapsLoaded(true)
        setIsLoading(false)
        return
      }

      // Load Google Maps script
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places`
      script.async = true
      script.defer = true

      script.onload = () => {
        initializeAutocomplete()
        setIsGoogleMapsLoaded(true)
        setIsLoading(false)
      }

      script.onerror = () => {
        setGoogleMapsError("Failed to load Google Maps")
        setIsLoading(false)
      }

      document.head.appendChild(script)
    } catch (error) {
      console.error("Error initializing Google Maps:", error)
      setGoogleMapsError("Failed to initialize Google Maps")
      setIsLoading(false)
    }
  }

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
      })

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place && place.formatted_address) {
          const coordinates = place.geometry?.location
            ? {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }
            : undefined

          setAddress(place.formatted_address)
          onAddressSelect(place.formatted_address, coordinates)
        }
      })
    } catch (error) {
      console.error("Error setting up autocomplete:", error)
      setGoogleMapsError("Failed to setup address autocomplete")
    }
  }

  const handleManualInput = (value: string) => {
    setAddress(value)
    // For manual input, we don't have coordinates
    onAddressSelect(value)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="address">{label}</Label>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-500">Loading address search...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="address">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {googleMapsError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{googleMapsError}. You can still enter your address manually below.</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          id="address"
          type="text"
          placeholder={placeholder}
          value={address}
          onChange={(e) => handleManualInput(e.target.value)}
          className="pl-10"
          required={required}
        />
      </div>

      {!isGoogleMapsLoaded && !googleMapsError && (
        <p className="text-xs text-gray-500">Address autocomplete is loading...</p>
      )}

      {googleMapsError && (
        <p className="text-xs text-gray-500">Manual address entry mode - please type your complete address</p>
      )}
    </div>
  )
}
