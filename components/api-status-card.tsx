"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface ApiStatus {
  elevationApi: boolean
  geocodingApi: boolean
}

export function ApiStatusCard() {
  const [status, setStatus] = useState<ApiStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch("/api/config-status")
        if (response.ok) {
          const data = await response.json()
          setStatus(data)
        }
      } catch (error) {
        console.error("Failed to check API status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkApiStatus()
  }, [])

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardHeader>
          <CardTitle className="text-white">API Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-400">Checking API configuration...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-800 border-gray-600">
      <CardHeader>
        <CardTitle className="text-white">API Configuration Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Google Elevation API</span>
            <Badge className={status?.elevationApi ? "bg-green-600" : "bg-red-600"}>
              {status?.elevationApi ? "Configured" : "Missing"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Google Places/Geocoding API</span>
            <Badge className={status?.geocodingApi ? "bg-green-600" : "bg-red-600"}>
              {status?.geocodingApi ? "Configured" : "Missing"}
            </Badge>
          </div>
        </div>
        {(!status?.elevationApi || !status?.geocodingApi) && (
          <div className="mt-4 p-4 bg-amber-900/20 border border-amber-700 rounded-lg">
            <p className="text-amber-400 text-sm">
              <strong>API Keys Required:</strong> Configure Google Elevation and Geocoding API keys to test terrain
              analysis. The Geocoding API key is also used for Places Autocomplete.
            </p>
            <div className="mt-2 text-xs text-amber-300">
              Add these environment variables to your deployment:
              <br />• <code>GOOGLE_ELEVATION_API_KEY</code>
              <br />• <code>GOOGLE_GEOCODING_API_KEY</code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
