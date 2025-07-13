"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ApiConfig {
  mapsApiKey?: string
  solarApiKey?: string
}

export default function Step3Client() {
  const [apiConfig, setApiConfig] = useState<ApiConfig>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchApiConfig = async () => {
      try {
        setLoading(true)

        // Fetch Google Maps API key from server
        const mapsResponse = await fetch("/api/maps-config")
        const mapsData = await mapsResponse.json()

        // Fetch Solar API key from server
        const solarResponse = await fetch("/api/solar-config")
        const solarData = await solarResponse.json()

        if (mapsResponse.ok && solarResponse.ok) {
          setApiConfig({
            mapsApiKey: mapsData.apiKey,
            solarApiKey: solarData.apiKey,
          })
        } else {
          setError("Failed to load API configuration")
        }
      } catch (err) {
        setError("Failed to fetch API configuration")
        console.error("API config error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchApiConfig()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Configuration Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  const address = searchParams.get("address") || ""

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Visual Property Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Analyzing property at: <strong>{address}</strong>
          </p>

          {apiConfig.mapsApiKey && apiConfig.solarApiKey ? (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800">✅ API configuration loaded successfully</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Google Maps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Maps API configured</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Solar Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Solar API configured</p>
                  </CardContent>
                </Card>
              </div>

              <Button className="w-full">Continue to Results</Button>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800">⚠️ API configuration incomplete</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
