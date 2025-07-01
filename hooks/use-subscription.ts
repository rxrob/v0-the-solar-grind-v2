"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./use-auth"

interface SubscriptionData {
  tier: "free" | "pro"
  status: "active" | "inactive" | "cancelled"
  isPro: boolean
}

export function useSubscription() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionData>({
    tier: "free",
    status: "inactive",
    isPro: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription({
          tier: "free",
          status: "inactive",
          isPro: false,
        })
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/verify-user-status?user_id=${user.id}`)
        const data = await response.json()

        if (data.success) {
          setSubscription({
            tier: data.data.subscriptionTier,
            status: data.data.subscriptionStatus,
            isPro: data.data.isPro,
          })
        }
      } catch (error) {
        console.error("Failed to fetch subscription:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  return {
    subscription,
    loading,
    isPro: subscription.isPro,
    isFree: subscription.tier === "free",
  }
}
