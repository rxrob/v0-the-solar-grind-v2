"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { trackUserVisit, generateSessionId, getDeviceInfo, type UserTrackingData } from "@/lib/user-tracking"

interface UserTrackingContextType {
  sessionId: string
  trackEvent: (eventType: string, eventData: any) => void
}

const UserTrackingContext = createContext<UserTrackingContextType | undefined>(undefined)

export function UserTrackingProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string>("")

  useEffect(() => {
    const initializeTracking = async () => {
      try {
        const newSessionId = generateSessionId()
        setSessionId(newSessionId)

        // Get user location if available
        let locationData = null
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 10000,
                enableHighAccuracy: false,
              })
            })

            locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }
          } catch (error) {
            console.log("Location not available:", error)
          }
        }

        // Prepare tracking data
        const trackingData: UserTrackingData = {
          sessionId: newSessionId,
          userAgent: navigator.userAgent,
          location: locationData,
          deviceInfo: getDeviceInfo(),
          events: [],
        }

        // Track the visit
        await trackUserVisit(trackingData)
      } catch (error) {
        console.warn("Failed to initialize tracking:", error)
      }
    }

    initializeTracking()
  }, [])

  const trackEvent = (eventType: string, eventData: any) => {
    try {
      // Store event in localStorage for now
      const existingData = localStorage.getItem("userTrackingData")
      if (existingData) {
        const data = JSON.parse(existingData)
        data.events = data.events || []
        data.events.push({
          type: eventType,
          data: eventData,
          timestamp: Date.now(),
        })
        localStorage.setItem("userTrackingData", JSON.stringify(data))
      }
    } catch (error) {
      console.warn("Failed to track event:", error)
    }
  }

  return <UserTrackingContext.Provider value={{ sessionId, trackEvent }}>{children}</UserTrackingContext.Provider>
}

export function useUserTracking() {
  const context = useContext(UserTrackingContext)
  if (context === undefined) {
    throw new Error("useUserTracking must be used within a UserTrackingProvider")
  }
  return context
}
