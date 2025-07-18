"use client"

import { getSupabaseClient } from "@/lib/supabase-client"

export interface LocationData {
  latitude: number
  longitude: number
  city?: string
  state?: string
  country?: string
}

export interface SolarAnalysis {
  score: number
  annualProduction: number
  annualSavings: number
  co2Reduction: number
  roiYears: number
  incentives: string[]
}

export interface UserTrackingData {
  sessionId: string
  userAgent: string
  location?: LocationData
  deviceInfo: any
  events: any[]
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function getDeviceInfo() {
  if (typeof window === "undefined") return {}

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
  }
}

export async function getUserLocation(): Promise<LocationData | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser")
      resolve(null)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          // Get city and state from coordinates
          const response = await fetch(`/api/geocoding?lat=${latitude}&lng=${longitude}`)
          const data = await response.json()

          resolve({
            latitude,
            longitude,
            city: data.city,
            state: data.state,
            country: data.country,
          })
        } catch (error) {
          console.error("Error getting location details:", error)
          resolve({
            latitude,
            longitude,
          })
        }
      },
      (error) => {
        console.warn("Error getting location:", error.message)
        resolve(null)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  })
}

export async function getSolarAnalysis(location: LocationData): Promise<SolarAnalysis> {
  // Calculate solar score based on latitude and state
  const latitudeScore = Math.max(0, Math.min(100, 100 - Math.abs(location.latitude - 35) * 2))

  // State-based incentive multipliers
  const stateMultipliers: Record<string, number> = {
    CA: 1.2, // California
    TX: 1.1, // Texas
    FL: 1.15, // Florida
    NY: 1.1, // New York
    AZ: 1.25, // Arizona
    NV: 1.2, // Nevada
    NC: 1.1, // North Carolina
    NJ: 1.1, // New Jersey
  }

  const stateMultiplier = location.state ? stateMultipliers[location.state] || 1.0 : 1.0
  const baseScore = latitudeScore * stateMultiplier
  const finalScore = Math.min(100, Math.max(0, Math.round(baseScore)))

  // Calculate estimates based on score
  const annualProduction = Math.round(finalScore * 120 + 8000) // 8,000-20,000 kWh
  const annualSavings = Math.round(annualProduction * 0.12) // $0.12/kWh average
  const co2Reduction = Math.round(annualProduction * 0.0007 * 1000) // lbs CO2
  const roiYears = Math.round((25000 / annualSavings) * 10) / 10 // Assuming $25k system

  const incentives = []
  if (finalScore >= 80) incentives.push("Federal Tax Credit", "State Rebates", "Net Metering")
  else if (finalScore >= 60) incentives.push("Federal Tax Credit", "Net Metering")
  else incentives.push("Federal Tax Credit")

  return {
    score: finalScore,
    annualProduction,
    annualSavings,
    co2Reduction,
    roiYears,
    incentives,
  }
}

export async function trackEvent(eventType: string, eventData?: any): Promise<void> {
  try {
    const supabase = getSupabaseClient()

    await fetch("/api/track-event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: eventType,
        event_data: eventData,
        session_id: getSessionId(),
        timestamp: new Date().toISOString(),
        page_url: typeof window !== "undefined" ? window.location.href : "",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      }),
    })
  } catch (error) {
    console.error("Failed to track event:", error)
  }
}

export async function trackPageView(page: string): Promise<void> {
  return trackEvent("page_view", { page })
}

export async function trackUserVisit(data: UserTrackingData): Promise<void> {
  return trackEvent("user_visit", data)
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "server"

  let sessionId = sessionStorage.getItem("solar_session_id")
  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem("solar_session_id", sessionId)
  }
  return sessionId
}
