"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import StripeCheckoutButton from "@/components/stripe-checkout-button"
import { useAuth } from "@/hooks/use-auth-real"
import { Check, Zap, Brain, FileText, Star } from "lucide-react"

export default function PricingPage() {
  const { isAuthenticated, canAccessProFeatures } = useAuth()

  const features = {
    free: ["Basic solar calculator", "Rough savings estimates", "Environmental impact calculation", "Email support"],
    pro: [
      "Everything in Free",
      "AI-powered smart analysis",
      "Detailed financial projections",
      "Seasonal production analysis",
      "Risk assessment & opportunities",
      "Professional PDF reports",
      "Priority support",
      "Advanced system optimization",
    ],
    singleReport: [
      "One-time advanced analysis",
      "AI-powered insights",
      "Detailed financial projections",
      "Professional PDF report",
      "Valid for 30 days",
    ],
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Solar Analysis Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get the insights you need to make informed solar decisions. From basic estimates to comprehensive AI-powered
          analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Free
            </CardTitle>
            <CardDescription>Perfect for getting started with solar</CardDescription>
            <div className="text-3xl font-bold">$0</div>
            <div className="text-sm text-muted-foreground">Forever free</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Always free - no credit card required</p>
            </div>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-2 border-primary">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">
              <Star className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Pro
            </CardTitle>
            <CardDescription>Advanced AI-powered solar analysis</CardDescription>
            <div className="text-3xl font-bold">$29</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.pro.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Separator />
            {isAuthenticated ? (
              canAccessProFeatures() ? (
                <div className="text-center">
                  <Badge variant="default" className="bg-green-600">
                    Current Plan
                  </Badge>
                </div>
              ) : (
                <StripeCheckoutButton
                  priceId={process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!}
                  productType="subscription"
                  className="w-full"
                >
                  Upgrade to Pro
                </StripeCheckoutButton>
              )
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Sign in to upgrade</p>
                <a href="/login" className="text-primary hover:underline">
                  Sign In
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Single Report */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Single Report
            </CardTitle>
            <CardDescription>One-time advanced analysis</CardDescription>
            <div className="text-3xl font-bold">$19</div>
            <div className="text-sm text-muted-foreground">one-time purchase</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.singleReport.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Separator />
            {isAuthenticated ? (
              <StripeCheckoutButton
                priceId={process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID!}
                productType="single_report"
                className="w-full"
              >
                Buy Single Report
              </StripeCheckoutButton>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Sign in to purchase</p>
                <a href="/login" className="text-primary hover:underline">
                  Sign In
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Yes, you can cancel your Pro subscription at any time. You'll continue to have access until the end of
                your billing period.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's included in the AI analysis?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes satellite imagery, local weather patterns, utility rates, and shading to provide
                accurate solar potential calculations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How accurate are the calculations?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our Pro analysis typically achieves 90%+ accuracy by incorporating real-world factors like shading,
                weather patterns, and local utility rates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day money-back guarantee for Pro subscriptions. Single reports are non-refundable but
                valid for 30 days.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
