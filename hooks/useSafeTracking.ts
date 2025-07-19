"use client"

import { useContext } from "react"
import { UserTrackingContext } from "@/app/context/UserTrackingProvider"

export const useSafeTracking = () => {
  const ctx = useContext(UserTrackingContext)
  if (!ctx) {
    return {
      trackEvent: (eventType: string, payload?: Record<string, any>) => {
        console.warn(`Tracking event "${eventType}" skipped: component not wrapped in UserTrackingProvider.`, payload)
      },
    }
  }
  return ctx
}
