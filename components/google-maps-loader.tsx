"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface GoogleMapsLoaderProps {
  onLoad?: (apiKey: string) => void
  children?: (apiKey: string | null, loading: boolean) => React.ReactNode
}

export function GoogleMapsLoader({ onLoad, children }: GoogleMapsLoaderProps) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApiKey() {
      try {
        const response = await fetch("/api/maps-config")
        if (!response.ok) {
          throw new Error("Failed to fetch Google Maps configuration")
        }
        const data = await response.json()
        setApiKey(data.apiKey)
        if (onLoad) {
          onLoad(data.apiKey)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("Error loading Google Maps config:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchApiKey()
  }, [onLoad])

  if (children) {
    return <>{children(apiKey, loading)}</>
  }

  if (loading) {
    return <div>Loading Google Maps...</div>
  }

  if (error) {
    return <div>Error loading Google Maps: {error}</div>
  }

  return null
}

export default GoogleMapsLoader
