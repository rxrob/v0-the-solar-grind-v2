"use client"

import { useState, useEffect } from "react"
import { MapPin, Sun } from "lucide-react"
import { getSolarAnalysis } from "@/lib/user-tracking"
import { Skeleton } from "@/components/ui/skeleton"

export function SolarLocationBanner() {
  const [location, setLocation] = useState<{ city: string; state: string } | null>(null)
  const [sunHours, setSunHours] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLocationAndSunlight = async () => {
      setIsLoading(true)
      try {
        const result = await getSolarAnalysis()
        if (result.error) {
          setError(result.error)
        } else {
          setLocation({ city: result.city || "your area", state: result.state || "" })
          setSunHours(result.sunHours || null)
        }
      } catch (e) {
        setError("Could not fetch location data.")
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLocationAndSunlight()
  }, [])

  if (isLoading) {
    return (
      <div className="w-full bg-background/30 backdrop-blur-sm border border-border rounded-lg p-4 flex items-center justify-center">
        <Skeleton className="h-6 w-3/4" />
      </div>
    )
  }

  if (error) {
    return null
  }

  return (
    <div className="w-full bg-background/30 backdrop-blur-sm border border-border rounded-lg p-4 flex items-center justify-center">
      <MapPin className="h-5 w-5 mr-3 text-primary" />
      <p className="text-sm font-medium text-foreground">
        Analyzing solar potential for{" "}
        <span className="font-semibold text-primary">
          {location?.city}, {location?.state}
        </span>
        .
      </p>
      {sunHours && (
        <>
          <span className="mx-3 text-muted-foreground">|</span>
          <Sun className="h-5 w-5 mr-2 text-yellow-400" />
          <p className="text-sm font-medium text-foreground">
            Average <span className="font-semibold text-yellow-300">{sunHours.toFixed(2)}</span> sun hours/day.
          </p>
        </>
      )}
    </div>
  )
}
