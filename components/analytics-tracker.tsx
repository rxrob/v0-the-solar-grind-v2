"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Only track if analytics are enabled
    if (process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "true") return

    // Track page view
    const trackPageView = () => {
      if (typeof window !== "undefined" && window.axiom) {
        window.axiom.ingest({
          event: "page_view",
          path: pathname,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
        })
      }
    }

    // Track page view on mount and pathname change
    trackPageView()
  }, [pathname])

  return null
}

// Extend window type for TypeScript
declare global {
  interface Window {
    axiom?: {
      ingest: (data: any) => void
    }
  }
}
