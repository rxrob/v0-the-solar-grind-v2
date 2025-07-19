"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef } from "react"
import { userTracker } from "@/lib/user-tracking" // Corrected: Import the instance
import { getSupabaseClient } from "@/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"

interface TrackingContextType {
  trackEvent: (eventName: string, eventData?: Record<string, any>) => void
  trackButtonClick: (buttonName: string, eventData?: Record<string, any>) => void
  trackPageView: (pageName: string, eventData?: Record<string, any>) => void
  trackFeatureUsage: (featureName: string, eventData?: Record<string, any>) => void
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

export default function UserTrackingProvider({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseClient()
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user: User | null = session?.user ?? null
      userIdRef.current = user?.id ?? null
    })

    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      userIdRef.current = data.user?.id ?? null
    }
    fetchUser()

    return () => subscription.unsubscribe()
  }, [supabase])

  // Corrected: Call the method on the imported instance
  const handleTrackEvent = (eventName: string, eventData: Record<string, any> = {}) => {
    userTracker.trackEvent(eventName, { ...eventData, userId: userIdRef.current })
  }

  const value: TrackingContextType = {
    trackEvent: handleTrackEvent,
    trackButtonClick: (buttonName: string, eventData = {}) =>
      handleTrackEvent("button_click", { buttonName, ...eventData }),
    trackPageView: (pageName: string, eventData = {}) => handleTrackEvent("page_view", { pageName, ...eventData }),
    trackFeatureUsage: (featureName: string, eventData = {}) =>
      handleTrackEvent("feature_usage", { featureName, ...eventData }),
  }

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
}

export const useTracking = (): TrackingContextType => {
  const context = useContext(TrackingContext)
  if (context === undefined) {
    console.warn("useTracking must be used within a UserTrackingProvider. Tracking is disabled.")
    // Return no-op functions to prevent crashes if the provider is missing
    return {
      trackEvent: () => {},
      trackButtonClick: () => {},
      trackPageView: () => {},
      trackFeatureUsage: () => {},
    }
  }
  return context
}
