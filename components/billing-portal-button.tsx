"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth-real"
import { toast } from "sonner"

export function BillingPortalButton() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleBillingPortal = async () => {
    setLoading(true)
    if (!user) {
      toast.error("You must be logged in to manage billing.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error.message || "Could not create billing portal session.")
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleBillingPortal} disabled={loading}>
      {loading ? "Loading..." : "Manage Billing"}
    </Button>
  )
}
