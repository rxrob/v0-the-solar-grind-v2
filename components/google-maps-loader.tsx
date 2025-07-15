"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface GoogleMapsConfig {
  apiKey: string
  libraries: string[]
  version: string
}

interface GoogleMapsLoaderProps {
  onLoad?: () => void
  onError?: (error: string) => void
  children?: React.ReactNode
}

export function GoogleMapsLoader({ onLoad, onError, children }: GoogleMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadGoogleMaps() {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          setIsLoaded(true)
          onLoad?.()
          return
        }

        // Fetch the API key from server
        const response = await fetch("/api/maps-config")
        if (!response.ok) {
          throw new Error("Failed to get Google Maps configuration")
        }

        const { config }: { config: GoogleMapsConfig } = await response.json()

        // Create script element
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=${config.libraries.join(",")}&v=${config.version}`
        script.async = true
        script.defer = true

        script.onload = () => {
          if (isMounted) {
            setIsLoaded(true)
            onLoad?.()
          }
        }

        script.onerror = () => {
          if (isMounted) {
            const errorMsg = "Failed to load Google Maps"
            setError(errorMsg)
            onError?.(errorMsg)
          }
        }

        document.head.appendChild(script)

        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script)
          }
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error loading Google Maps"
          setError(errorMsg)
          onError?.(errorMsg)
        }
      }
    }

    loadGoogleMaps()

    return () => {
      isMounted = false
    }
  }, [onLoad, onError])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error loading Google Maps: {error}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-gray-600">Loading Google Maps...</p>
      </div>
    )
  }

  return <>{children}</>
}

// Type declarations for Google Maps
declare global {
  interface Window {
    google: {
      maps: {
        Map: any
        Marker: any
        InfoWindow: any
        LatLng: any
        places: {
          PlacesService: any
          AutocompleteService: any
          PlacesServiceStatus: any
        }
        geometry: {
          spherical: {
            computeDistanceBetween: any
          }
        }
        drawing: {
          DrawingManager: any
          OverlayType: any
        }
      }
    }
  }
}
