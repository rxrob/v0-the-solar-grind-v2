"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import useAuthReal from "@/hooks/use-auth-real"
import { Loader2, Settings } from "lucide-react"

interface BillingPortalButtonProps {
  children?: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export function BillingPortalButton({
  children = "Manage Billing",
  className,
  variant = "outline",
}: BillingPortalButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { user, profile, isAuthenticated } = useAuthReal()

  const handleBillingPortal = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access billing portal.",
        variant: "destructive",
      })
      return
    }

    if (!profile || profile.subscription_type !== "pro") {
      toast({
        title: "Pro Subscription Required",
        description: "Only Pro users can access the billing portal.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create billing portal session")
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No billing portal URL received")
      }
    } catch (error) {
      console.error("❌ Billing portal error:", error)
      toast({
        title: "Billing Portal Error",
        description: error instanceof Error ? error.message : "Failed to access billing portal",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Only show button for Pro users
  if (!profile || profile.subscription_type !== "pro") {
    return null
  }

  return (
    <Button onClick={handleBillingPortal} disabled={isLoading} variant={variant} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <Settings className="mr-2 h-4 w-4" />
          {children}
        </>
      )}
    </Button>
  )
}

// Named export

// Default export
export default BillingPortalButton
