import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sun,
  Calculator,
  Zap,
  DollarSign,
  CheckCircle,
  ArrowRight,
  MapPin,
  BarChart3,
  FileText,
  Crown,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Sun className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Solar Grind</span>
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/calculator"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Calculator</span>
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Pricing</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
              Professional Solar Analysis Platform
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Professional Solar
              <span className="text-blue-600"> Analysis</span> Made Simple
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Generate comprehensive solar reports with satellite imagery, financial analysis, and professional
              documentation. Perfect for solar installers, sales teams, and energy consultants.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" asChild>
                <Link href="/calculator">
                  <Calculator className="h-5 w-5 mr-2" />
                  Start Analysis
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/pricing">
                  View Pricing
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for solar analysis
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Professional-grade tools and data sources to create accurate solar assessments
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-7xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Satellite Imagery</CardTitle>
                  <CardDescription>
                    High-resolution aerial views and street-level imagery for comprehensive property analysis
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Calculator className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>NREL Integration</CardTitle>
                  <CardDescription>
                    Real-time data from National Renewable Energy Laboratory for accurate production estimates
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Professional Reports</CardTitle>
                  <CardDescription>
                    Generate branded PDF reports with detailed analysis and financial projections
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle>Financial Analysis</CardTitle>
                  <CardDescription>
                    Complete ROI calculations, payback periods, and financing options analysis
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>System Design</CardTitle>
                  <CardDescription>Automated panel layout optimization and equipment recommendations</CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-cyan-600" />
                  </div>
                  <CardTitle>Project Management</CardTitle>
                  <CardDescription>
                    Track multiple projects, client communications, and installation progress
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-gray-600">Choose the plan that fits your business needs</p>
          </div>

          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Single Report */}
              <Card className="border-2 border-gray-200">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-2xl">Single Report</CardTitle>
                  <CardDescription>Perfect for one-off projects</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$4.99</span>
                    <span className="text-gray-600"> per report</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>Complete solar analysis</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>Professional PDF report</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>Satellite imagery included</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>Financial projections</span>
                    </div>
                  </div>
                  <Button className="w-full" asChild>
                    <Link href="/calculator">Get Single Report</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Professional Plan */}
              <Card className="border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">Professional</CardTitle>
                  <CardDescription>For solar professionals and businesses</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$29.99</span>
                    <span className="text-gray-600"> per month</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>Unlimited reports</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>Advanced analytics</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>Project management</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>Custom branding</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      <span>Priority support</span>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/pricing">Start Free Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by solar professionals
            </h2>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">10,000+</div>
                <div className="mt-2 text-lg text-gray-600">Reports Generated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">500+</div>
                <div className="mt-2 text-lg text-gray-600">Solar Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">99.9%</div>
                <div className="mt-2 text-lg text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to streamline your solar business?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join thousands of solar professionals who trust Solar Grind for their analysis needs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                asChild
              >
                <Link href="/calculator">Try Calculator</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Sun className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Solar Grind</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Professional solar analysis platform for installers, sales teams, and energy consultants.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/calculator" className="hover:text-white transition-colors">
                    Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Solar Grind. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
