"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { toast } from "sonner"
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  MapPin,
  Zap,
  FileText,
  Crown,
  Car,
  Waves,
  Sun,
  CheckCircle,
  Loader2,
  Home,
  Download,
  Satellite,
  Eye,
  Camera,
  CreditCard,
  BarChart3,
  PieChart,
  LineChart,
  FileBarChart,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase"

interface CalculationStep {
  id: number
  title: string
  description: string
  completed: boolean
}

interface FormData {
  // Step 1: Address Input
  address: string
  coordinates: { lat: number; lng: number } | null
  placeId: string

  // Step 2: Sunlight & Obstruction Analysis
  elevation: number
  roofOrientation: string
  shadingObstructions: string[]
  peakSunHours: number
  terrainSlope: number

  // Step 3: Utility Rate Lookup
  utilityProvider: string
  electricityRate: number
  netMeteringPolicy: string
  connectionFee: number
  tieredRates: boolean

  // Step 4: Usage Estimation
  homeSize: number
  residents: number
  applianceType: string[]
  monthlyBill: number
  monthlyKwh: number
  hasEV: boolean
  evCount: number
  hasPool: boolean
  hasHotTub: boolean

  // Step 5: System Sizing
  systemSizeKw: number
  panelCount: number
  panelWattage: number
  roofSpaceRequired: number
  offsetPercentage: number

  // Step 6: Loan Calculator
  loanTerm: number
  interestRate: number
  utilityEscalation: number
  monthlyPayment: number
  totalLoanCost: number

  // Step 7: Visual Results
  aerialImageUrl: string
  streetViewImageUrl: string
  annualSavings: number
  paybackPeriod: number
  co2Offset: number

  // Step 8: Contact Info
  customerName: string
  customerEmail: string
  customerPhone: string
  wantsPDF: boolean
}

const steps: CalculationStep[] = [
  { id: 1, title: "Address Input", description: "Enter your property address", completed: false },
  { id: 2, title: "Sunlight Analysis", description: "Analyze sun exposure and obstructions", completed: false },
  { id: 3, title: "Utility Rates", description: "Look up your electricity provider rates", completed: false },
  { id: 4, title: "Usage Estimation", description: "Calculate your energy consumption", completed: false },
  { id: 5, title: "System Sizing", description: "Design your optimal solar system", completed: false },
  { id: 6, title: "Financing Options", description: "Calculate loan and payment options", completed: false },
  { id: 7, title: "Visual Results", description: "See your solar analysis results", completed: false },
  { id: 8, title: "Professional Report", description: "Download comprehensive PDF report", completed: false },
]

const utilityProviders = [
  { value: "centerpoint", label: "CenterPoint Energy", rate: 0.12, netMetering: "Full Credit", fee: 15 },
  { value: "oncor", label: "Oncor Electric Delivery", rate: 0.11, netMetering: "Full Credit", fee: 15 },
  { value: "aep", label: "American Electric Power (AEP)", rate: 0.13, netMetering: "Avoided Cost", fee: 20 },
  { value: "tnmp", label: "Texas-New Mexico Power", rate: 0.14, netMetering: "Avoided Cost", fee: 18 },
  { value: "austin-energy", label: "Austin Energy", rate: 0.1, netMetering: "Full Credit", fee: 10 },
  { value: "cps-energy", label: "CPS Energy (San Antonio)", rate: 0.09, netMetering: "Avoided Cost", fee: 12 },
  { value: "pec", label: "Pedernales Electric Cooperative", rate: 0.11, netMetering: "Full Credit", fee: 25 },
  { value: "other", label: "Other Provider", rate: 0.12, netMetering: "Varies", fee: 15 },
]

const applianceTypes = [
  { value: "gas-dryer", label: "Gas Dryer", kwh: 0 },
  { value: "electric-dryer", label: "Electric Dryer", kwh: 200 },
  { value: "gas-water-heater", label: "Gas Water Heater", kwh: 0 },
  { value: "electric-water-heater", label: "Electric Water Heater", kwh: 400 },
  { value: "gas-stove", label: "Gas Stove/Oven", kwh: 0 },
  { value: "electric-stove", label: "Electric Stove/Oven", kwh: 150 },
  { value: "central-ac", label: "Central Air Conditioning", kwh: 800 },
  { value: "window-ac", label: "Window AC Units", kwh: 300 },
  { value: "heat-pump", label: "Heat Pump", kwh: 600 },
]

const shadingOptions = [
  { value: "none", label: "No Shading", impact: 0 },
  { value: "minimal-trees", label: "Minimal Trees", impact: 5 },
  { value: "moderate-trees", label: "Moderate Trees", impact: 15 },
  { value: "heavy-trees", label: "Heavy Tree Coverage", impact: 30 },
  { value: "nearby-buildings", label: "Nearby Buildings", impact: 20 },
  { value: "chimneys", label: "Chimneys/Vents", impact: 5 },
  { value: "power-lines", label: "Power Lines", impact: 10 },
]

export default function ProCalculatorPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseAvailable, setSupabaseAvailable] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const [calculating, setCalculating] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [analyzingProperty, setAnalyzingProperty] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    // Step 1: Address Input
    address: "",
    coordinates: null,
    placeId: "",

    // Step 2: Sunlight & Obstruction Analysis
    elevation: 0,
    roofOrientation: "south",
    shadingObstructions: [],
    peakSunHours: 5.8,
    terrainSlope: 0,

    // Step 3: Utility Rate Lookup
    utilityProvider: "",
    electricityRate: 0.12,
    netMeteringPolicy: "Full Credit",
    connectionFee: 15,
    tieredRates: false,

    // Step 4: Usage Estimation
    homeSize: 2000,
    residents: 2,
    applianceType: [],
    monthlyBill: 150,
    monthlyKwh: 1250,
    hasEV: false,
    evCount: 1,
    hasPool: false,
    hasHotTub: false,

    // Step 5: System Sizing
    systemSizeKw: 0,
    panelCount: 0,
    panelWattage: 440,
    roofSpaceRequired: 0,
    offsetPercentage: 100,

    // Step 6: Loan Calculator
    loanTerm: 25,
    interestRate: 3.99,
    utilityEscalation: 3.5,
    monthlyPayment: 0,
    totalLoanCost: 0,

    // Step 7: Visual Results
    aerialImageUrl: "",
    streetViewImageUrl: "",
    annualSavings: 0,
    paybackPeriod: 0,
    co2Offset: 0,

    // Step 8: Contact Info
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    wantsPDF: false,
  })

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const supabase = createClient()
        if (supabase) {
          setSupabaseAvailable(true)
          const {
            data: { session },
          } = await supabase.auth.getSession()
          setUser(session?.user || null)
        } else {
          setSupabaseAvailable(false)
          console.warn("Supabase not configured - running in demo mode")
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        setSupabaseAvailable(false)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.address && formData.coordinates)
      case 2:
        return formData.peakSunHours > 0
      case 3:
        return !!formData.utilityProvider
      case 4:
        return formData.homeSize > 0 && formData.residents > 0
      case 5:
        return formData.systemSizeKw > 0
      case 6:
        return formData.loanTerm > 0 && formData.interestRate > 0
      case 7:
        return formData.annualSavings > 0
      case 8:
        return true // Optional step
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 8) {
        setCurrentStep(currentStep + 1)
        // Auto-calculate when moving to certain steps
        if (currentStep === 4) {
          calculateSystemSizing()
        } else if (currentStep === 5) {
          calculateFinancing()
        } else if (currentStep === 6) {
          calculateResults()
        }
      }
    } else {
      toast.error("Please complete this step", { description: "Fill in the required information before proceeding." })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Step 1: Address Input with Geocoding
  const handleAddressSelect = async (address: string, placeId: string) => {
    updateFormData("address", address)
    updateFormData("placeId", placeId)

    try {
      // Geocode the address
      const response = await fetch(`/api/geocoding?place_id=${placeId}&address=${encodeURIComponent(address)}`)
      const data = await response.json()

      if (data.lat && data.lng) {
        updateFormData("coordinates", { lat: data.lat, lng: data.lng })

        // Load property images
        await loadPropertyImages({ lat: data.lat, lng: data.lng })

        toast.success("Address confirmed", { description: "Property location and images loaded successfully." })
      } else {
        throw new Error("Could not geocode address")
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      toast.error("Address Error", { description: "Could not find coordinates for this address." })
    }
  }

  // Load aerial and street view images
  const loadPropertyImages = async (coordinates: { lat: number; lng: number }) => {
    setLoadingImages(true)

    try {
      // Load aerial view for roof analysis
      const aerialUrl = `/api/aerial-view?lat=${coordinates.lat}&lng=${coordinates.lng}&zoom=20&size=600x400`
      updateFormData("aerialImageUrl", aerialUrl)

      // Load street view for obstruction analysis
      const streetViewUrl = `/api/street-view?lat=${coordinates.lat}&lng=${coordinates.lng}&heading=0&size=600x400`
      updateFormData("streetViewImageUrl", streetViewUrl)
    } catch (error) {
      console.error("Error loading property images:", error)
      toast.error("Image Loading Failed", {
        description: "Could not load property images. Continuing without visual analysis.",
      })
    } finally {
      setLoadingImages(false)
    }
  }

  // Step 2: Sunlight & Obstruction Analysis
  const analyzeSunlightAndObstructions = async () => {
    if (!formData.coordinates) return

    setAnalyzingProperty(true)

    try {
      // Get elevation data
      const elevationResponse = await fetch(
        `/api/elevation?lat=${formData.coordinates.lat}&lng=${formData.coordinates.lng}`,
      )
      const elevationData = await elevationResponse.json()

      if (elevationData.success) {
        updateFormData("elevation", Math.round(elevationData.data.elevation * 3.28084)) // Convert to feet
      }

      // Calculate peak sun hours based on location (simplified)
      const latitude = Math.abs(formData.coordinates.lat)
      let peakSunHours = 5.8 // Default for Texas

      if (latitude < 25) peakSunHours = 6.5
      else if (latitude < 35) peakSunHours = 5.8
      else if (latitude < 45) peakSunHours = 5.2
      else peakSunHours = 4.5

      // Adjust for shading obstructions
      const shadingReduction = formData.shadingObstructions.reduce((total, obstruction) => {
        const option = shadingOptions.find((opt) => opt.value === obstruction)
        return total + (option?.impact || 0)
      }, 0)

      const adjustedSunHours = peakSunHours * (1 - shadingReduction / 100)
      updateFormData("peakSunHours", Math.round(adjustedSunHours * 10) / 10)

      toast.success("Analysis Complete", { description: `Peak sun hours: ${adjustedSunHours.toFixed(1)} hours/day` })
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error("Analysis Failed", { description: "Could not complete sunlight analysis." })
    } finally {
      setAnalyzingProperty(false)
    }
  }

  // Step 3: Utility Rate Lookup
  const handleUtilityProviderChange = (providerId: string) => {
    const provider = utilityProviders.find((p) => p.value === providerId)
    if (provider) {
      updateFormData("utilityProvider", providerId)
      updateFormData("electricityRate", provider.rate)
      updateFormData("netMeteringPolicy", provider.netMetering)
      updateFormData("connectionFee", provider.fee)

      toast.success("Utility Rates Loaded", {
        description: `Rate: $${provider.rate}/kWh, Net Metering: ${provider.netMetering}`,
      })
    }
  }

  // Step 4: Usage Estimation
  const calculateUsageEstimation = () => {
    let estimatedKwh = formData.monthlyKwh

    // Adjust based on home size
    const sizeMultiplier = formData.homeSize / 2000 // Base 2000 sqft
    estimatedKwh = estimatedKwh * sizeMultiplier

    // Adjust based on residents
    const residentMultiplier = formData.residents / 2 // Base 2 residents
    estimatedKwh = estimatedKwh * residentMultiplier

    // Add appliance usage
    const applianceKwh = formData.applianceType.reduce((total, appliance) => {
      const app = applianceTypes.find((a) => a.value === appliance)
      return total + (app?.kwh || 0)
    }, 0)

    estimatedKwh += applianceKwh

    // Add EV and pool usage
    if (formData.hasEV) estimatedKwh += 350 * formData.evCount
    if (formData.hasPool) estimatedKwh += 250
    if (formData.hasHotTub) estimatedKwh += 120

    updateFormData("monthlyKwh", Math.round(estimatedKwh))
    updateFormData("monthlyBill", Math.round(estimatedKwh * formData.electricityRate))
  }

  // Step 5: System Sizing
  const calculateSystemSizing = () => {
    const annualKwh = formData.monthlyKwh * 12
    const systemEfficiency = 0.85 // Real-world efficiency

    // Calculate system size needed for desired offset
    const targetProduction = annualKwh * (formData.offsetPercentage / 100)
    const systemSizeKw = targetProduction / (formData.peakSunHours * 365 * systemEfficiency)

    const panelCount = Math.ceil((systemSizeKw * 1000) / formData.panelWattage)
    const actualSystemSize = (panelCount * formData.panelWattage) / 1000
    const roofSpaceRequired = panelCount * 20 // ~20 sqft per panel

    updateFormData("systemSizeKw", Math.round(actualSystemSize * 10) / 10)
    updateFormData("panelCount", panelCount)
    updateFormData("roofSpaceRequired", roofSpaceRequired)

    toast.success("System Sized", {
      description: `${actualSystemSize.toFixed(1)} kW system with ${panelCount} panels`,
    })
  }

  // Step 6: Loan Calculator
  const calculateFinancing = () => {
    const systemCost = formData.systemSizeKw * 3000 // $3/watt
    const federalTaxCredit = systemCost * 0.3
    const netCost = systemCost - federalTaxCredit

    // Calculate monthly payment
    const monthlyRate = formData.interestRate / 100 / 12
    const numPayments = formData.loanTerm * 12
    const monthlyPayment =
      (netCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)

    const totalLoanCost = monthlyPayment * numPayments

    updateFormData("monthlyPayment", Math.round(monthlyPayment))
    updateFormData("totalLoanCost", Math.round(totalLoanCost))

    toast.success("Financing Calculated", {
      description: `Monthly payment: $${Math.round(monthlyPayment)}`,
    })
  }

  // Step 7: Calculate Results
  const calculateResults = () => {
    const annualProduction = formData.systemSizeKw * formData.peakSunHours * 365 * 0.85
    const annualSavings = Math.min(annualProduction, formData.monthlyKwh * 12) * formData.electricityRate
    const systemCost = formData.systemSizeKw * 3000
    const netCost = systemCost * 0.7 // After 30% tax credit
    const paybackPeriod = netCost / annualSavings
    const co2Offset = annualProduction * 0.0007 // tons CO2 per kWh

    updateFormData("annualSavings", Math.round(annualSavings))
    updateFormData("paybackPeriod", Math.round(paybackPeriod * 10) / 10)
    updateFormData("co2Offset", Math.round(co2Offset * 10) / 10)

    toast.success("Analysis Complete", {
      description: `Annual savings: $${Math.round(annualSavings).toLocaleString()}`,
    })
  }

  // Step 8: Generate PDF Report
  const generatePDFReport = () => {
    toast.success("PDF Report Generated", {
      description: "Your comprehensive solar analysis report is being prepared.",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-lg font-medium">Loading Pro Calculator...</p>
        </div>
      </div>
    )
  }

  const progressPercentage = (currentStep / 8) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <div className="border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <Sun className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Advanced Solar Calculator</span>
                <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of 8 • {Math.round(progressPercentage)}% Complete
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-3 bg-gray-200" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        {!supabaseAvailable && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Sun className="h-5 w-5" />
              <span className="font-medium">Demo Mode</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Running in demo mode. Some features may be limited without full configuration.
            </p>
          </div>
        )}

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-purple-600/5 to-blue-600/5">
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Step indicators */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        index + 1 === currentStep
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                          : index + 1 < currentStep || validateStep(index + 1)
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index + 1 < currentStep || validateStep(index + 1) ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 h-1 mx-1 rounded transition-colors ${
                          index + 1 < currentStep ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <CardTitle className="text-3xl flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {currentStep === 1 && <MapPin className="h-8 w-8 text-purple-600" />}
              {currentStep === 2 && <Sun className="h-8 w-8 text-yellow-600" />}
              {currentStep === 3 && <Zap className="h-8 w-8 text-blue-600" />}
              {currentStep === 4 && <Home className="h-8 w-8 text-green-600" />}
              {currentStep === 5 && <Calculator className="h-8 w-8 text-purple-600" />}
              {currentStep === 6 && <CreditCard className="h-8 w-8 text-amber-600" />}
              {currentStep === 7 && <BarChart3 className="h-8 w-8 text-cyan-600" />}
              {currentStep === 8 && <FileText className="h-8 w-8 text-green-600" />}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 p-8">
            {/* Step 1: Address Input */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Enter your property address</h3>
                  <p className="text-muted-foreground">
                    We'll use Google Maps to get precise coordinates and analyze your property
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    placeholder="123 Main Street, Austin, TX 78701"
                    className="text-lg p-4 border-2 border-purple-200 focus:border-purple-500"
                  />
                </div>

                {formData.address && (
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">Address confirmed: {formData.address}</p>
                      {formData.coordinates && (
                        <p className="text-sm text-green-600 mt-1">
                          Coordinates: {formData.coordinates.lat.toFixed(4)}, {formData.coordinates.lng.toFixed(4)}
                        </p>
                      )}
                    </div>

                    {/* Property Images */}
                    {loadingImages ? (
                      <div className="text-center p-8 bg-gray-50 rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                        <p className="text-lg font-medium">Loading property images...</p>
                        <p className="text-sm text-muted-foreground">Analyzing aerial and street views</p>
                      </div>
                    ) : (
                      formData.aerialImageUrl && (
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-center flex items-center justify-center gap-2">
                            <Satellite className="h-5 w-5 text-purple-600" />
                            Property Analysis
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Aerial View */}
                            <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                              <h5 className="font-medium mb-2 flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Aerial View - Roof Analysis
                              </h5>
                              <div className="relative">
                                <Image
                                  src={
                                    formData.aerialImageUrl || "/placeholder.svg?height=400&width=600&text=Aerial+View"
                                  }
                                  alt="Aerial view of property showing roof for solar panel analysis"
                                  width={600}
                                  height={400}
                                  className="w-full rounded-lg"
                                />
                                <Badge className="absolute top-2 right-2 bg-purple-600">
                                  <Satellite className="h-3 w-3 mr-1" />
                                  AI Ready
                                </Badge>
                              </div>
                            </div>

                            {/* Street View */}
                            <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                              <h5 className="font-medium mb-2 flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                Street View - Obstruction Analysis
                              </h5>
                              <div className="relative">
                                <Image
                                  src={
                                    formData.streetViewImageUrl ||
                                    "/placeholder.svg?height=400&width=600&text=Street+View" ||
                                    "/placeholder.svg"
                                  }
                                  alt="Street view showing potential obstructions and shading sources"
                                  width={600}
                                  height={400}
                                  className="w-full rounded-lg"
                                />
                                <Badge className="absolute top-2 right-2 bg-blue-600">
                                  <Camera className="h-3 w-3 mr-1" />
                                  Analysis Ready
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Sunlight & Obstruction Analysis */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Sun className="h-10 w-10 text-yellow-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Sunlight & Obstruction Analysis</h3>
                  <p className="text-muted-foreground">
                    Analyze sun exposure, terrain, and potential shading obstructions
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Roof Orientation */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Roof Orientation</Label>
                    <Select
                      value={formData.roofOrientation}
                      onValueChange={(value) => updateFormData("roofOrientation", value)}
                    >
                      <SelectTrigger className="text-lg p-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="south">South (Best - 100% efficiency)</SelectItem>
                        <SelectItem value="southwest">Southwest (Excellent - 95%)</SelectItem>
                        <SelectItem value="southeast">Southeast (Excellent - 95%)</SelectItem>
                        <SelectItem value="west">West (Good - 88%)</SelectItem>
                        <SelectItem value="east">East (Good - 88%)</SelectItem>
                        <SelectItem value="northwest">Northwest (Fair - 75%)</SelectItem>
                        <SelectItem value="northeast">Northeast (Fair - 75%)</SelectItem>
                        <SelectItem value="north">North (Limited - 68%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Shading Obstructions */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Shading Obstructions (Select all that apply)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {shadingOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={option.value}
                            checked={formData.shadingObstructions.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData("shadingObstructions", [...formData.shadingObstructions, option.value])
                              } else {
                                updateFormData(
                                  "shadingObstructions",
                                  formData.shadingObstructions.filter((item) => item !== option.value),
                                )
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={option.value} className="text-sm">
                            {option.label} (-{option.impact}%)
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Analysis Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-blue-600">{formData.elevation} ft</div>
                      <div className="text-sm text-muted-foreground">Property Elevation</div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-yellow-600">{formData.peakSunHours}</div>
                      <div className="text-sm text-muted-foreground">Peak Sun Hours/Day</div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-green-600">{formData.terrainSlope}°</div>
                      <div className="text-sm text-muted-foreground">Terrain Slope</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <Button
                    onClick={analyzeSunlightAndObstructions}
                    disabled={analyzingProperty}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    {analyzingProperty ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Property...
                      </>
                    ) : (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Analyze Sunlight & Obstructions
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Utility Rate Lookup */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Utility Rate Lookup</h3>
                  <p className="text-muted-foreground">
                    Select your electricity provider to get accurate rate information
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label className="text-lg font-medium">Electric Utility Provider</Label>
                    <Select value={formData.utilityProvider} onValueChange={handleUtilityProviderChange}>
                      <SelectTrigger className="text-lg p-4">
                        <SelectValue placeholder="Select your utility provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {utilityProviders.map((provider) => (
                          <SelectItem key={provider.value} value={provider.value}>
                            {provider.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.utilityProvider && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Rate Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-600">Electricity Rate:</span>
                          <div className="font-bold">${formData.electricityRate}/kWh</div>
                        </div>
                        <div>
                          <span className="text-blue-600">Connection Fee:</span>
                          <div className="font-bold">${formData.connectionFee}/month</div>
                        </div>
                        <div className="col-span-2">
                          <span className="text-blue-600">Net Metering Policy:</span>
                          <div className="font-bold">{formData.netMeteringPolicy}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Usage Estimation */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Home className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Usage Estimation</h3>
                  <p className="text-muted-foreground">Tell us about your home and energy usage patterns</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Home Details */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="homeSize">Home Size (Square Feet)</Label>
                      <Input
                        id="homeSize"
                        type="number"
                        value={formData.homeSize}
                        onChange={(e) => updateFormData("homeSize", Number(e.target.value))}
                        className="text-lg p-4"
                      />
                    </div>

                    <div>
                      <Label htmlFor="residents">Number of Residents</Label>
                      <Input
                        id="residents"
                        type="number"
                        value={formData.residents}
                        onChange={(e) => updateFormData("residents", Number(e.target.value))}
                        className="text-lg p-4"
                      />
                    </div>

                    <div>
                      <Label htmlFor="monthlyBill">Current Monthly Bill</Label>
                      <Input
                        id="monthlyBill"
                        type="number"
                        value={formData.monthlyBill}
                        onChange={(e) => updateFormData("monthlyBill", Number(e.target.value))}
                        className="text-lg p-4"
                      />
                    </div>
                  </div>

                  {/* Appliances */}
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">Major Appliances (Select all that apply)</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {applianceTypes.map((appliance) => (
                        <div key={appliance.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={appliance.value}
                            checked={formData.applianceType.includes(appliance.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData("applianceType", [...formData.applianceType, appliance.value])
                              } else {
                                updateFormData(
                                  "applianceType",
                                  formData.applianceType.filter((item) => item !== appliance.value),
                                )
                              }
                            }}
                            className="rounded"
                          />
                          <Label htmlFor={appliance.value} className="text-sm">
                            {appliance.label} {appliance.kwh > 0 && `(+${appliance.kwh} kWh/month)`}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Usage */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Electric Vehicle</span>
                      </div>
                      <Button
                        variant={formData.hasEV ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFormData("hasEV", !formData.hasEV)}
                      >
                        {formData.hasEV ? "Yes" : "No"}
                      </Button>
                    </div>
                    {formData.hasEV && (
                      <div>
                        <Label>Number of EVs</Label>
                        <Input
                          type="number"
                          value={formData.evCount}
                          onChange={(e) => updateFormData("evCount", Number(e.target.value))}
                          min="1"
                          max="5"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Waves className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">Swimming Pool</span>
                      </div>
                      <Button
                        variant={formData.hasPool ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFormData("hasPool", !formData.hasPool)}
                      >
                        {formData.hasPool ? "Yes" : "No"}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border-2 border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Waves className="h-5 w-5 text-purple-600" />
                        <span className="font-medium">Hot Tub</span>
                      </div>
                      <Button
                        variant={formData.hasHotTub ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFormData("hasHotTub", !formData.hasHotTub)}
                      >
                        {formData.hasHotTub ? "Yes" : "No"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={calculateUsageEstimation}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate Usage Estimation
                  </Button>
                </div>

                {formData.monthlyKwh > 0 && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-green-800 font-medium">
                      Estimated Monthly Usage: {formData.monthlyKwh.toLocaleString()} kWh
                    </p>
                    <p className="text-sm text-green-600">
                      Estimated Monthly Bill: ${formData.monthlyBill.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: System Sizing */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <Calculator className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">System Sizing</h3>
                  <p className="text-muted-foreground">Design your optimal solar system based on your energy needs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* System Configuration */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="offsetPercentage">Energy Offset Goal (%)</Label>
                      <Input
                        id="offsetPercentage"
                        type="number"
                        value={formData.offsetPercentage}
                        onChange={(e) => updateFormData("offsetPercentage", Number(e.target.value))}
                        min="50"
                        max="120"
                        className="text-lg p-4"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        100% = full offset, 120% = surplus for future needs
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="panelWattage">Panel Wattage</Label>
                      <Select
                        value={formData.panelWattage.toString()}
                        onValueChange={(value) => updateFormData("panelWattage", Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="410">410W Panels (Standard)</SelectItem>
                          <SelectItem value="440">440W Panels (High Efficiency)</SelectItem>
                          <SelectItem value="480">480W Panels (Premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* System Results */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-purple-600">{formData.systemSizeKw} kW</div>
                          <div className="text-sm text-muted-foreground">System Size</div>
                        </CardContent>
                      </Card>

                      <Card className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-blue-600">{formData.panelCount}</div>
                          <div className="text-sm text-muted-foreground">Solar Panels</div>
                        </CardContent>
                      </Card>

                      <Card className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-green-600">{formData.roofSpaceRequired}</div>
                          <div className="text-sm text-muted-foreground">Roof Space (sq ft)</div>
                        </CardContent>
                      </Card>

                      <Card className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-amber-600">{formData.offsetPercentage}%</div>
                          <div className="text-sm text-muted-foreground">Energy Offset</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={calculateSystemSizing}
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculate System Size
                  </Button>
                </div>
              </div>
            )}

            {/* Step 6: Loan Calculator */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <CreditCard className="h-10 w-10 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Financing Options</h3>
                  <p className="text-muted-foreground">
                    Calculate loan payments and compare with current utility costs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Loan Parameters */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                      <Select
                        value={formData.loanTerm.toString()}
                        onValueChange={(value) => updateFormData("loanTerm", Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 Years</SelectItem>
                          <SelectItem value="15">15 Years</SelectItem>
                          <SelectItem value="20">20 Years</SelectItem>
                          <SelectItem value="25">25 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.01"
                        value={formData.interestRate}
                        onChange={(e) => updateFormData("interestRate", Number(e.target.value))}
                        className="text-lg p-4"
                      />
                    </div>

                    <div>
                      <Label htmlFor="utilityEscalation">Utility Rate Escalation (%/year)</Label>
                      <Input
                        id="utilityEscalation"
                        type="number"
                        step="0.1"
                        value={formData.utilityEscalation}
                        onChange={(e) => updateFormData("utilityEscalation", Number(e.target.value))}
                        className="text-lg p-4"
                      />
                    </div>
                  </div>

                  {/* Payment Comparison */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-red-600">${formData.monthlyBill}</div>
                          <div className="text-sm text-muted-foreground">Current Utility Bill</div>
                        </CardContent>
                      </Card>

                      <Card className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-green-600">${formData.monthlyPayment}</div>
                          <div className="text-sm text-muted-foreground">Solar Loan Payment</div>
                        </CardContent>
                      </Card>

                      <Card className="text-center col-span-2">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            ${Math.max(0, formData.monthlyBill - formData.monthlyPayment)}
                          </div>
                          <div className="text-sm text-muted-foreground">Monthly Savings</div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">Loan Summary</h4>
                      <div className="text-sm space-y-1">
                        <div>System Cost: ${(formData.systemSizeKw * 3000).toLocaleString()}</div>
                        <div>Federal Tax Credit (30%): -${(formData.systemSizeKw * 3000 * 0.3).toLocaleString()}</div>
                        <div>Net Financed Amount: ${(formData.systemSizeKw * 3000 * 0.7).toLocaleString()}</div>
                        <div>
                          Total Interest: $
                          {(formData.totalLoanCost - formData.systemSizeKw * 3000 * 0.7).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={calculateFinancing}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Calculate Financing
                  </Button>
                </div>
              </div>
            )}

            {/* Step 7: Visual Results */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <BarChart3 className="h-10 w-10 text-cyan-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Visual Results</h3>
                  <p className="text-muted-foreground">See your complete solar analysis with charts and projections</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-green-600">
                        ${formData.annualSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">Annual Savings</div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-blue-600">{formData.paybackPeriod} years</div>
                      <div className="text-sm text-muted-foreground">Payback Period</div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-purple-600">{formData.systemSizeKw} kW</div>
                      <div className="text-sm text-muted-foreground">System Size</div>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-green-600">{formData.co2Offset} tons</div>
                      <div className="text-sm text-muted-foreground">CO₂ Offset/Year</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Property Images with Panel Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Satellite className="h-5 w-5" />
                        Aerial View with Proposed Layout
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Image
                          src={
                            formData.aerialImageUrl ||
                            "/placeholder.svg?height=400&width=600&text=Aerial+View+with+Solar+Layout" ||
                            "/placeholder.svg"
                          }
                          alt="Aerial view with proposed solar panel layout"
                          width={600}
                          height={400}
                          className="w-full rounded-lg"
                        />
                        <Badge className="absolute top-2 right-2 bg-green-600">{formData.panelCount} Panels</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Street View
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Image
                          src={formData.streetViewImageUrl || "/placeholder.svg?height=400&width=600&text=Street+View"}
                          alt="Street view of property"
                          width={600}
                          height={400}
                          className="w-full rounded-lg"
                        />
                        <Badge className="absolute top-2 right-2 bg-blue-600">Property View</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 25-Year Projection Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5" />
                      25-Year Financial Projection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <PieChart className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                        <p className="text-lg font-semibold">Interactive Chart</p>
                        <p className="text-sm text-muted-foreground">Solar vs Utility Cost Comparison Over 25 Years</p>
                        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="font-bold text-green-600">Total Savings</div>
                            <div>${(formData.annualSavings * 25).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="font-bold text-blue-600">System ROI</div>
                            <div>
                              {Math.round(((formData.annualSavings * 25) / (formData.systemSizeKw * 3000)) * 100)}%
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-purple-600">Break-even</div>
                            <div>Year {Math.ceil(formData.paybackPeriod)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button
                    onClick={calculateResults}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Visual Results
                  </Button>
                </div>
              </div>
            )}

            {/* Step 8: Professional Report */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Professional Report</h3>
                  <p className="text-muted-foreground">Download your comprehensive solar analysis report</p>
                </div>

                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="customerName">Your Name</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => updateFormData("customerName", e.target.value)}
                      placeholder="John Smith"
                      className="text-lg p-4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email Address</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => updateFormData("customerEmail", e.target.value)}
                      placeholder="john@example.com"
                      className="text-lg p-4"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => updateFormData("customerPhone", e.target.value)}
                      placeholder="(555) 123-4567"
                      className="text-lg p-4"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="wantsPDF"
                      checked={formData.wantsPDF}
                      onChange={(e) => updateFormData("wantsPDF", e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="wantsPDF" className="text-sm">
                      Email me the comprehensive PDF report
                    </Label>
                  </div>
                </div>

                {/* Report Preview */}
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileBarChart className="h-5 w-5" />
                      Report Contents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Executive Summary</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Property Analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>System Specifications</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Financial Projections</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Aerial Imagery</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>25-Year Savings Chart</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Installation Timeline</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Environmental Impact</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <Button
                    onClick={generatePDFReport}
                    disabled={!formData.customerName || !formData.customerEmail}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    size="lg"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Generate Professional Report
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep} of {steps.length}
                </span>
              </div>

              <Button
                onClick={nextStep}
                disabled={!validateStep(currentStep) || calculating}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {calculating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : currentStep === 8 ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Complete Analysis
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
