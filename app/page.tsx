import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Calculator, Zap, Shield, Award, Sun, DollarSign, Leaf, BarChart3, MapPin } from "lucide-react"
import Link from "next/link"
import { SiteNavigation } from "@/components/site-navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <SiteNavigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Solar Analysis
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Revolutionizing Home Energy with{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Solar + AI
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Get AI-driven solar calculations, advanced satellite analysis, and precision reports that help you make
              the smartest energy decisions for your home.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6"
              >
                <Link href="/calculator">
                  <Calculator className="h-5 w-5 mr-2" />
                  Start Free Analysis
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/pro-calculator">View Pro Features</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">50K+</div>
              <div className="text-slate-400">Homes Analyzed</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">$2.5M+</div>
              <div className="text-slate-400">Savings Calculated</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">98%</div>
              <div className="text-slate-400">Accuracy Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-white">24/7</div>
              <div className="text-slate-400">AI Analysis</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Why Choose SolarGrind AI?</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our advanced AI technology provides the most accurate solar analysis available, helping you make informed
              decisions about your home's energy future.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Sun className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">AI-Powered Analysis</CardTitle>
                <CardDescription className="text-slate-300">
                  Advanced machine learning algorithms analyze your roof, shading, and local weather patterns for
                  maximum accuracy.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Satellite Imagery</CardTitle>
                <CardDescription className="text-slate-300">
                  High-resolution satellite data provides precise roof measurements and shading analysis for your
                  specific location.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="h-12 w-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-yellow-400" />
                </div>
                <CardTitle className="text-white">Detailed Reports</CardTitle>
                <CardDescription className="text-slate-300">
                  Professional-grade reports with financial analysis, equipment recommendations, and 25-year
                  projections.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Financial Modeling</CardTitle>
                <CardDescription className="text-slate-300">
                  Comprehensive financial analysis including tax incentives, financing options, and ROI calculations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-red-400" />
                </div>
                <CardTitle className="text-white">Environmental Impact</CardTitle>
                <CardDescription className="text-slate-300">
                  Calculate your carbon footprint reduction and environmental benefits over the system lifetime.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="h-12 w-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-indigo-400" />
                </div>
                <CardTitle className="text-white">Trusted & Secure</CardTitle>
                <CardDescription className="text-slate-300">
                  Bank-level security with encrypted data transmission and secure cloud storage for all your
                  information.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Calculator Preview Section */}
      <section className="py-24 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-white">Get Started in Seconds</h2>
              <p className="text-xl text-slate-300">
                Try our basic calculator for free, or upgrade to Pro for advanced analysis
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Basic Calculator
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Quick solar estimate based on your electric bill and roof size
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                      System size estimation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                      Monthly savings calculation
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                      Payback period analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-green-400 rounded-full" />
                      Environmental impact
                    </li>
                  </ul>
                  <Button asChild className="w-full">
                    <Link href="/basic-calculator">Try Free Calculator</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-600/20 to-green-600/20 backdrop-blur-sm border-blue-400/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Pro Calculator
                    </CardTitle>
                    <Badge className="bg-gradient-to-r from-blue-500 to-green-500">Recommended</Badge>
                  </div>
                  <CardDescription className="text-slate-300">
                    Advanced AI analysis with satellite imagery and detailed reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                      Satellite roof analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                      Shading & obstruction detection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                      Equipment recommendations
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                      Professional PDF reports
                    </li>
                  </ul>
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    <Link href="/pro-calculator">Start Pro Analysis</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white">Ready to Harness the Power of the Sun?</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Join thousands of homeowners who have already discovered their solar potential with SolarGrind AI's
              advanced analysis technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg px-8 py-6"
              >
                <Link href="/calculator">
                  <Sun className="h-5 w-5 mr-2" />
                  Calculate Your Savings
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black/20 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sun className="h-6 w-6 text-yellow-500" />
              <span className="text-xl font-bold text-white">SolarGrind AI</span>
            </div>
            <p className="text-slate-400">Revolutionizing home energy with solar + artificial intelligence</p>
            <div className="flex justify-center gap-6 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <p className="text-xs text-slate-500">© 2024 SolarGrind AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
