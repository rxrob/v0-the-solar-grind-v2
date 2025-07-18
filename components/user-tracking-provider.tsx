"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { userTracker } from "@/lib/user-tracking"

interface TrackingContextType {
  trackEvent: (eventType: string, eventData?: Record<string, any>) => void
  trackPageView: (page?: string) => void
  trackButtonClick: (buttonName: string, context?: Record<string, any>) => void
  trackFormSubmit: (formName: string, context?: Record<string, any>) => void
  trackFeatureUsage: (featureName: string, context?: Record<string, any>) => void
}

const TrackingContext = createContext<TrackingContextType | null>(null)

export function useTracking() {
  const context = useContext(TrackingContext)
  if (!context) {
    // Return no-op functions if provider is missing
    return {
      trackEvent: () => {},
      trackPageView: () => {},
      trackButtonClick: () => {},
      trackFormSubmit: () => {},
      trackFeatureUsage: () => {},
    }
  }
  return context
}

interface UserTrackingProviderProps {
  children: ReactNode
}

export function UserTrackingProvider({ children }: UserTrackingProviderProps) {
  useEffect(() => {
    // Track initial page view
    userTracker.trackPageView()

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        userTracker.trackEvent("page_focus")
      } else {
        userTracker.trackEvent("page_blur")
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Track page unload
    const handleBeforeUnload = () => {
      userTracker.trackEvent("page_unload")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const contextValue: TrackingContextType = {
    trackEvent: userTracker.trackEvent.bind(userTracker),
    trackPageView: userTracker.trackPageView.bind(userTracker),
    trackButtonClick: userTracker.trackButtonClick.bind(userTracker),
    trackFormSubmit: userTracker.trackFormSubmit.bind(userTracker),
    trackFeatureUsage: userTracker.trackFeatureUsage.bind(userTracker),
  }

  return <TrackingContext.Provider value={contextValue}>{children}</TrackingContext.Provider>
}
