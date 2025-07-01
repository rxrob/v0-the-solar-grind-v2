"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthReal } from "@/hooks/use-auth-real"
import { CreditCard, Calendar, DollarSign } from "lucide-react"

export default function BillingPage() {
  const { user, loading } = useAuthReal()
  const [subscription, setSubscription] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchSubscriptionData()
    }
  }, [user])

  const fetchSubscriptionData = async () => {
    // Fetch subscription data from your API
    // This would typically come from Stripe or your database
    setSubscription({
      tier: "pro",
      status: "active",
      currentPeriodEnd: "2024-02-15",
      amount: 29.99,
    })
  }

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: user?.id, // This would be the Stripe customer ID
        }),
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error("Error creating portal session:", error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please log in to view billing information.</div>
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information</p>
      </div>

      <div className="grid gap-6">
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
                  <h3 className="text-lg font-semibold">Pro Plan</h3>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-muted-foreground">Full access to all solar calculation tools and features</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">$29.99</div>
                <div className="text-sm text-muted-foreground">per month</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Renews on February 15, 2024</span>
              </div>
            </div>

            <Button onClick={handleManageBilling} className="w-full">
              Manage Billing
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>Your recent billing history and invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "2024-01-15", amount: 29.99, status: "Paid" },
                { date: "2023-12-15", amount: 29.99, status: "Paid" },
                { date: "2023-11-15", amount: 29.99, status: "Paid" },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div>
                    <div className="font-medium">${invoice.amount}</div>
                    <div className="text-sm text-muted-foreground">{invoice.date}</div>
                  </div>
                  <Badge variant="outline">{invoice.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
