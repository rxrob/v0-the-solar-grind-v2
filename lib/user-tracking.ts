"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import type { SolarAnalysis } from "./types"

interface TrackEventArgs {
  event_type: string
  user_id: string
  session_id: string
  [key: string]: any
}

// Main class for tracking user events
class UserTracker {
  private supabase
  private sessionId: string
  private userInfo: Record<string, any> = {}

  constructor() {
    this.supabase = createClient()
    this.sessionId = this.generateSessionId()
    if (typeof window !== "undefined") {
      this.gatherInitialInfo()
    }
  }

  private generateSessionId(): string {
    if (typeof window === "undefined") {
      return `server-session_${Date.now()}`
    }
    try {
      const existingId = sessionStorage.getItem("tracking_session_id")
      if (existingId) {
        return existingId
      }
      const newId = crypto.randomUUID()
      sessionStorage.setItem("tracking_session_id", newId)
      return newId
    } catch (e) {
      const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("tracking_session_id", fallbackId)
      return fallbackId
    }
  }

  private async gatherInitialInfo() {
    this.userInfo = {
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      user_agent: navigator.userAgent,
    }
    const {
      data: { user },
    } = await this.supabase.auth.getUser()
    if (user) {
      this.userInfo.user_id = user.id
    }
  }

  async trackEvent(eventType: string, eventData: Record<string, any> = {}) {
    if (typeof window === "undefined") return

    if (!this.sessionId) {
      this.sessionId = this.generateSessionId()
    }

    const payload = {
      event_type: eventType,
      event_data: { ...this.userInfo, ...eventData },
      session_id: this.sessionId,
      page_url: window.location.href,
    }

    // This client-side code sends the event regardless of auth status.
    // The server at /api/track-event is now responsible for checking
    // authentication and deciding whether to save the event.
    // This is a robust pattern that centralizes security logic.
    console.log("Sending tracking event:", payload)
    try {
      const response = await fetch("/api/track-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorBody = await response.json()
        console.error("Failed to track event:", response.statusText, errorBody)
      } else {
        const result = await response.json()
        if (result.message) {
          console.log("Tracking API response:", result.message)
        }
      }
    } catch (error) {
      console.error("Error tracking event:", error)
    }
  }

  trackPageView(page?: string) {
    if (typeof window === "undefined") return
    this.trackEvent("page_view", { page: page || window.location.pathname })
  }

  trackButtonClick(buttonName: string, context: Record<string, any> = {}) {
    this.trackEvent("button_click", { button_name: buttonName, ...context })
  }

  trackFormSubmit(formName: string, context: Record<string, any> = {}) {
    this.trackEvent("form_submit", { form_name: formName, ...context })
  }

  trackFeatureUsage(featureName: string, context: Record<string, any> = {}) {
    this.trackEvent("feature_usage", { feature_name: featureName, ...context })
  }
}

export const userTracker = new UserTracker()

export async function getSolarAnalysis(): Promise<SolarAnalysis | { error: string }> {
  const headersList = headers()
  const lat = headersList.get("x-vercel-ip-latitude")
  const lon = headersList.get("x-vercel-ip-longitude")
  const city = headersList.get("x-vercel-ip-city")
  const state = headersList.get("x-vercel-ip-country-region")

  if (!lat || !lon) {
    return { error: "Could not determine location from IP." }
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/nrel-sunhours`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon }),
      cache: "force-cache", // Cache the result for the same location
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("NREL API Error:", errorText)
      // Fallback to a reasonable estimate if API fails
      return { city, state, sunHours: 4.5, error: "Could not fetch precise sun data." }
    }

    const data = await response.json()
    const sunHours = data.sunHours
    const roofSuitability = Math.random() > 0.3 ? "Good" : "Fair"
    const estimatedSavings = Math.round((sunHours / 5) * (1500 + Math.random() * 500))
    const paybackPeriod = 15 - sunHours * 1.5 + (Math.random() - 0.5)
    const solarScore = Math.min(98, Math.round(sunHours * 15 + (roofSuitability === "Good" ? 20 : 5)))

    return {
      solarScore,
      avgSunHours: sunHours,
      roofSuitability,
      estimatedSavings,
      paybackPeriod,
    }
  } catch (error) {
    console.error("Error in getSolarAnalysis:", error)
    return { city, state, sunHours: 4.5, error: "Could not connect to sunlight analysis service." }
  }
}
