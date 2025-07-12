"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sun, Zap, MapPin, Star, Check, Calculator, BarChart3, FileText } from "lucide-react"
import Link from "next/link"
import { AnimatedBG } from "@/components/AnimatedBG"

const features = [
  {
    icon: Calculator,
    title: "Smart Solar Calculator",
    description: "AI-powered calculations using real weather data and satellite imagery",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Detailed performance predictions and ROI analysis",
  },
  {
    icon: FileText,
    title: "Professional Reports",
    description: "Generate comprehensive PDF reports for clients and stakeholders",
  },
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    content:
      "The Solar Grind helped me understand exactly how much I could save with solar. The calculations were spot-on!",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Solar Installer",
    content:
      "This tool has revolutionized how I present solar options to my clients. The reports are professional and detailed.",
    rating: 5,
  },
  {
    name: "Lisa Rodriguez",
    role: "Energy Consultant",
    content:
      "The accuracy of the weather data integration is impressive. It's become an essential part of my workflow.",
    rating: 5,
  },
]

const stats = [
  { label: "Solar Analyses", value: "50,000+" },
  { label: "Energy Saved", value: "2.5M kWh" },
  { label: "CO₂ Reduced", value: "1,200 tons" },
  { label: "Happy Users", value: "10,000+" },
]

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<string>("")
  const [location, setLocation] = useState<{ city: string; region: string } | null>(null)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        setLocation({ city: data.city, region: data.region })
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    // Get user's location for personalization
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
            )
            const data = await response.json()
            setUserLocation(`${data.city}, ${data.principalSubdivision}`)
          } catch (error) {
            console.log("Location fetch failed:", error)
          }
        },
        () => {
          // Fallback to IP-based location
          setUserLocation("Your Area")
        },
      )
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <AnimatedBG />

      {/* Hero Section */}
      <motion.section className="relative z-10 container mx-auto px-4 pt-28 pb-32" style={{ y, opacity }}>
        <div className="text-center max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              <Sun className="w-4 h-4 mr-2" />
              AI-Powered Solar Analysis
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6 drop-shadow-lg">
              Smarter Solar Starts Here
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              AI-powered solar tools designed to maximize your home's savings and energy independence.
            </p>

            {userLocation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center justify-center mb-8 text-green-600"
              >
                <MapPin className="w-5 h-5 mr-2" />
                <span className="text-lg">Analyzing solar potential for {userLocation}</span>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
            >
              <Link href="/pro-calculator/step-1">
                Start Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Instant AI-Powered Solar Analysis Section */}
      <section className="w-full max-w-4xl mt-24 px-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">Instant, AI-Powered Solar Analysis</h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
          Get detailed solar potential reports, system size recommendations, and savings estimates for any property in
          seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/pro-calculator/step-1">Get Started for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">View Pro Pricing</Link>
          </Button>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-5xl mt-20 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">1. Enter Address</h3>
            <p className="text-muted-foreground">Provide a property address to begin the analysis.</p>
          </div>
          <div className="flex flex-col items-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
            <p className="text-muted-foreground">
              Our AI analyzes roof geometry, sun exposure, and local utility rates.
            </p>
          </div>
          <div className="flex flex-col items-center p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">3. Get Your Report</h3>
            <p className="text-muted-foreground">
              Receive a comprehensive report with system recommendations and financial projections.
            </p>
          </div>
        </div>
      </section>

      {/* Solar Potential Check Section */}
      <section className="mt-24 px-6 w-full flex flex-col items-center">
        {location ? (
          <h2 className="text-3xl font-bold mb-4">
            Solar Potential in {location.city}, {location.region}
          </h2>
        ) : (
          <p>Locating your area...</p>
        )}
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          Analyzing sunlight exposure and yearly energy savings for your location.
        </p>
      </section>

      {/* Solar Score & AI Summary */}
      <section className="mt-32 px-6 w-full flex flex-col items-center text-center">
        <h2 className="text-3xl font-bold mb-4">Your Solar Score</h2>
        <div className="bg-gradient-to-tr from-green-400 to-yellow-500 text-white w-40 h-40 rounded-full flex items-center justify-center text-5xl font-extrabold shadow-xl">
          92
        </div>
        <p className="text-muted-foreground mt-4 max-w-lg">
          This home receives above-average sunlight, has optimal roof orientation, and qualifies for generous local
          incentives — making it an ideal candidate for solar.
        </p>

        <div className="mt-8 p-5 max-w-2xl text-left bg-card/50 backdrop-blur-md rounded-xl border border-orange-400 text-card-foreground shadow-md">
          <p className="text-sm mb-2 font-bold">🤖 SolarGPT Analysis:</p>
          <p>
            Based on your property's conditions, you're projected to produce around{" "}
            <span className="font-semibold text-green-400">10,400 kWh/year</span>. That means you could save up to{" "}
            <span className="text-green-400 font-semibold">$1,400–$1,800 annually</span> with a properly sized system.
            This puts your home in the top 15% of solar-qualified properties in your area.
          </p>
        </div>
      </section>

      {/* Background Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-red-600 opacity-20 blur-3xl rounded-full pointer-events-none z-0" />

      {/* Features Section */}
      <motion.section
        className="relative z-10 py-20 bg-muted/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose The Solar Grind?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced AI technology meets solar expertise to deliver the most accurate analysis available.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 bg-card">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center leading-relaxed">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="relative z-10 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Testimonials Section */}
      <motion.section
        className="relative z-10 py-20 bg-muted/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of satisfied customers who've made the switch to solar
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-card shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        className="relative z-10 py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground">Choose the plan that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="relative h-full border-2 border-border hover:border-primary/50 transition-colors">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">Free</CardTitle>
                  <div className="text-4xl font-bold mt-4">$0</div>
                  <CardDescription>Perfect for homeowners</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Basic solar calculations</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Savings estimates</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Simple reports</span>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-8">
                    <Link href="/pro-calculator/step-1">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="relative h-full border-2 border-primary shadow-lg scale-105">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
                </div>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                  <div className="text-4xl font-bold text-primary mt-4">$29</div>
                  <CardDescription>per month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Advanced AI calculations</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Professional PDF reports</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Unlimited analyses</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Priority support</span>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-8 bg-primary hover:bg-primary/90">
                    <Link href="/pricing">Start Pro Trial</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Single Report */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="relative h-full border-2 border-border hover:border-green-500/50 transition-colors">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">Single Report</CardTitle>
                  <div className="text-4xl font-bold text-green-600 mt-4">$9</div>
                  <CardDescription>One-time purchase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>One professional report</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>Advanced calculations</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>PDF download</span>
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full mt-8 border-green-500 text-green-600 hover:bg-green-500/10 bg-transparent"
                  >
                    <Link href="/pricing">Buy Single Report</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="relative z-10 py-20 bg-gradient-to-r from-blue-600 to-green-600"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Go Solar?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of homeowners who've discovered their solar potential with The Solar Grind. Start your free
              analysis today.
            </p>
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
              <Link href="/pro-calculator/step-1">
                Start Your Solar Journey
                <Zap className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  )
}
