import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sun,
  Zap,
  Calculator,
  TrendingUp,
  MapPin,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Brain,
  Lightbulb,
  BarChart3,
  Globe,
  Shield,
  Sparkles,
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-blue-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400/20 to-teal-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-pink-400/20 to-red-500/20 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-orange-200/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Sun className="h-8 w-8 text-orange-500 animate-spin-slow" />
                <Brain className="h-4 w-4 text-blue-500 absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
                MySolarAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-orange-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Solar Analysis
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-orange-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
                Solar Intelligence
              </span>
              <br />
              <span className="text-gray-800">Meets AI Innovation</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to optimize your solar energy potential. Get precise
              calculations, detailed reports, and actionable insights powered by advanced AI algorithms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/calculator">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Start AI Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/pro-calculator">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 bg-transparent"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Try Pro AI Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Dashboard Preview */}
      <section className="relative z-10 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Real-Time Solar Intelligence Dashboard</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch our AI analyze solar potential in real-time with live data processing and instant insights.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Live Analysis Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-700">
                  <Zap className="w-6 h-6 mr-2 animate-pulse" />
                  AI Processing
                </CardTitle>
                <CardDescription>Live solar analysis in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Roof Analysis</span>
                      <span className="text-orange-600 font-semibold">87%</span>
                    </div>
                    <Progress value={87} className="h-2 bg-orange-100" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Weather Data</span>
                      <span className="text-orange-600 font-semibold">94%</span>
                    </div>
                    <Progress value={94} className="h-2 bg-orange-100" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cost Optimization</span>
                      <span className="text-orange-600 font-semibold">76%</span>
                    </div>
                    <Progress value={76} className="h-2 bg-orange-100" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Live Stats Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-700">
                  <BarChart3 className="w-6 h-6 mr-2" />
                  Live Statistics
                </CardTitle>
                <CardDescription>Real-time platform metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Analyses Today</span>
                    <span className="text-2xl font-bold text-blue-600 animate-pulse">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Accuracy</span>
                    <span className="text-2xl font-bold text-green-600">98.7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Energy Saved</span>
                    <span className="text-2xl font-bold text-orange-600">2.4 GWh</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights Card */}
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-green-700">
                  <Brain className="w-6 h-6 mr-2 animate-pulse" />
                  AI Insights
                </CardTitle>
                <CardDescription>Latest intelligent recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Optimal panel angle: 32°</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Best installation season: Spring</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">ROI timeline: 6.2 years</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">Carbon offset: 4.2 tons/year</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Advanced AI-Powered Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of solar analysis with our cutting-edge artificial intelligence technology.
            </p>
          </div>

          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12 bg-white/80 backdrop-blur-sm">
              <TabsTrigger
                value="analysis"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-yellow-500 data-[state=active]:text-white"
              >
                AI Analysis
              </TabsTrigger>
              <TabsTrigger
                value="optimization"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
              >
                Smart Optimization
              </TabsTrigger>
              <TabsTrigger
                value="reporting"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white"
              >
                Intelligent Reports
              </TabsTrigger>
              <TabsTrigger
                value="monitoring"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-500 data-[state=active]:text-white"
              >
                Live Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-700">
                      <Brain className="w-6 h-6 mr-2" />
                      Neural Network Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Advanced deep learning algorithms analyze your roof structure, shading patterns, and local weather
                      data for maximum accuracy.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700">
                      <MapPin className="w-6 h-6 mr-2" />
                      Geospatial Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      AI-powered satellite imagery analysis provides precise measurements and identifies optimal panel
                      placement locations.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-700">
                      <Lightbulb className="w-6 h-6 mr-2" />
                      Predictive Modeling
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Machine learning models predict energy production, weather impacts, and long-term performance with
                      98%+ accuracy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-blue-700">
                      <TrendingUp className="w-6 h-6 mr-2" />
                      Dynamic Cost Optimization
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      AI continuously analyzes market prices, incentives, and financing options to recommend the most
                      cost-effective solar solution.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Cost Reduction</span>
                        <span className="text-blue-600 font-semibold">Up to 35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ROI Improvement</span>
                        <span className="text-blue-600 font-semibold">2.3x faster</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-purple-700">
                      <Zap className="w-6 h-6 mr-2" />
                      Energy Efficiency AI
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Smart algorithms optimize panel configuration, inverter selection, and system sizing for maximum
                      energy output.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Efficiency Gain</span>
                        <span className="text-purple-600 font-semibold">+23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Output Optimization</span>
                        <span className="text-purple-600 font-semibold">97.8%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reporting" className="space-y-8">
              <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-700">
                    <BarChart3 className="w-6 h-6 mr-2" />
                    AI-Generated Professional Reports
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Comprehensive Analysis</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Detailed ROI calculations</li>
                        <li>• Environmental impact assessment</li>
                        <li>• 25-year performance projections</li>
                        <li>• Financing recommendations</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Professional Presentation</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Interactive 3D visualizations</li>
                        <li>• Branded PDF reports</li>
                        <li>• Client-ready proposals</li>
                        <li>• Technical specifications</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-pink-50 to-red-50 border-pink-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-pink-700">
                      <Globe className="w-6 h-6 mr-2" />
                      Real-Time Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      Monitor system performance, weather conditions, and energy production in real-time with AI-powered
                      alerts.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-700">
                      <Shield className="w-6 h-6 mr-2" />
                      Predictive Maintenance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      AI predicts maintenance needs and potential issues before they impact performance, ensuring
                      optimal operation.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-700">
                      <TrendingUp className="w-6 h-6 mr-2" />
                      Performance Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm">
                      Advanced analytics provide insights into system efficiency, energy savings, and environmental
                      impact over time.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Solar Professionals Worldwide</h2>
            <p className="text-xl text-gray-600">
              See what industry experts are saying about our AI-powered solar analysis platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "MySolarAI has revolutionized our solar consultations. The AI analysis is incredibly accurate and
                  saves us hours of manual calculations. Our clients love the detailed reports!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    S
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Solar Energy Consultant</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The predictive modeling is outstanding. We've increased our installation success rate by 40% since
                  using MySolarAI. The ROI calculations are spot-on every time."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Michael Chen</p>
                    <p className="text-sm text-gray-600">Installation Manager</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "As a homeowner, I was amazed by the detailed analysis. The AI showed me exactly how much I could save
                  and the environmental impact. Made my decision easy!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    E
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Emily Rodriguez</p>
                    <p className="text-sm text-gray-600">Homeowner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your AI-Powered Plan</h2>
            <p className="text-xl text-gray-600">
              From basic calculations to advanced AI analysis, we have the perfect plan for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">Free</CardTitle>
                <CardDescription className="text-gray-600">Perfect for getting started</CardDescription>
                <div className="text-4xl font-bold text-gray-900 mt-4">$0</div>
                <div className="text-gray-600">per month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Basic solar calculations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Simple ROI estimates</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Basic weather data</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Email support</span>
                  </li>
                </ul>
                <Link href="/signup" className="block mt-6">
                  <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-orange-700">Pro AI</CardTitle>
                <CardDescription className="text-gray-600">Advanced AI-powered analysis</CardDescription>
                <div className="text-4xl font-bold text-orange-700 mt-4">$29</div>
                <div className="text-gray-600">per month</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">AI-powered analysis</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Detailed professional reports</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">3D visualizations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Unlimited calculations</span>
                  </li>
                </ul>
                <Link href="/signup" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white">
                    Start Pro Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800">Enterprise</CardTitle>
                <CardDescription className="text-gray-600">For large organizations</CardDescription>
                <div className="text-4xl font-bold text-gray-900 mt-4">Custom</div>
                <div className="text-gray-600">pricing</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Custom AI models</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">API access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">White-label solutions</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-gray-600">Custom integrations</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 bg-gradient-to-r from-orange-500 via-yellow-500 to-blue-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Harness AI for Solar Success?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of solar professionals who trust MySolarAI for accurate, intelligent solar analysis. Start
            your free trial today and experience the future of solar technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/calculator">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 bg-transparent"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Try Calculator Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sun className="h-8 w-8 text-orange-500" />
                <span className="text-2xl font-bold">MySolarAI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing solar energy with artificial intelligence. Accurate, intelligent, and professional solar
                analysis for everyone.
              </p>
              <div className="flex space-x-4">
                <Users className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Globe className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <BarChart3 className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/calculator" className="hover:text-white transition-colors">
                    Solar Calculator
                  </Link>
                </li>
                <li>
                  <Link href="/pro-calculator" className="hover:text-white transition-colors">
                    Pro AI Analysis
                  </Link>
                </li>
                <li>
                  <Link href="/reports" className="hover:text-white transition-colors">
                    Professional Reports
                  </Link>
                </li>
                <li>
                  <Link href="/api-status" className="hover:text-white transition-colors">
                    API Status
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MySolarAI. All rights reserved. Powered by advanced artificial intelligence.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
