"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AddressAutocomplete } from "./address-autocomplete"
import { AdvancedSolarResults } from "./advanced-solar-results"
import {
  Crown,
  MapPin,
  Home,
  Zap,
  Sun,
  Battery,
  DollarSign,
  Loader2,
  Satellite,
  FileText,
  ArrowLeft,
  ArrowRight,
  Calculator,
} from "lucide-react"

interface CalculatorData {
  // Step 1: Property Information
  address: string
  coordinates: { lat: number; lng: number } | null
  propertyType: string
  roofType: string
  roofAge: string
  availableRoofArea: number

  // Step 2: Energy Analysis
  monthlyElectricBill: number
  electricityRate: number
  hasTimeOfUseRates: boolean
  peakRate: number
  offPeakRate: number
  hasElectricVehicle: boolean
  evChargingNeeds: number
  hasPool: boolean
  poolUsage: string

  // Step 3: Roof Analysis
  primaryRoofOrientation: string
  roofTilt: number
  shadingLevel: string
  multipleRoofSections: boolean
  roofSections: Array<{
    orientation: string
    area: number
    tilt: number
    shading: string
  }>

  // Step 4: System Preferences
  systemGoal: string
  batteryStorage: boolean
  batteryCapacity: number
  microInverters: boolean
  smartMonitoring: boolean
  panelPreference: string

  // Step 5: Financial Preferences
  purchaseMethod: string
  downPayment: number
  financingTerm: number
  interestRate: number
  includeIncentives: boolean

  // Step 6: Project Information
  customerName: string
  customerEmail: string
  customerPhone: string
  projectType: string
  installationTimeframe: string
  additionalNotes: string
}

const initialData: CalculatorData = {
  address: "",
  coordinates: null,
  propertyType: "",
  roofType: "",
  roofAge: "",
  availableRoofArea: 0,
  monthlyElectricBill: 0,
  electricityRate: 0.12,
  hasTimeOfUseRates: false,
  peakRate: 0.18,
  offPeakRate: 0.08,
  hasElectricVehicle: false,
  evChargingNeeds: 0,
  hasPool: false,
  poolUsage: "",
  primaryRoofOrientation: "",
  roofTilt: 30,
  shadingLevel: "",
  multipleRoofSections: false,
  roofSections: [],
  systemGoal: "",
  batteryStorage: false,
  batteryCapacity: 10,
  microInverters: false,
  smartMonitoring: false,
  panelPreference: "",
  purchaseMethod: "",
  downPayment: 20,
  financingTerm: 20,
  interestRate: 4.5,
  includeIncentives: true,
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  projectType: "",
  installationTimeframe: "",
  additionalNotes: "",
}

export function AdvancedSolarCalculator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<CalculatorData>(initialData)
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [satelliteLoading, setSatelliteLoading] = useState(false)

  const totalSteps = 7
  const progress = (currentStep / totalSteps) * 100

  const updateData = (field: keyof CalculatorData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAddressSelect = (address: string, coordinates: { lat: number; lng: number }) => {
    updateData("address", address)
    updateData("coordinates", coordinates)

    // Simulate satellite imagery loading
    setSatelliteLoading(true)
    setTimeout(() => {
      setSatelliteLoading(false)
    }, 2000)
  }

  const calculateSolarSystem = async () => {
    setIsCalculating(true)

    try {
      // Simulate advanced calculation
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock results based on input data
      const mockResults = {
        systemSizeKw: Math.round(((data.monthlyElectricBill * 12) / (data.electricityRate * 1200)) * 10) / 10,
        panelsNeeded: Math.ceil((data.monthlyElectricBill * 12) / (data.electricityRate * 1200 * 0.4)),
        annualProductionKwh: Math.round((data.monthlyElectricBill * 12) / data.electricityRate),
        annualSavings: Math.round(data.monthlyElectricBill * 12 * 0.9),
        monthlySavings: Math.round(data.monthlyElectricBill * 0.9),
        systemCost: Math.round(((data.monthlyElectricBill * 12) / (data.electricityRate * 1200)) * 3000),
        netCost: Math.round(((data.monthlyElectricBill * 12) / (data.electricityRate * 1200)) * 3000 * 0.7),
        roiYears: Math.round(
          (((data.monthlyElectricBill * 12) / (data.electricityRate * 1200)) * 3000 * 0.7) /
            (data.monthlyElectricBill * 12 * 0.9),
        ),
        peakSunHours: 5.2,
        co2OffsetTons: Math.round(((data.monthlyElectricBill * 12) / (data.electricityRate * 1000)) * 0.4 * 10) / 10,
        treesEquivalent: Math.round(((data.monthlyElectricBill * 12) / (data.electricityRate * 1000)) * 0.4 * 16),
        availableRoofArea: data.availableRoofArea,
        roofOrientation: data.primaryRoofOrientation,
        batteryStorage: data.batteryStorage,
        batteryCapacity: data.batteryCapacity,
        panelWattage: 400,
        microInverters: data.microInverters,
        stateIncentives: 2000,
      }

      setResults(mockResults)
      setCurrentStep(totalSteps)
    } catch (error) {
      console.error("Calculation error:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const getStepTitle = (step: number) => {
    const titles = [
      "Property Information",
      "Energy Analysis",
      "Roof Analysis",
      "System Preferences",
      "Financial Preferences",
      "Project Information",
      "Results",
    ]
    return titles[step - 1]
  }

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return data.address && data.propertyType && data.roofType && data.availableRoofArea > 0
      case 2:
        return data.monthlyElectricBill > 0 && data.electricityRate > 0
      case 3:
        return data.primaryRoofOrientation && data.shadingLevel
      case 4:
        return data.systemGoal
      case 5:
        return data.purchaseMethod
      case 6:
        return data.customerName && data.customerEmail && data.projectType
      default:
        return true
    }
  }

  if (results && currentStep === totalSteps) {
    return <AdvancedSolarResults results={results} />
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-amber-800 to-blue-800 border-amber-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center">
                <Crown className="h-6 w-6 mr-2 text-amber-500" />
                Advanced Solar Calculator
              </h1>
              <p className="text-gray-200">Professional-grade solar system analysis</p>
            </div>
            <Badge className="bg-gradient-to-r from-amber-500 to-blue-500 text-white text-sm px-3 py-1">
              <Crown className="h-4 w-4 mr-1" />
              PRO EXCLUSIVE
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
            </h2>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i + 1}
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  i + 1 < currentStep
                    ? "bg-green-500 text-white"
                    : i + 1 === currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-semibold">Property Information</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Property Address *</Label>
                  <AddressAutocomplete
                    onAddressSelect={handleAddressSelect}
                    placeholder="Enter your property address..."
                    className="mt-1"
                  />
                </div>

                {data.coordinates && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">Address Confirmed</p>
                        <p className="text-sm text-green-600">
                          Coordinates: {data.coordinates.lat.toFixed(6)}, {data.coordinates.lng.toFixed(6)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Satellite className="h-5 w-5 text-green-600" />
                        {satelliteLoading ? (
                          <div className="flex items-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm">Loading satellite view...</span>
                          </div>
                        ) : (
                          <span className="text-sm text-green-600">Satellite data ready</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType">Property Type *</Label>
                    <Select value={data.propertyType} onValueChange={(value) => updateData("propertyType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single-family">Single Family Home</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="condo">Condominium</SelectItem>
                        <SelectItem value="commercial">Commercial Building</SelectItem>
                        <SelectItem value="industrial">Industrial Facility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="roofType">Roof Type *</Label>
                    <Select value={data.roofType} onValueChange={(value) => updateData("roofType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asphalt-shingle">Asphalt Shingle</SelectItem>
                        <SelectItem value="tile">Tile</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="flat">Flat/Built-up</SelectItem>
                        <SelectItem value="slate">Slate</SelectItem>
                        <SelectItem value="wood">Wood Shake</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roofAge">Roof Age</Label>
                    <Select value={data.roofAge} onValueChange={(value) => updateData("roofAge", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-5">0-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="11-15">11-15 years</SelectItem>
                        <SelectItem value="16-20">16-20 years</SelectItem>
                        <SelectItem value="20+">20+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="roofArea">Available Roof Area (sq ft) *</Label>
                    <Input
                      id="roofArea"
                      type="number"
                      value={data.availableRoofArea || ""}
                      onChange={(e) => updateData("availableRoofArea", Number.parseInt(e.target.value) || 0)}
                      placeholder="e.g., 1200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Zap className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-semibold">Energy Analysis</h3>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyBill">Monthly Electric Bill ($) *</Label>
                    <Input
                      id="monthlyBill"
                      type="number"
                      value={data.monthlyElectricBill || ""}
                      onChange={(e) => updateData("monthlyElectricBill", Number.parseFloat(e.target.value) || 0)}
                      placeholder="e.g., 150"
                    />
                  </div>

                  <div>
                    <Label htmlFor="electricityRate">Electricity Rate ($/kWh) *</Label>
                    <Input
                      id="electricityRate"
                      type="number"
                      step="0.01"
                      value={data.electricityRate || ""}
                      onChange={(e) => updateData("electricityRate", Number.parseFloat(e.target.value) || 0)}
                      placeholder="e.g., 0.12"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="timeOfUse"
                      checked={data.hasTimeOfUseRates}
                      onCheckedChange={(checked) => updateData("hasTimeOfUseRates", checked)}
                    />
                    <Label htmlFor="timeOfUse">I have Time-of-Use electricity rates</Label>
                  </div>

                  {data.hasTimeOfUseRates && (
                    <div className="grid md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="peakRate">Peak Rate ($/kWh)</Label>
                        <Input
                          id="peakRate"
                          type="number"
                          step="0.01"
                          value={data.peakRate || ""}
                          onChange={(e) => updateData("peakRate", Number.parseFloat(e.target.value) || 0)}
                          placeholder="e.g., 0.18"
                        />
                      </div>
                      <div>
                        <Label htmlFor="offPeakRate">Off-Peak Rate ($/kWh)</Label>
                        <Input
                          id="offPeakRate"
                          type="number"
                          step="0.01"
                          value={data.offPeakRate || ""}
                          onChange={(e) => updateData("offPeakRate", Number.parseFloat(e.target.value) || 0)}
                          placeholder="e.g., 0.08"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasEV"
                      checked={data.hasElectricVehicle}
                      onCheckedChange={(checked) => updateData("hasElectricVehicle", checked)}
                    />
                    <Label htmlFor="hasEV">I have an electric vehicle</Label>
                  </div>

                  {data.hasElectricVehicle && (
                    <div className="ml-6">
                      <Label htmlFor="evCharging">Monthly EV Charging (kWh)</Label>
                      <Input
                        id="evCharging"
                        type="number"
                        value={data.evChargingNeeds || ""}
                        onChange={(e) => updateData("evChargingNeeds", Number.parseInt(e.target.value) || 0)}
                        placeholder="e.g., 300"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasPool"
                      checked={data.hasPool}
                      onCheckedChange={(checked) => updateData("hasPool", checked)}
                    />
                    <Label htmlFor="hasPool">I have a swimming pool</Label>
                  </div>

                  {data.hasPool && (
                    <div className="ml-6">
                      <Label htmlFor="poolUsage">Pool Usage</Label>
                      <Select value={data.poolUsage} onValueChange={(value) => updateData("poolUsage", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select pool usage" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seasonal">Seasonal (6 months)</SelectItem>
                          <SelectItem value="year-round">Year-round</SelectItem>
                          <SelectItem value="heated">Heated pool</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Home className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-semibold">Roof Analysis</h3>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roofOrientation">Primary Roof Orientation *</Label>
                    <Select
                      value={data.primaryRoofOrientation}
                      onValueChange={(value) => updateData("primaryRoofOrientation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="south">South</SelectItem>
                        <SelectItem value="southwest">Southwest</SelectItem>
                        <SelectItem value="southeast">Southeast</SelectItem>
                        <SelectItem value="west">West</SelectItem>
                        <SelectItem value="east">East</SelectItem>
                        <SelectItem value="north">North</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="roofTilt">Roof Tilt (degrees)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[data.roofTilt]}
                        onValueChange={(value) => updateData("roofTilt", value[0])}
                        max={60}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600">{data.roofTilt}°</div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="shadingLevel">Shading Level *</Label>
                  <RadioGroup
                    value={data.shadingLevel}
                    onValueChange={(value) => updateData("shadingLevel", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="shading-none" />
                      <Label htmlFor="shading-none">No shading - Full sun all day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="minimal" id="shading-minimal" />
                      <Label htmlFor="shading-minimal">Minimal shading - Mostly sunny</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderate" id="shading-moderate" />
                      <Label htmlFor="shading-moderate">Moderate shading - Some trees/buildings</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="heavy" id="shading-heavy" />
                      <Label htmlFor="shading-heavy">Heavy shading - Significant obstructions</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multipleRoofs"
                      checked={data.multipleRoofSections}
                      onCheckedChange={(checked) => updateData("multipleRoofSections", checked)}
                    />
                    <Label htmlFor="multipleRoofs">My roof has multiple sections with different orientations</Label>
                  </div>

                  {data.multipleRoofSections && (
                    <div className="ml-6 p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">
                        Multiple roof section analysis will be included in the detailed report.
                      </p>
                      <Badge variant="outline">Advanced Feature</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <Sun className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-semibold">System Preferences</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="systemGoal">System Goal *</Label>
                  <RadioGroup
                    value={data.systemGoal}
                    onValueChange={(value) => updateData("systemGoal", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offset-100" id="goal-100" />
                      <Label htmlFor="goal-100">Offset 100% of my electricity usage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offset-75" id="goal-75" />
                      <Label htmlFor="goal-75">Offset 75% of my electricity usage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offset-50" id="goal-50" />
                      <Label htmlFor="goal-50">Offset 50% of my electricity usage</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="maximize" id="goal-max" />
                      <Label htmlFor="goal-max">Maximize system size for available roof space</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="batteryStorage"
                      checked={data.batteryStorage}
                      onCheckedChange={(checked) => updateData("batteryStorage", checked)}
                    />
                    <Label htmlFor="batteryStorage" className="flex items-center">
                      <Battery className="h-4 w-4 mr-1" />
                      Include battery storage system
                    </Label>
                  </div>

                  {data.batteryStorage && (
                    <div className="ml-6 space-y-3">
                      <div>
                        <Label htmlFor="batteryCapacity">Battery Capacity (kWh)</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[data.batteryCapacity]}
                            onValueChange={(value) => updateData("batteryCapacity", value[0])}
                            max={40}
                            min={5}
                            step={5}
                            className="w-full"
                          />
                          <div className="text-center text-sm text-gray-600">{data.batteryCapacity} kWh</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="microInverters"
                      checked={data.microInverters}
                      onCheckedChange={(checked) => updateData("microInverters", checked)}
                    />
                    <Label htmlFor="microInverters">Use micro-inverters (recommended for shaded roofs)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smartMonitoring"
                      checked={data.smartMonitoring}
                      onCheckedChange={(checked) => updateData("smartMonitoring", checked)}
                    />
                    <Label htmlFor="smartMonitoring">Include smart monitoring system</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="panelPreference">Panel Preference</Label>
                  <Select value={data.panelPreference} onValueChange={(value) => updateData("panelPreference", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select panel preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium efficiency (highest cost)</SelectItem>
                      <SelectItem value="standard">Standard efficiency (balanced)</SelectItem>
                      <SelectItem value="budget">Budget-friendly (lowest cost)</SelectItem>
                      <SelectItem value="aesthetic">All-black aesthetic panels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-semibold">Financial Preferences</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="purchaseMethod">Purchase Method *</Label>
                  <RadioGroup
                    value={data.purchaseMethod}
                    onValueChange={(value) => updateData("purchaseMethod", value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="purchase-cash" />
                      <Label htmlFor="purchase-cash">Cash purchase</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="loan" id="purchase-loan" />
                      <Label htmlFor="purchase-loan">Solar loan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lease" id="purchase-lease" />
                      <Label htmlFor="purchase-lease">Solar lease/PPA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="compare" id="purchase-compare" />
                      <Label htmlFor="purchase-compare">Compare all options</Label>
                    </div>
                  </RadioGroup>
                </div>

                {(data.purchaseMethod === "loan" || data.purchaseMethod === "compare") && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="downPayment">Down Payment (%)</Label>
                        <div className="space-y-2">
                          <Slider
                            value={[data.downPayment]}
                            onValueChange={(value) => updateData("downPayment", value[0])}
                            max={100}
                            min={0}
                            step={5}
                            className="w-full"
                          />
                          <div className="text-center text-sm text-gray-600">{data.downPayment}%</div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="financingTerm">Financing Term (years)</Label>
                        <Select
                          value={data.financingTerm.toString()}
                          onValueChange={(value) => updateData("financingTerm", Number.parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10 years</SelectItem>
                            <SelectItem value="15">15 years</SelectItem>
                            <SelectItem value="20">20 years</SelectItem>
                            <SelectItem value="25">25 years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        type="number"
                        step="0.1"
                        value={data.interestRate || ""}
                        onChange={(e) => updateData("interestRate", Number.parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 4.5"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeIncentives"
                    checked={data.includeIncentives}
                    onCheckedChange={(checked) => updateData("includeIncentives", checked)}
                  />
                  <Label htmlFor="includeIncentives">Include federal and state incentives in calculations</Label>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Available Incentives</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Federal Solar Tax Credit (30%)</li>
                    <li>• State and local rebates</li>
                    <li>• Net metering programs</li>
                    <li>• PACE financing options</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center mb-4">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="text-lg font-semibold">Project Information</h3>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={data.customerName}
                      onChange={(e) => updateData("customerName", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">Email Address *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={data.customerEmail}
                      onChange={(e) => updateData("customerEmail", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerPhone">Phone Number</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={data.customerPhone}
                      onChange={(e) => updateData("customerPhone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <Label htmlFor="projectType">Project Type *</Label>
                    <Select value={data.projectType} onValueChange={(value) => updateData("projectType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new-installation">New Installation</SelectItem>
                        <SelectItem value="system-expansion">System Expansion</SelectItem>
                        <SelectItem value="replacement">System Replacement</SelectItem>
                        <SelectItem value="consultation">Consultation Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="installationTimeframe">Preferred Installation Timeframe</Label>
                  <Select
                    value={data.installationTimeframe}
                    onValueChange={(value) => updateData("installationTimeframe", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">As soon as possible</SelectItem>
                      <SelectItem value="1-3-months">1-3 months</SelectItem>
                      <SelectItem value="3-6-months">3-6 months</SelectItem>
                      <SelectItem value="6-12-months">6-12 months</SelectItem>
                      <SelectItem value="planning">Just planning/researching</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="additionalNotes">Additional Notes or Requirements</Label>
                  <Textarea
                    id="additionalNotes"
                    value={data.additionalNotes}
                    onChange={(e) => updateData("additionalNotes", e.target.value)}
                    placeholder="Any specific requirements, concerns, or questions..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center space-x-2 bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        {currentStep < 6 ? (
          <Button onClick={nextStep} disabled={!isStepValid(currentStep)} className="flex items-center space-x-2">
            <span>Next</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={calculateSolarSystem}
            disabled={!isStepValid(currentStep) || isCalculating}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600"
          >
            {isCalculating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4" />
                <span>Generate Analysis</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
