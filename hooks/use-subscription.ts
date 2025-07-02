"use client"

import { useState, useEffect } from "react"

interface SubscriptionData {
  status: string
  plan: string
  trial_ends_at: string | null
  usageCount: number
  projectCount: number
}

export function useSubscription(userEmail: string | null) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userEmail) {
      setSubscription(null)
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/verify-user-status?email=${encodeURIComponent(userEmail)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch subscription data")
        }

        const data = await response.json()
        setSubscription({
          status: data.subscription?.status || "inactive",
          plan: data.subscription?.plan || "free",
          trial_ends_at: data.subscription?.trial_ends_at || null,
          usageCount: data.usageCount || 0,
          projectCount: data.projectCount || 0,
        })
        setError(null)
      } catch (err) {
        console.error("Error fetching subscription:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setSubscription(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [userEmail])

  const isProUser = subscription?.plan === "pro" || subscription?.plan === "enterprise"
  const hasActiveSubscription = subscription?.status === "active"
  const isTrialActive = subscription?.trial_ends_at && new Date(subscription.trial_ends_at) > new Date()

  return {
    subscription,
    loading,
    error,
    isProUser,
    hasActiveSubscription,
    isTrialActive,
    refetch: () => {
      if (userEmail) {
        const fetchSubscription = async () => {
          try {
            const response = await fetch(`/api/verify-user-status?email=${encodeURIComponent(userEmail)}`)
            const data = await response.json()
            setSubscription({
              status: data.subscription?.status || "inactive",
              plan: data.subscription?.plan || "free",
              trial_ends_at: data.subscription?.trial_ends_at || null,
              usageCount: data.usageCount || 0,
              projectCount: data.projectCount || 0,
            })
          } catch (err) {
            console.error("Error refetching subscription:", err)
          }
        }
        fetchSubscription()
      }
    },
  }
}
