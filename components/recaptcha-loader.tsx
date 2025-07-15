"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface RecaptchaConfig {
  siteKey: string
}

interface RecaptchaLoaderProps {
  onLoad?: (siteKey: string) => void
  onError?: (error: string) => void
  children?: React.ReactNode
}

export function RecaptchaLoader({ onLoad, onError, children }: RecaptchaLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [siteKey, setSiteKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadRecaptcha() {
      try {
        // Check if reCAPTCHA is already loaded
        if (window.grecaptcha) {
          setIsLoaded(true)
          return
        }

        // Fetch the site key from server
        const response = await fetch("/api/recaptcha-config")
        if (!response.ok) {
          throw new Error("Failed to get reCAPTCHA configuration")
        }

        const { siteKey: fetchedSiteKey }: { siteKey: string } = await response.json()

        if (isMounted) {
          setSiteKey(fetchedSiteKey)

          // Create script element
          const script = document.createElement("script")
          script.src = "https://www.google.com/recaptcha/api.js"
          script.async = true
          script.defer = true

          script.onload = () => {
            if (isMounted) {
              setIsLoaded(true)
              onLoad?.(fetchedSiteKey)
            }
          }

          script.onerror = () => {
            if (isMounted) {
              const errorMsg = "Failed to load reCAPTCHA"
              setError(errorMsg)
              onError?.(errorMsg)
            }
          }

          document.head.appendChild(script)
        }
      } catch (err) {
        if (isMounted) {
          const errorMsg = err instanceof Error ? err.message : "Unknown error loading reCAPTCHA"
          setError(errorMsg)
          onError?.(errorMsg)
        }
      }
    }

    loadRecaptcha()

    return () => {
      isMounted = false
    }
  }, [onLoad, onError])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error loading reCAPTCHA: {error}</p>
      </div>
    )
  }

  if (!isLoaded || !siteKey) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-gray-600">Loading reCAPTCHA...</p>
      </div>
    )
  }

  return <>{children}</>
}

// Type declarations for reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      render: (container: string | HTMLElement, parameters: any) => number
      getResponse: (widgetId?: number) => string
      reset: (widgetId?: number) => void
      execute: (widgetId?: number) => void
      ready: (callback: () => void) => void
    }
  }
}
