import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sun, BarChart3, FileText, Users, Calculator, Zap, Shield, CheckCircle } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="container relative px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <Badge variant="outline" className="w-fit">
                  <Zap className="w-3 h-3 mr-1" />
                  Powered by NREL Data
                </Badge>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                  Professional Solar Analysis Made Simple
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl dark:text-gray-300">
                  Advanced solar energy calculations, financial projections, and professional reports. Trusted by solar
                  professionals and homeowners nationwide.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="solar-gradient text-white">
                  <Link href="/calculator">
                    <Calculator className="mr-2 h-4 w-4" />
                    Try Free Calculator
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">
                    View Pricing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Instant results
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-orange-400 rounded-3xl blur-3xl opacity-20"></div>
                <Card className="relative bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
                      <Sun className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">Solar Calculator</CardTitle>
                    <CardDescription>Professional analysis in seconds</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full"></div>
                      </div>
                      <p className="text-sm text-gray-600">Analysis Progress: 75%</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-600">$2,340</div>
                        <div className="text-xs text-gray-500">Annual Savings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">8.2 yrs</div>
                        <div className="text-xs text-gray-500">Payback Period</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary">Features</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Everything You Need for Solar Analysis
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our comprehensive platform provides all the tools you need for accurate solar energy analysis and
                professional reporting.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <Card className="calculator-card group">
              <CardHeader>
                <div className="rounded-full bg-blue-100 p-3 w-fit group-hover:bg-blue-200 transition-colors">
                  <Sun className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Solar Potential Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Calculate precise solar energy potential using NREL data, accounting for location, roof orientation,
                  tilt, and shading factors.
                </p>
              </CardContent>
            </Card>

            <Card className="calculator-card group">
              <CardHeader>
                <div className="rounded-full bg-green-100 p-3 w-fit group-hover:bg-green-200 transition-colors">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Financial Projections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Detailed ROI analysis, payback calculations, and 25-year financial projections with current incentives
                  and utility rates.
                </p>
              </CardContent>
            </Card>

            <Card className="calculator-card group">
              <CardHeader>
                <div className="rounded-full bg-purple-100 p-3 w-fit group-hover:bg-purple-200 transition-colors">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Professional Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Generate comprehensive PDF reports with charts, visualizations, and recommendations for clients and
                  stakeholders.
                </p>
              </CardContent>
            </Card>

            <Card className="calculator-card group">
              <CardHeader>
                <div className="rounded-full bg-orange-100 p-3 w-fit group-hover:bg-orange-200 transition-colors">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Client Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Organize multiple projects, track client interactions, and maintain a professional portfolio of solar
                  analyses.
                </p>
              </CardContent>
            </Card>

            <Card className="calculator-card group">
              <CardHeader>
                <div className="rounded-full bg-red-100 p-3 w-fit group-hover:bg-red-200 transition-colors">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Advanced Calculations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Access NREL PVWatts integration, terrain analysis, and advanced solar irradiance modeling for precise
                  results.
                </p>
              </CardContent>
            </Card>

            <Card className="calculator-card group">
              <CardHeader>
                <div className="rounded-full bg-teal-100 p-3 w-fit group-hover:bg-teal-200 transition-colors">
                  <Shield className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Data Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Enterprise-grade security with encrypted data storage and secure authentication to protect your client
                  information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <Badge variant="secondary">Trusted by Professionals</Badge>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Users Say</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join thousands of solar professionals and homeowners who trust our platform for accurate solar analysis.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "This platform has completely transformed how I present solar proposals to clients. The reports are
                  incredibly professional and the calculations are always accurate."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">SJ</span>
                  </div>
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Solar Sales Consultant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "As a homeowner researching solar, this calculator gave me the confidence to move forward. The
                  detailed analysis helped me understand exactly what to expect."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">MC</span>
                  </div>
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-gray-500">Homeowner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The NREL data integration and advanced modeling capabilities save me hours on each project. This is
                  an essential tool for any solar professional."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">DR</span>
                  </div>
                  <div>
                    <p className="font-semibold">David Rodriguez</p>
                    <p className="text-sm text-gray-500">Solar Engineer</p>
                  </div>
                </div>
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
                Join thousands of professionals using our platform. Try the free calculator or get an advanced report
                for just $4.99.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/calculator">
                  <Calculator className="mr-2 h-4 w-4" />
                  Try Free Calculator
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                <Link href="/test-single-report-purchase">
                  Get Advanced Report $4.99
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-8 text-sm text-blue-100 mt-8">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                No setup fees
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Cancel anytime
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                24/7 support
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                25,000+
              </div>
              <div className="text-gray-500 dark:text-gray-400">Solar Calculations</div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                1,200+
              </div>
              <div className="text-gray-500 dark:text-gray-400">Active Users</div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                99.2%
              </div>
              <div className="text-gray-500 dark:text-gray-400">Accuracy Rate</div>
            </div>
            <div className="flex flex-col items-center justify-center space-y-2 text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                $2.4M+
              </div>
              <div className="text-gray-500 dark:text-gray-400">Savings Calculated</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
