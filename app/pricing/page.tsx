import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="outline">
                <Star className="w-3 h-3 mr-1" />
                Simple Pricing
              </Badge>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Choose Your Plan
              </h1>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Start with our free calculator or upgrade to Pro for advanced features and unlimited reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-4 lg:gap-8">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-xl">Free</CardTitle>
                <CardDescription>Perfect for homeowners exploring solar</CardDescription>
                <div className="text-3xl font-bold">$0</div>
                <div className="text-sm text-gray-500">Forever free</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/calculator">Get Started Free</Link>
                </Button>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Basic solar calculator</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Energy production estimates</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Basic financial projections</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Community support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Single Report */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-xl">Single Report</CardTitle>
                <CardDescription>Try advanced features with one report</CardDescription>
                <div className="text-3xl font-bold">$4.99</div>
                <div className="text-sm text-gray-500">One-time purchase</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href="/test-single-report-purchase">Purchase Report</Link>
                </Button>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Everything in Free</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Professional PDF report</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">NREL data integration</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Advanced calculations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Detailed financial analysis</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-blue-200 shadow-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <CardDescription>For solar professionals and businesses</CardDescription>
                <div className="text-3xl font-bold">$29</div>
                <div className="text-sm text-gray-500">per month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full solar-gradient text-white">
                  <Link href="/test-stripe-checkout">Start Pro Trial</Link>
                </Button>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Everything in Single Report</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Unlimited reports</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Client management</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Project tracking</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <CardDescription>Custom solutions for large organizations</CardDescription>
                <div className="text-3xl font-bold">Custom</div>
                <div className="text-sm text-gray-500">Contact for pricing</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full bg-transparent" variant="outline">
                  <Link href="mailto:sales@solargrind.com">Contact Sales</Link>
                </Button>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Everything in Pro</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">White-label solutions</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">API access</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">Dedicated support</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">SLA guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Feature Comparison</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed">See what's included in each plan</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Features</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold">Single Report</th>
                  <th className="text-center p-4 font-semibold">Pro</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4">Basic Solar Calculator</td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Professional PDF Reports</td>
                  <td className="text-center p-4">-</td>
                  <td className="text-center p-4">1 Report</td>
                  <td className="text-center p-4">Unlimited</td>
                  <td className="text-center p-4">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">NREL Data Integration</td>
                  <td className="text-center p-4">-</td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">Client Management</td>
                  <td className="text-center p-4">-</td>
                  <td className="text-center p-4">-</td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-4">API Access</td>
                  <td className="text-center p-4">-</td>
                  <td className="text-center p-4">-</td>
                  <td className="text-center p-4">-</td>
                  <td className="text-center p-4">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">Support Level</td>
                  <td className="text-center p-4">Community</td>
                  <td className="text-center p-4">Email</td>
                  <td className="text-center p-4">Priority</td>
                  <td className="text-center p-4">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I upgrade or downgrade my plan?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll
                  prorate any billing differences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's included in the Single Report option?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The Single Report gives you access to all Pro features for one comprehensive solar analysis report.
                  Perfect for trying our advanced features before committing to a subscription.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How accurate are the solar calculations?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our calculations use NREL (National Renewable Energy Laboratory) data and industry-standard models,
                  achieving 99%+ accuracy for solar potential and financial projections.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We offer a 30-day money-back guarantee for Pro subscriptions. Single report purchases are final but
                  come with full support to ensure you get the results you need.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-blue-600 to-orange-600">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="max-w-[600px] text-blue-100 md:text-xl">
                Join thousands of professionals using our platform for accurate solar analysis.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/calculator">Try Free Calculator</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                <Link href="/test-single-report-purchase">Get Report for $4.99</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
