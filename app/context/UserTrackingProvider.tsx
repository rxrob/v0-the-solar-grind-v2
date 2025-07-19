"use client"

import type React from "react"
import { createContext, useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { userTracker } from "@/lib/tracking-client"

interface TrackingContextType {
  trackEvent: (eventType: string, payload?: Record<string, any>) => void
}

export const UserTrackingContext = createContext<TrackingContextType | null>(null)

export function UserTrackingProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const trackEvent = (eventType: string, payload: Record<string, any> = {}) => {
    // Only track events for logged-in users.
    // This prevents calling the API endpoint for anonymous users, which would result in a 401 Unauthorized error.
    if (!session?.user?.id) {
      console.log("User not logged in, skipping event tracking:", eventType)
      return
    }

    console.log("Tracking Event from Provider:", eventType, payload)
    userTracker.trackEvent(eventType, payload)
  }

  return <UserTrackingContext.Provider value={{ trackEvent }}>{children}</UserTrackingContext.Provider>
}
