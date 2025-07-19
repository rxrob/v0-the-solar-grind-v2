"use client"

import { useState, useEffect } from "react"
import { MapPin, Loader2, Sun, Zap, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSafeTracking } from "@/hooks/useSafeTracking"
import { toast } from "sonner"
import Link from "next/link"
import { useSolarCalculatorStore } from "@/lib/store"

export function LocationPermissionBanner() {
  const [isLoading, setIsLoading] = useState(false)
  const [solarData, setSolarData] = useState<{ sunHours: number; source: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)
  const { trackEvent } = useSafeTracking()
  const { setPropertyData } = useSolarCalculatorStore()

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("solarData")
      const dismissed = localStorage.getItem("bannerDismissed")
      if (storedData) {
        setSolarData(JSON.parse(storedData))
      }
      if (dismissed === "true") {
        setIsDismissed(true)
      }
    } catch (e) {
      console.error("Could not access localStorage", e)
    }
  }, [])

  const handleAllowLocation = () => {
    setIsLoading(true)
    setError(null)
    trackEvent("location_permission_requested", {})
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        trackEvent("location_permission_granted", { latitude, longitude })
        toast.info("Location access granted! Analyzing your area...")

        try {
          // Fetch address and solar data in parallel
          const [reverseGeocodeRes, nrelRes] = await Promise.all([
            fetch("/api/reverse-geocoding", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            }),
            fetch("/api/nrel-sunhours", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lat: latitude, lon: longitude }),
            }),
          ])

          if (!reverseGeocodeRes.ok || !nrelRes.ok) {
            throw new Error("Failed to fetch location or solar data.")
          }

          const geocodeData = await reverseGeocodeRes.json()
          const nrelData = await nrelRes.json()

          if (!geocodeData.success || !nrelData.success) {
            throw new Error(geocodeData.error || nrelData.error || "API returned unsuccessful.")
          }

          // Update Zustand store
          setPropertyData({
            address: geocodeData.address,
            coordinates: { lat: latitude, lng: longitude },
            zipCode: geocodeData.zipCode,
            sunHours: nrelData.sunHours,
          })

          setSolarData(nrelData)
          localStorage.setItem("solarData", JSON.stringify(nrelData))
          toast.success(`Your area gets an average of ${nrelData.sunHours.toFixed(1)} sun hours per day!`)
          trackEvent("solar_data_fetched", { ...nrelData, from: "banner" })
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : "An unknown error occurred."
          setError(errorMessage)
          toast.error("Could not retrieve solar data for your location.")
          trackEvent("solar_data_fetch_failed", { error: errorMessage })
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        setIsLoading(false)
        setError(error.message)
        toast.error("Location access denied. Please enable it in your browser settings.")
        trackEvent("location_permission_denied", { error: error.message })
      },
    )
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem("bannerDismissed", "true")
    trackEvent("location_banner_dismissed", {})
  }

  if (isDismissed) {
    return null
  }

  if (solarData) {
    return (
      <div className="w-full bg-slate-800/50 backdrop-blur-sm border border-green-400/50 rounded-lg p-4 flex items-center justify-between animate-fade-in">
        <div className="flex items-center">
          <Sun className="h-6 w-6 mr-3 text-green-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-white">Your Area's Solar Score</h3>
            <p className="text-sm text-slate-300">
              Estimated <span className="font-bold text-white">{solarData.sunHours.toFixed(1)}</span> peak sun hours per
              day.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="bg-green-500 hover:bg-green-600 text-white">
            <Link href="/pro-calculator">
              Start Full Analysis <Zap className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 flex items-center justify-between animate-fade-in">
      <div className="flex items-center">
        <MapPin className="h-6 w-6 mr-3 text-orange-400 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-white">Get Your Solar Potential</h3>
          <p className="text-sm text-slate-400">
            Allow location access to see your area's solar score and savings potential.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={handleAllowLocation}
          disabled={isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Allow Location"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white hover:bg-slate-700/50 h-8 w-8"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  )
}
