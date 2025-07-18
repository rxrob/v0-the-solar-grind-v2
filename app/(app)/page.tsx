import AnimatedBG from "@/components/AnimatedBG"
import { UserTrackingProvider } from "@/components/user-tracking-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, Zap, TrendingUp, Shield, Users, Award } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <UserTrackingProvider>
      <div className="min-h-screen bg-slate-900 animated-bg relative">
        <AnimatedBG />

        {/* Mist Overlay */}
        <div className="absolute inset-0 mist-overlay pointer-events-none" />

        {/* Content */}
        <div className="relative z-10">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-6 bg-orange-500/20 text-orange-300 border-orange-500/30">
                ⚡ AI-Powered Solar Analysis
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 orange-gradient orange-glow">The Solar Grind</h1>

              <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
                Discover your property's solar potential with our advanced AI analysis. Get instant calculations,
                detailed reports, and maximize your energy savings.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/pro-calculator">
                  <Button size="lg" className="btn-orange px-8 py-4 text-lg">
                    <Calculator className="mr-2 h-5 w-5" />
                    Start Free Analysis
                  </Button>
                </Link>

                <Link href="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg border-orange-500/30 text-orange-300 hover:bg-orange-500/10 bg-transparent"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className="container mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 orange-gradient">Why Choose The Solar Grind?</h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Our platform combines cutting-edge technology with real-world data to give you the most accurate solar
                analysis available.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-slate-800/50 border-slate-700 hover-lift card-glow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-white">AI-Powered Analysis</CardTitle>
                  <CardDescription className="text-slate-400">
                    Advanced machine learning algorithms analyze your property's solar potential
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Roof analysis & shading detection</li>
                    <li>• Weather pattern integration</li>
                    <li>• Optimal panel placement</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover-lift card-glow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-white">Financial Modeling</CardTitle>
                  <CardDescription className="text-slate-400">
                    Detailed ROI calculations and savings projections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-300">
                    <li>• 25-year savings forecast</li>
                    <li>• Incentive & rebate tracking</li>
                    <li>• Payback period analysis</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover-lift card-glow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-white">Professional Reports</CardTitle>
                  <CardDescription className="text-slate-400">
                    Comprehensive PDF reports for homeowners and installers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Detailed system specifications</li>
                    <li>• Installation recommendations</li>
                    <li>• Permit-ready documentation</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover-lift card-glow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-white">Multi-User Access</CardTitle>
                  <CardDescription className="text-slate-400">
                    Perfect for solar installers and energy consultants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Client project management</li>
                    <li>• Team collaboration tools</li>
                    <li>• White-label reports</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover-lift card-glow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Award className="h-6 w-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-white">Industry Leading</CardTitle>
                  <CardDescription className="text-slate-400">
                    Trusted by thousands of solar professionals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-300">
                    <li>• 99.9% uptime guarantee</li>
                    <li>• Real-time data updates</li>
                    <li>• 24/7 customer support</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover-lift card-glow">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Calculator className="h-6 w-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-white">Easy Integration</CardTitle>
                  <CardDescription className="text-slate-400">
                    Seamlessly integrate with your existing workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-300">
                    <li>• API access available</li>
                    <li>• Export to popular formats</li>
                    <li>• Custom branding options</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30 card-glow">
                <CardContent className="p-12">
                  <h2 className="text-4xl font-bold mb-6 orange-gradient">Ready to Go Solar?</h2>
                  <p className="text-xl text-slate-300 mb-8">
                    Join thousands of homeowners and professionals who trust The Solar Grind for accurate solar analysis
                    and financial modeling.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/pro-calculator">
                      <Button size="lg" className="btn-orange px-8 py-4 text-lg">
                        <Calculator className="mr-2 h-5 w-5" />
                        Start Your Analysis
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-8 py-4 text-lg border-orange-500/30 text-orange-300 hover:bg-orange-500/10 bg-transparent"
                      >
                        View Dashboard
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </UserTrackingProvider>
  )
}
