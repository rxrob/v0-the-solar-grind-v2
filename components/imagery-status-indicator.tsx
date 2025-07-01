"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Satellite, Camera, MapPin, AlertTriangle, CheckCircle } from "lucide-react"

interface ImageryStatusProps {
  address?: string
  coordinates?: { lat: number; lng: number }
}

interface ImageryStatus {
  canLoadSatelliteImages: boolean
  canLoadStreetView: boolean
  usingDemoMode: boolean
  streetViewAvailable?: boolean
  error?: string
}

export function ImageryStatusIndicator({ address, coordinates }: ImageryStatusProps) {
  const [status, setStatus] = useState<ImageryStatus>({
    canLoadSatelliteImages: false,
    canLoadStreetView: false,
    usingDemoMode: true,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const checkImageryStatus = async () => {
      if (!address && !coordinates) return

      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (address) params.append("address", address)
        if (coordinates) {
          params.append("lat", coordinates.lat.toString())
          params.append("lng", coordinates.lng.toString())
        }

        const response = await fetch(`/api/property-images?${params}`)
        const data = await response.json()

        if (data.success) {
          setStatus({
            canLoadSatelliteImages: true,
            canLoadStreetView: data.streetViewAvailable,
            usingDemoMode: false,
            streetViewAvailable: data.streetViewAvailable,
          })
        } else if (data.usingDemo) {
          setStatus({
            canLoadSatelliteImages: false,
            canLoadStreetView: false,
            usingDemoMode: true,
            error: data.error,
          })
        } else {
          setStatus({
            canLoadSatelliteImages: false,
            canLoadStreetView: false,
            usingDemoMode: true,
            error: data.error,
          })
        }
      } catch (error) {
        setStatus({
          canLoadSatelliteImages: false,
          canLoadStreetView: false,
          usingDemoMode: true,
          error: "Failed to check imagery status",
        })
      } finally {
        setLoading(false)
      }
    }

    checkImageryStatus()
  }, [address, coordinates])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Checking imagery availability...</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        {status.usingDemoMode ? (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Demo Mode
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Live Imagery
          </Badge>
        )}

        {status.canLoadSatelliteImages ? (
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            <Satellite className="h-3 w-3 mr-1" />
            Satellite Available
          </Badge>
        ) : (
          <Badge variant="outline" className="text-gray-500 border-gray-200">
            <Satellite className="h-3 w-3 mr-1" />
            Satellite Unavailable
          </Badge>
        )}

        {status.streetViewAvailable ? (
          <Badge variant="outline" className="text-green-600 border-green-200">
            <Camera className="h-3 w-3 mr-1" />
            Street View Available
          </Badge>
        ) : status.canLoadStreetView === false ? (
          <Badge variant="outline" className="text-gray-500 border-gray-200">
            <Camera className="h-3 w-3 mr-1" />
            Street View Unavailable
          </Badge>
        ) : null}

        {address && (
          <Badge variant="outline" className="text-purple-600 border-purple-200">
            <MapPin className="h-3 w-3 mr-1" />
            {address.length > 30 ? `${address.substring(0, 30)}...` : address}
          </Badge>
        )}
      </div>

      {status.error && (
        <Alert variant="destructive" className="text-xs">
          <AlertTriangle className="h-3 w-3" />
          <AlertDescription>{status.error}</AlertDescription>
        </Alert>
      )}

      {status.usingDemoMode && (
        <Alert className="text-xs">
          <AlertTriangle className="h-3 w-3" />
          <AlertDescription>
            Using demo imagery. Configure GOOGLE_MAPS_API_KEY for live property images.
          </AlertDescription>
        </Alert>
      )}

      {!status.usingDemoMode && <div className="text-xs text-gray-500">© Google Maps - Real property imagery</div>}
    </div>
  )
}
