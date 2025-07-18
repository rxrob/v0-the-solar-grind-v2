"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

interface TrackingEvent {
  event_type: string
  event_data?: Record<string, any>
  session_id: string
  timestamp: string
  page_url: string
  user_agent?: string
}

export function UserTrackingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const sessionId = useRef<string>()
  const lastPageView = useRef<string>()

  // Generate session ID once
  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }, [])

  // Track page views
  useEffect(() => {
    if (!sessionId.current || lastPageView.current === pathname) return

    lastPageView.current = pathname

    const trackEvent = async (event: TrackingEvent) => {
      try {
        await fetch("/api/track-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        })
      } catch (error) {
        console.warn("Failed to track event:", error)
      }
    }

    // Track page view
    trackEvent({
      event_type: "page_view",
      event_data: {
        path: pathname,
        referrer: document.referrer,
        screen_resolution: `${screen.width}x${screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      },
      session_id: sessionId.current,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    })

    // Track user visit (first page only)
    if (pathname === "/") {
      trackEvent({
        event_type: "user_visit",
        event_data: {
          landing_page: pathname,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
        session_id: sessionId.current,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
      })
    }
  }, [pathname])

  // Track user interactions
  useEffect(() => {
    if (!sessionId.current) return

    const trackInteraction = (event: MouseEvent | KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (!target) return

      // Track button clicks
      if (target.tagName === "BUTTON" || target.closest("button")) {
        const button = target.tagName === "BUTTON" ? target : target.closest("button")
        const buttonText = button?.textContent?.trim() || "Unknown Button"

        fetch("/api/track-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "button_click",
            event_data: {
              button_text: buttonText,
              element_id: button?.id,
              element_class: button?.className,
              page_path: pathname,
            },
            session_id: sessionId.current,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
          }),
        }).catch((error) => console.warn("Failed to track button click:", error))
      }

      // Track link clicks
      if (target.tagName === "A" || target.closest("a")) {
        const link = target.tagName === "A" ? target : target.closest("a")
        const href = (link as HTMLAnchorElement)?.href
        const linkText = link?.textContent?.trim() || "Unknown Link"

        fetch("/api/track-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "link_click",
            event_data: {
              link_text: linkText,
              href: href,
              element_id: link?.id,
              page_path: pathname,
            },
            session_id: sessionId.current,
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
          }),
        }).catch((error) => console.warn("Failed to track link click:", error))
      }
    }

    document.addEventListener("click", trackInteraction)

    return () => {
      document.removeEventListener("click", trackInteraction)
    }
  }, [pathname])

  return <>{children}</>
}
