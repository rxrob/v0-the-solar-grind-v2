"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface RecaptchaLoaderProps {
  onLoad?: (siteKey: string) => void
  children?: (siteKey: string | null, loading: boolean) => React.ReactNode
}

export function RecaptchaLoader({ onLoad, children }: RecaptchaLoaderProps) {
  const [siteKey, setSiteKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSiteKey() {
      try {
        const response = await fetch("/api/recaptcha-config")
        if (!response.ok) {
          throw new Error("Failed to fetch reCAPTCHA configuration")
        }
        const data = await response.json()
        setSiteKey(data.siteKey)
        if (onLoad) {
          onLoad(data.siteKey)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("Error loading reCAPTCHA config:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchSiteKey()
  }, [onLoad])

  if (children) {
    return <>{children(siteKey, loading)}</>
  }

  if (loading) {
    return <div>Loading reCAPTCHA...</div>
  }

  if (error) {
    return <div>Error loading reCAPTCHA: {error}</div>
  }

  return null
}

export default RecaptchaLoader
