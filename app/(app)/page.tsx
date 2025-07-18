"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, BarChart3, FileText, MapPin, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"

interface LocationData {
  city: string
  state: string
  country: string
  lat: number
  lng: number
  zip_code?: string
  source?: string
}

interface TriangleNode {
  x: number
  y: number
  connections: number[]
  active: boolean
  activationTime: number
}

interface TriangleLine {
  from: number
  to: number
  progress: number
  active: boolean
  opacity: number
}

interface MistParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
}

export default function HomePage() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const triangleNodesRef = useRef<TriangleNode[]>([])
  const triangleLinesRef = useRef<TriangleLine[]>([])
  const mistParticlesRef = useRef<MistParticle[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    detectLocation()
    initializeTriangleNetwork()
    initializeMistParticles()
    startAnimation()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const detectLocation = async () => {
    setLocationLoading(true)
    setLocationError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported"))
          return
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        })
      })

      const { latitude: lat, longitude: lng } = position.coords

      try {
        const response = await fetch(`/api/geocoding?lat=${lat}&lng=${lng}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setLocation({
            city: data.city || "Unknown City",
            state: data.state || "",
            country: data.country || "US",
            lat,
            lng,
            zip_code: data.zip_code,
            source: data.source,
          })
        } else {
          const fallbackCity = getFallbackCityName(lat, lng)
          setLocation({
            city: fallbackCity,
            state: "",
            country: "US",
            lat,
            lng,
          })
        }
      } catch (geocodingError) {
        const fallbackCity = getFallbackCityName(lat, lng)
        setLocation({
          city: fallbackCity,
          state: "",
          country: "US",
          lat,
          lng,
        })
      }
    } catch (error) {
      setLocationError("Unable to detect location. Please enable location services.")
      setLocation({
        city: "Demo Location",
        state: "TX",
        country: "US",
        lat: 30.2672,
        lng: -97.7431,
      })
    } finally {
      setLocationLoading(false)
    }
  }

  const getFallbackCityName = (lat: number, lng: number): string => {
    if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) {
      if (lat >= 32.5 && lat <= 33.0 && lng >= -97.5 && lng <= -96.5) {
        return "Dallas Area"
      } else if (lat >= 29.5 && lat <= 30.0 && lng >= -95.8 && lng <= -95.0) {
        return "Houston Area"
      } else if (lat >= 30.0 && lat <= 30.5 && lng >= -98.0 && lng <= -97.5) {
        return "Austin Area"
      } else {
        return "Texas"
      }
    }

    if (lat >= 32.5 && lat <= 42.0 && lng >= -124.0 && lng <= -114.0) {
      return "California"
    }

    if (lat >= 24.0 && lat <= 49.0 && lng >= -125.0 && lng <= -66.0) {
      return "United States"
    }

    return "Your Location"
  }

  const initializeTriangleNetwork = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create triangle nodes scattered across the screen
    const triangleNodes: TriangleNode[] = []
    const triangleLines: TriangleLine[] = []

    // Create nodes in a grid pattern with some randomness
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 12; j++) {
        if (Math.random() > 0.4) {
          // Skip some nodes for natural look
          triangleNodes.push({
            x: (canvas.width / 20) * i + Math.random() * 60 - 30,
            y: (canvas.height / 12) * j + Math.random() * 60 - 30,
            connections: [],
            active: false,
            activationTime: Math.random() * 1000,
          })
        }
      }
    }

    // Create connections to form triangles
    triangleNodes.forEach((node, index) => {
      const nearbyNodes = triangleNodes
        .map((n, i) => ({ node: n, index: i }))
        .filter(({ node: n, index: i }) => {
          if (i === index) return false
          const distance = Math.sqrt(Math.pow(n.x - node.x, 2) + Math.pow(n.y - node.y, 2))
          return distance < 180 && distance > 60
        })
        .sort((a, b) => {
          const distA = Math.sqrt(Math.pow(a.node.x - node.x, 2) + Math.pow(a.node.y - node.y, 2))
          const distB = Math.sqrt(Math.pow(b.node.x - node.x, 2) + Math.pow(b.node.y - node.y, 2))
          return distA - distB
        })
        .slice(0, 4) // Take closest 4 nodes

      nearbyNodes.forEach(({ index: targetIndex }) => {
        if (!node.connections.includes(targetIndex)) {
          node.connections.push(targetIndex)
          triangleLines.push({
            from: index,
            to: targetIndex,
            progress: 0,
            active: false,
            opacity: 0,
          })
        }
      })
    })

    triangleNodesRef.current = triangleNodes
    triangleLinesRef.current = triangleLines
  }

  const initializeMistParticles = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const mistParticles: MistParticle[] = []

    // Create orange mist particles
    for (let i = 0; i < 60; i++) {
      mistParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.3,
        size: 25 + Math.random() * 50,
        opacity: 0.03 + Math.random() * 0.08,
        life: 0,
        maxLife: 800 + Math.random() * 1200,
      })
    }

    mistParticlesRef.current = mistParticles
  }

  const startAnimation = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let time = 0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.008

      // Update and draw mist particles first (background layer)
      mistParticlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life++

        // Wrap around screen
        if (particle.x < -particle.size) particle.x = canvas.width + particle.size
        if (particle.x > canvas.width + particle.size) particle.x = -particle.size
        if (particle.y < -particle.size) particle.y = canvas.height + particle.size
        if (particle.y > canvas.height + particle.size) particle.y = -particle.size

        // Subtle movement variation
        particle.vx += (Math.random() - 0.5) * 0.008
        particle.vy += (Math.random() - 0.5) * 0.008
        particle.vx = Math.max(-0.8, Math.min(0.8, particle.vx))
        particle.vy = Math.max(-0.6, Math.min(0.6, particle.vy))

        // Breathing opacity effect
        const breathingOpacity = particle.opacity * (0.8 + 0.2 * Math.sin(time + particle.life * 0.01))

        // Draw mist particle
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size)
        gradient.addColorStop(0, `rgba(255, 165, 0, ${breathingOpacity})`)
        gradient.addColorStop(0.4, `rgba(255, 140, 0, ${breathingOpacity * 0.6})`)
        gradient.addColorStop(0.8, `rgba(255, 120, 0, ${breathingOpacity * 0.3})`)
        gradient.addColorStop(1, "rgba(255, 165, 0, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Reset particle if it's lived too long
        if (particle.life > particle.maxLife) {
          particle.life = 0
          particle.x = Math.random() * canvas.width
          particle.y = Math.random() * canvas.height
          particle.vx = (Math.random() - 0.5) * 0.4
          particle.vy = (Math.random() - 0.5) * 0.3
        }
      })

      // Update triangle network animation
      triangleNodesRef.current.forEach((node, index) => {
        node.activationTime += 1
        if (node.activationTime > 300 + Math.random() * 400) {
          node.active = true
          node.activationTime = 0

          // Activate connected lines
          triangleLinesRef.current.forEach((line) => {
            if (line.from === index && Math.random() > 0.6) {
              line.active = true
              line.progress = 0
            }
          })
        }

        if (node.activationTime > 120) {
          node.active = false
        }
      })

      // Update triangle lines
      triangleLinesRef.current.forEach((line) => {
        if (line.active) {
          line.progress += 0.015
          line.opacity = Math.min(0.12, line.opacity + 0.008)

          if (line.progress >= 1) {
            line.active = false
            line.progress = 0
            // Activate target node
            const targetNode = triangleNodesRef.current[line.to]
            if (targetNode && Math.random() > 0.4) {
              targetNode.active = true
              targetNode.activationTime = 0
            }
          }
        } else {
          line.opacity = Math.max(0, line.opacity - 0.003)
        }

        // Draw triangle line
        if (line.opacity > 0) {
          const fromNode = triangleNodesRef.current[line.from]
          const toNode = triangleNodesRef.current[line.to]

          if (fromNode && toNode) {
            // Add subtle glow effect
            ctx.shadowColor = "rgba(255, 165, 0, 0.3)"
            ctx.shadowBlur = 2

            ctx.strokeStyle = `rgba(255, 165, 0, ${line.opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(fromNode.x, fromNode.y)

            if (line.active) {
              // Animated line drawing
              const currentX = fromNode.x + (toNode.x - fromNode.x) * line.progress
              const currentY = fromNode.y + (toNode.y - fromNode.y) * line.progress
              ctx.lineTo(currentX, currentY)
            } else {
              ctx.lineTo(toNode.x, toNode.y)
            }

            ctx.stroke()
            ctx.shadowBlur = 0
          }
        }
      })

      // Draw triangle nodes
      triangleNodesRef.current.forEach((node) => {
        if (node.active) {
          // Node glow
          const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12)
          gradient.addColorStop(0, "rgba(255, 165, 0, 0.15)")
          gradient.addColorStop(0.5, "rgba(255, 165, 0, 0.08)")
          gradient.addColorStop(1, "rgba(255, 165, 0, 0)")

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(node.x, node.y, 12, 0, Math.PI * 2)
          ctx.fill()

          // Node core
          ctx.fillStyle = "rgba(255, 165, 0, 0.2)"
          ctx.beginPath()
          ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Background Animation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: "transparent" }}
      />

      {/* Animated background particles */}
      <div className="absolute inset-0 z-1">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-orange-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-16 text-center">
          <Badge className="mb-6 bg-blue-600/20 text-blue-300 border-blue-500/30">⚡ AI-Powered Solar Analysis</Badge>

          <div className="relative">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Smarter Solar Starts Here
            </h1>

            {/* Yellowish-orange mist effect */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-4">
              <div className="w-full h-20 bg-gradient-to-b from-yellow-400/20 via-orange-400/15 to-transparent blur-3xl"></div>
              <div className="absolute top-0 left-1/4 w-3/4 h-16 bg-gradient-to-b from-orange-400/25 via-yellow-400/20 to-transparent blur-2xl"></div>
              <div className="absolute top-0 left-1/3 w-1/2 h-12 bg-gradient-to-b from-yellow-500/30 via-orange-500/25 to-transparent blur-xl"></div>
            </div>
          </div>

          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto mt-12">
            Advanced AI-powered solar analysis with comprehensive energy modeling, financial projections, and
            personalized recommendations for your property.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg"
            >
              <Link href="/calculator">Start Free Analysis →</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 text-lg bg-transparent"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </section>

        {/* Solar Process Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Complete Solar Analysis Process</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Our advanced AI system analyzes every aspect of your solar potential with precision and accuracy
          </p>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
            <Card className="bg-slate-800/50 border-yellow-500/50 p-4">
              <CardContent className="text-center">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  1
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Property Analysis</h4>
                <p className="text-slate-300 text-sm">
                  Advanced roof analysis and shading assessment using satellite imagery
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-blue-500/50 p-4">
              <CardContent className="text-center">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  2
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Energy Modeling</h4>
                <p className="text-slate-300 text-sm">
                  Precise solar production calculations based on local weather data
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-green-500/50 p-4">
              <CardContent className="text-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  3
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Financial Analysis</h4>
                <p className="text-slate-300 text-sm">
                  Comprehensive cost-benefit analysis with incentives and financing
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-orange-500/50 p-4">
              <CardContent className="text-center">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-lg">
                  4
                </div>
                <h4 className="text-lg font-semibold mb-2 text-white">Custom Report</h4>
                <p className="text-slate-300 text-sm">Detailed recommendations and implementation roadmap</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild className="bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-lg font-semibold">
              <Link href="/calculator">Get Your Analysis</Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 text-lg bg-transparent"
            >
              <Link href="/pricing">View Pro Features</Link>
            </Button>
          </div>

          {/* Location Status */}
          <div className="mb-8">
            {locationLoading ? (
              <div className="flex items-center justify-center text-slate-400">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing solar potential for your area...
              </div>
            ) : locationError ? (
              <div className="flex items-center justify-center text-orange-400">
                <AlertCircle className="w-4 h-4 mr-2" />
                {locationError}
              </div>
            ) : location ? (
              <div className="flex items-center justify-center text-green-400">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Ready to analyze solar potential for your location.
              </div>
            ) : null}
          </div>
        </section>

        {/* Solar Score Section - REMOVED THE POPUP CONTENT BUT KEPT THE SECTION */}
        {location && (
          <section className="container mx-auto px-4 py-16 text-center">
            {/* Location Display - Simple text only, no popup */}
            <div className="mb-8">
              <div className="flex items-center justify-center text-slate-300 mb-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-lg">
                  {location.city}
                  {location.state && `, ${location.state}`}
                  {location.country && location.country !== "US" && `, ${location.country}`}
                </span>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-12 text-white">Your Solar Potential Score</h2>

            {/* Solar Score Circle */}
            <div className="mb-8">
              <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-green-400 to-yellow-400 flex items-center justify-center relative">
                <span className="text-6xl font-bold text-white">92</span>
                <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full border-2 border-white/10 animate-ping"></div>
              </div>
            </div>

            <p className="text-lg text-slate-300 mb-8 max-w-3xl mx-auto">
              Your location has excellent solar potential! Optimal sun exposure, favorable policies, and strong
              financial incentives create ideal conditions for solar investment.
            </p>

            {/* Solar Analysis */}
            <Card className="max-w-4xl mx-auto bg-slate-800/50 border-orange-500/50 border-2">
              <CardContent className="p-6 text-left">
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-orange-500 rounded mr-3">⚡</div>
                  <h3 className="text-xl font-semibold text-orange-400">Comprehensive Solar Analysis:</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Based on your location's solar irradiance, roof characteristics, and local utility rates, a solar
                  system could generate approximately{" "}
                  <span className="text-green-400 font-semibold">10,400 kWh/year</span>. With current incentives and net
                  metering policies, this translates to potential savings of{" "}
                  <span className="text-green-400 font-semibold">$1,400–$1,800 annually</span> while significantly
                  reducing your carbon footprint and increasing property value.
                </p>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">Why Choose The Solar Grind?</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Advanced AI-powered analysis delivers the most accurate and comprehensive solar assessments available.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">AI-Powered Calculator</h3>
                <p className="text-slate-300">
                  Advanced machine learning algorithms analyze your property with satellite imagery and weather data
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Financial Analytics</h3>
                <p className="text-slate-300">
                  Comprehensive financial modeling with real-time incentive tracking and ROI projections
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <CardContent className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">Professional Reports</h3>
                <p className="text-slate-300">
                  Detailed analysis reports with actionable insights and implementation recommendations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">50,000+</div>
              <div className="text-slate-400">Properties Analyzed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">2.5M kWh</div>
              <div className="text-slate-400">Solar Potential Calculated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">1,200 tons</div>
              <div className="text-slate-400">CO₂ Reduction Projected</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">$15M+</div>
              <div className="text-slate-400">Savings Identified</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
