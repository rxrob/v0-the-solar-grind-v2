"use client"

import { getSupabaseClient } from "./supabase-client"

interface TrackingEvent {
  event_type: string
  event_data?: Record<string, any>
  session_id: string
  page_url?: string
  user_agent?: string
}

class UserTracker {
  private sessionId: string
  private isEnabled = true

  constructor() {
    this.sessionId = this.getOrCreateSessionId()
  }

  private getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "server-session"

    let sessionId = sessionStorage.getItem("tracking_session_id")
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem("tracking_session_id", sessionId)
    }
    return sessionId
  }

  async trackEvent(eventType: string, eventData?: Record<string, any>): Promise<void> {
    if (!this.isEnabled || typeof window === "undefined") return

    try {
      const trackingData: TrackingEvent = {
        event_type: eventType,
        event_data: eventData || {},
        session_id: this.sessionId,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
      }

      // Try API route first
      const response = await fetch("/api/track-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trackingData),
      })

      if (!response.ok) {
        console.warn("API tracking failed, trying direct Supabase")
        await this.trackDirectly(trackingData)
      }
    } catch (error) {
      console.warn("Tracking failed:", error)
      // Fail silently to not break user experience
    }
  }

  private async trackDirectly(trackingData: TrackingEvent): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase.from("user_tracking_events").insert({
        event_type: trackingData.event_type,
        event_data: trackingData.event_data,
        session_id: trackingData.session_id,
        page_url: trackingData.page_url,
        user_agent: trackingData.user_agent,
        timestamp: new Date().toISOString(),
      })

      if (error) {
        console.warn("Direct Supabase tracking failed:", error)
      }
    } catch (error) {
      console.warn("Direct tracking error:", error)
    }
  }

  // Convenience methods
  trackPageView(page?: string): void {
    this.trackEvent("page_view", { page: page || window.location.pathname })
  }

  trackButtonClick(buttonName: string, context?: Record<string, any>): void {
    this.trackEvent("button_click", { button_name: buttonName, ...context })
  }

  trackFormSubmit(formName: string, context?: Record<string, any>): void {
    this.trackEvent("form_submit", { form_name: formName, ...context })
  }

  trackFeatureUsage(featureName: string, context?: Record<string, any>): void {
    this.trackEvent("feature_usage", { feature_name: featureName, ...context })
  }

  disable(): void {
    this.isEnabled = false
  }

  enable(): void {
    this.isEnabled = true
  }
}

// Export singleton instance
export const userTracker = new UserTracker()

// Export class for custom instances if needed
export { UserTracker }
