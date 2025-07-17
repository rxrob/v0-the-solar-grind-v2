"use client"

import type React from "react"

import { useEffect } from "react"
import { trackUserVisit, trackEvent, getSessionId, getDeviceInfo } from "@/lib/user-tracking"
import { SolarLocationBanner } from "./solar-location-banner"

export function UserTrackingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeTracking()
    setupGlobalTracking()
  }, [])

  const initializeTracking = async () => {
    try {
      const sessionId = getSessionId()
      const deviceInfo = getDeviceInfo()

      const trackingData = {
        sessionId,
        userAgent: navigator.userAgent,
        deviceInfo,
        events: [
          {
            type: "page_visit",
            data: { page: window.location.pathname },
            timestamp: Date.now(),
          },
        ],
      }

      const result = await trackUserVisit(trackingData)
      console.log("User tracking initialized:", result)
    } catch (error) {
      console.warn("Failed to initialize tracking:", error)
    }
  }

  const setupGlobalTracking = () => {
    // Make trackEvent available globally
    ;(window as any).trackEvent = trackEvent

    // Track page visibility changes
    document.addEventListener("visibilitychange", () => {
      trackEvent("visibility_change", {
        hidden: document.hidden,
        timestamp: Date.now(),
      })
    })

    // Track before page unload
    window.addEventListener("beforeunload", () => {
      trackEvent("page_unload", {
        timeOnPage: Date.now() - performance.timing.navigationStart,
        timestamp: Date.now(),
      })
    })
  }

  return (
    <>
      {children}
      <div className="fixed top-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96">
        <SolarLocationBanner />
      </div>
    </>
  )
}
