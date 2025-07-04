"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { google } from "google-maps"

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, lat?: number, lng?: number) => void
  placeholder?: string
  className?: string
}

interface GoogleMapsConfig {
  configured: boolean
  apiKey?: string
  libraries?: string[]
  error?: string
  message?: string
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Enter your address",
  className = "",
}: AddressAutocompleteProps) {
  const [input, setInput] = useState("")
  const [predictions, setPredictions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false)
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null)
  const [useManualEntry, setUseManualEntry] = useState(false)

  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  useEffect(() => {
    initializeGoogleMaps()
  }, [])

  const initializeGoogleMaps = async () => {
    try {
      // Check if Google Maps is configured
      const configResponse = await fetch("/api/google-maps-config")
      const config: GoogleMapsConfig = await configResponse.json()

      if (!config.configured) {
        console.warn("Google Maps not configured:", config.message)
        setGoogleMapsError(config.message || "Google Maps API not configured")
        setUseManualEntry(true)
        return
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeServices()
        return
      }

      // Load Google Maps script
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=${config.libraries?.join(",") || "places"}`
      script.async = true
      script.defer = true

      script.onload = () => {
        initializeServices()
      }

      script.onerror = () => {
        setGoogleMapsError("Failed to load Google Maps")
        setUseManualEntry(true)
      }

      document.head.appendChild(script)
    } catch (error) {
      console.error("Error initializing Google Maps:", error)
      setGoogleMapsError("Failed to initialize Google Maps")
      setUseManualEntry(true)
    }
  }

  const initializeServices = () => {
    try {
      if (window.google && window.google.maps && window.google.maps.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService()

        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement("div")
        placesService.current = new window.google.maps.places.PlacesService(dummyDiv)

        setGoogleMapsLoaded(true)
        setGoogleMapsError(null)
      } else {
        throw new Error("Google Maps Places API not available")
      }
    } catch (error) {
      console.error("Error initializing Google Maps services:", error)
      setGoogleMapsError("Google Maps services not available")
      setUseManualEntry(true)
    }
  }

  const handleInputChange = async (value: string) => {
    setInput(value)

    if (!googleMapsLoaded || useManualEntry) {
      return
    }

    if (value.length < 3) {
      setPredictions([])
      return
    }

    setIsLoading(true)

    try {
      if (autocompleteService.current) {
        autocompleteService.current.getPlacePredictions(
          {
            input: value,
            types: ["address"],
          },
          (predictions, status) => {
            setIsLoading(false)
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setPredictions(predictions)
            } else {
              setPredictions([])
            }
          },
        )
      }
    } catch (error) {
      console.error("Error getting place predictions:", error)
      setIsLoading(false)
      setPredictions([])
    }
  }

  const handlePredictionSelect = async (prediction: any) => {
    setInput(prediction.description)
    setPredictions([])

    if (!placesService.current) {
      onAddressSelect(prediction.description)
      return
    }

    try {
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ["geometry", "formatted_address"],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const lat = place.geometry?.location?.lat()
            const lng = place.geometry?.location?.lng()
            onAddressSelect(place.formatted_address || prediction.description, lat, lng)
          } else {
            onAddressSelect(prediction.description)
          }
        },
      )
    } catch (error) {
      console.error("Error getting place details:", error)
      onAddressSelect(prediction.description)
    }
  }

  const handleManualSubmit = () => {
    if (input.trim()) {
      onAddressSelect(input.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (useManualEntry) {
        handleManualSubmit()
      } else if (predictions.length > 0) {
        handlePredictionSelect(predictions[0])
      }
    }
  }

  return (
    <div className={`relative ${className}`}>
      {googleMapsError && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{googleMapsError}. You can still enter your address manually.</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {useManualEntry && (
          <Button onClick={handleManualSubmit} disabled={!input.trim()} type="button">
            Use Address
          </Button>
        )}
      </div>

      {!useManualEntry && predictions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1">
          <CardContent className="p-0">
            {predictions.map((prediction, index) => (
              <button
                key={prediction.place_id}
                onClick={() => handlePredictionSelect(prediction)}
                className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm">{prediction.description}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <Card>
            <CardContent className="p-3">
              <div className="text-sm text-gray-500">Searching addresses...</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
