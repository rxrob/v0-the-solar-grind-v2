import { BasicSolarCalculator } from "@/components/basic-solar-calculator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, FileText, Users, TrendingUp, MapPin } from "lucide-react"
import Link from "next/link"

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Solar Calculator</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get instant solar estimates for any property. Enter basic information to see potential savings and system
            requirements.
          </p>
        </div>

        {/* Basic Calculator */}
        <div className="max-w-4xl mx-auto mb-12">
          <BasicSolarCalculator />
        </div>

        {/* Upgrade Section */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <Crown className="h-12 w-12 text-yellow-300" />
              </div>
              <CardTitle className="text-3xl font-bold mb-2">Upgrade to Professional</CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Get advanced analysis, detailed reports, and professional tools trusted by 1,000+ solar professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-yellow-300" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Satellite Analysis</h3>
                  <p className="text-blue-100 text-sm">
                    High-resolution satellite imagery with roof analysis and shading detection
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-yellow-300" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Professional Reports</h3>
                  <p className="text-blue-100 text-sm">
                    Branded PDF reports with detailed analysis and financial projections
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-yellow-300" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Client Management</h3>
                  <p className="text-blue-100 text-sm">
                    Organize projects, track leads, and manage your solar business
                  </p>
                </div>
              </div>

              {/* Feature List */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-yellow-300" />
                    <span>Advanced NREL PVWatts integration</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-yellow-300" />
                    <span>Detailed financial analysis & ROI</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-yellow-300" />
                    <span>Google Maps integration</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-yellow-300" />
                    <span>Unlimited professional reports</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-yellow-300" />
                    <span>Project & client management</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Crown className="h-5 w-5 text-yellow-300" />
                    <span>Priority support & training</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center border-t border-white/20 pt-6">
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-yellow-300 text-blue-900 mb-2">
                      Single Report
                    </Badge>
                    <div className="text-2xl font-bold">$4.99</div>
                    <div className="text-blue-100 text-sm">One-time purchase</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="bg-yellow-300 text-blue-900 mb-2">
                      Professional
                    </Badge>
                    <div className="text-2xl font-bold">$29.99/mo</div>
                    <div className="text-blue-100 text-sm">Unlimited everything</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-semibold">
                    <Link href="/pricing">Start Free Trial</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-700 bg-transparent"
                  >
                    <Link href="/pricing">View All Plans</Link>
                  </Button>
                </div>

                <p className="text-blue-100 text-sm mt-4">
                  7-day free trial • No credit card required • Cancel anytime
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
