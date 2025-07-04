"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, lat?: number, lng?: number) => void
  placeholder?: string
  label?: string
  value?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Enter your address",
  label = "Address",
  value = "",
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)

  useEffect(() => {
    initializeGoogleMaps()
  }, [])

  const initializeGoogleMaps = async () => {
    try {
      setIsLoading(true)

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setupAutocomplete()
        setIsGoogleMapsLoaded(true)
        setIsLoading(false)
        return
      }

      // Fetch Google Maps configuration
      const response = await fetch("/api/google-maps-config")
      const config = await response.json()

      if (!config.configured) {
        setGoogleMapsError(config.error || "Google Maps API not configured")
        setIsLoading(false)
        return
      }

      // Load Google Maps script
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=places`
      script.async = true
      script.defer = true

      script.onload = () => {
        setupAutocomplete()
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

  const setupAutocomplete = () => {
    if (!inputRef.current || !window.google) return

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      componentRestrictions: { country: "us" },
    })

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace()

      if (place.formatted_address) {
        const lat = place.geometry?.location?.lat()
        const lng = place.geometry?.location?.lng()

        setInputValue(place.formatted_address)
        onAddressSelect(place.formatted_address, lat, lng)
      }
    })
  }

  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value
    setInputValue(address)

    // For manual input, we don't have coordinates
    onAddressSelect(address)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onAddressSelect(inputValue)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label htmlFor="address">{label}</Label>
        <div className="relative">
          <Input id="address" placeholder="Loading address autocomplete..." disabled className="pl-10" />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="address">{label}</Label>

      {googleMapsError && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{googleMapsError}. You can still enter your address manually below.</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id="address"
          type="text"
          placeholder={isGoogleMapsLoaded ? placeholder : "Enter your address manually"}
          value={inputValue}
          onChange={handleManualInput}
          onKeyPress={handleKeyPress}
          className="pl-10"
        />
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {!isGoogleMapsLoaded && (
        <p className="text-sm text-gray-600">
          Address autocomplete is not available. Please enter your full address manually.
        </p>
      )}
    </div>
  )
}
