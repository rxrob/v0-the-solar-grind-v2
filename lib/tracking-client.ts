"use client"

import { createClient } from "./supabase/client"

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
      try {
        sessionStorage.setItem("tracking_session_id", fallbackId)
      } catch (sessionError) {
        console.error("Could not set sessionStorage item:", sessionError)
      }
      return fallbackId
    }
  }

  private async gatherInitialInfo() {
    if (typeof window === "undefined") {
      return
    }
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
    if (typeof window === "undefined") {
      return
    }

    if (!this.sessionId) {
      this.sessionId = this.generateSessionId()
    }

    const payload = {
      event_type: eventType,
      event_data: { ...this.userInfo, ...eventData },
      session_id: this.sessionId,
      page_url: window.location.href,
    }

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
