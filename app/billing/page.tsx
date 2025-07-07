"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthReal } from "@/hooks/use-auth-real"
import { CreditCard, Calendar, DollarSign, Loader2, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SubscriptionData {
  tier: string
  status: string
  currentPeriodEnd: string
  amount: number
  customerId?: string
}

interface BillingHistory {
  date: string
  amount: number
  status: string
  invoice_id?: string
}

export default function BillingPage() {
  const { user, loading: authLoading } = useAuthReal()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [managingBilling, setManagingBilling] = useState(false)

  useEffect(() => {
    if (user && !authLoading) {
      fetchSubscriptionData()
    } else if (!authLoading && !user) {
      setLoading(false)
      setError("Please log in to view billing information")
    }
  }, [user, authLoading])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch subscription data from your API
      const response = await fetch("/api/user-subscription", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          // User has no subscription
          setSubscription(null)
          setBillingHistory([])
          return
        }
        throw new Error(`Failed to fetch subscription: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSubscription(data.subscription)
        setBillingHistory(data.billing_history || [])
      } else {
        throw new Error(data.error || "Failed to load subscription data")
      }
    } catch (error) {
      console.error("Error fetching subscription data:", error)
      setError(error instanceof Error ? error.message : "Failed to load billing information")

      // Fallback to mock data for demo purposes
      setSubscription({
        tier: "pro",
        status: "active",
        currentPeriodEnd: "2024-02-15",
        amount: 29.99,
      })
      setBillingHistory([
        { date: "2024-01-15", amount: 29.99, status: "Paid" },
        { date: "2023-12-15", amount: 29.99, status: "Paid" },
        { date: "2023-11-15", amount: 29.99, status: "Paid" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    if (!user || !subscription) {
      toast({
        title: "Error",
        description: "Unable to access billing management",
        variant: "destructive",
      })
      return
    }

    try {
      setManagingBilling(true)

      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: subscription.customerId || user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create billing portal session")
      }

      const { url } = await response.json()

      if (!url) {
        throw new Error("No portal URL received")
      }

      // Redirect to Stripe billing portal
      window.location.href = url
    } catch (error) {
      console.error("Error creating portal session:", error)
      toast({
        title: "Billing Portal Error",
        description: error instanceof Error ? error.message : "Unable to access billing portal",
        variant: "destructive",
      })
    } finally {
      setManagingBilling(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Please log in to view your billing information.</p>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </div>
    )
  }

  if (error && !subscription) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Billing</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchSubscriptionData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {subscription ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Current Subscription
              </CardTitle>
              <CardDescription>Your current plan and billing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold capitalize">{subscription.tier} Plan</h3>
                    <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                      {subscription.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">Full access to all solar calculation tools and features</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${subscription.amount}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                </div>
              </div>

              <Button onClick={handleManageBilling} className="w-full" disabled={managingBilling}>
                {managingBilling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening Billing Portal...
                  </>
                ) : (
                  "Manage Billing"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                No Active Subscription
              </CardTitle>
              <CardDescription>You don't have an active subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Upgrade to Pro to access advanced solar calculations, unlimited reports, and professional features.
              </p>
              <Button asChild>
                <a href="/pricing">View Pricing Plans</a>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>Your recent billing history and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {billingHistory.length > 0 ? (
              <div className="space-y-4">
                {billingHistory.map((invoice, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <div className="font-medium">${invoice.amount}</div>
                      <div className="text-sm text-muted-foreground">{new Date(invoice.date).toLocaleDateString()}</div>
                    </div>
                    <Badge variant="outline">{invoice.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No billing history available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
