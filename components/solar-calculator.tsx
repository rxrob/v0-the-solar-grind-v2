"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Calculator, MapPin, Home, Zap, DollarSign } from "lucide-react"
import { calculateSolar } from "@/app/actions/solar-calculation"
import { SolarResults } from "./solar-results"

interface CalculatorData {
  // Location & Property
  address: string
  coordinates: string
  propertySquareFeet: string
  residents: string

  // Energy Usage
  monthlyKwh: string
  electricityRate: string
  utilityCompany: string
  hasPool: boolean
  hasEv: boolean
  planningAdditions: boolean

  // Roof Information
  roofType: string
  roofAge: string
  roofCondition: string
  shadingLevel: string

  // Contact Information
  customerName: string
  customerEmail: string
  customerPhone: string
}

const initialData: CalculatorData = {
  address: "",
  coordinates: "",
  propertySquareFeet: "",
  residents: "",
  monthlyKwh: "",
  electricityRate: "",
  utilityCompany: "",
  hasPool: false,
  hasEv: false,
  planningAdditions: false,
  roofType: "",
  roofAge: "",
  roofCondition: "",
  shadingLevel: "",
  customerName: "",
  customerEmail: "",
  customerPhone: "",
}

export function SolarCalculator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<CalculatorData>(initialData)
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = 5
  const progress = (currentStep / totalSteps) * 100

  const updateData = (field: keyof CalculatorData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!data.address.trim()) newErrors.address = "Address is required"
        if (!data.propertySquareFeet.trim()) newErrors.propertySquareFeet = "Property size is required"
        if (!data.residents.trim()) newErrors.residents = "Number of residents is required"
        break
      case 2:
        if (!data.monthlyKwh.trim()) newErrors.monthlyKwh = "Monthly kWh usage is required"
        if (!data.electricityRate.trim()) newErrors.electricityRate = "Electricity rate is required"
        if (!data.utilityCompany.trim()) newErrors.utilityCompany = "Utility company is required"
        break
      case 3:
        if (!data.roofType) newErrors.roofType = "Roof type is required"
        if (!data.roofAge) newErrors.roofAge = "Roof age is required"
        if (!data.roofCondition) newErrors.roofCondition = "Roof condition is required"
        if (!data.shadingLevel) newErrors.shadingLevel = "Shading level is required"
        break
      case 4:
        if (!data.customerName.trim()) newErrors.customerName = "Name is required"
        if (!data.customerEmail.trim()) newErrors.customerEmail = "Email is required"
        if (!data.customerPhone.trim()) newErrors.customerPhone = "Phone is required"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleCalculate = async () => {
    if (!validateStep(4)) return

    setIsCalculating(true)
    try {
      const result = await calculateSolar(data)
      setResults(result)
      setCurrentStep(5)
    } catch (error) {
      console.error("Calculation error:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Property Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State, ZIP"
                  value={data.address}
                  onChange={(e) => updateData("address", e.target.value)}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertySquareFeet">Property Size (sq ft) *</Label>
                  <Input
                    id="propertySquareFeet"
                    type="number"
                    placeholder="2000"
                    value={data.propertySquareFeet}
                    onChange={(e) => updateData("propertySquareFeet", e.target.value)}
                    className={errors.propertySquareFeet ? "border-red-500" : ""}
                  />
                  {errors.propertySquareFeet && (
                    <p className="text-red-500 text-sm mt-1">{errors.propertySquareFeet}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="residents">Number of Residents *</Label>
                  <Input
                    id="residents"
                    type="number"
                    placeholder="4"
                    value={data.residents}
                    onChange={(e) => updateData("residents", e.target.value)}
                    className={errors.residents ? "border-red-500" : ""}
                  />
                  {errors.residents && <p className="text-red-500 text-sm mt-1">{errors.residents}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Energy Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyKwh">Monthly kWh Usage *</Label>
                  <Input
                    id="monthlyKwh"
                    type="number"
                    placeholder="1200"
                    value={data.monthlyKwh}
                    onChange={(e) => updateData("monthlyKwh", e.target.value)}
                    className={errors.monthlyKwh ? "border-red-500" : ""}
                  />
                  {errors.monthlyKwh && <p className="text-red-500 text-sm mt-1">{errors.monthlyKwh}</p>}
                </div>
                <div>
                  <Label htmlFor="electricityRate">Electricity Rate ($/kWh) *</Label>
                  <Input
                    id="electricityRate"
                    type="number"
                    step="0.01"
                    placeholder="0.12"
                    value={data.electricityRate}
                    onChange={(e) => updateData("electricityRate", e.target.value)}
                    className={errors.electricityRate ? "border-red-500" : ""}
                  />
                  {errors.electricityRate && <p className="text-red-500 text-sm mt-1">{errors.electricityRate}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="utilityCompany">Utility Company *</Label>
                <Input
                  id="utilityCompany"
                  placeholder="Pacific Gas & Electric"
                  value={data.utilityCompany}
                  onChange={(e) => updateData("utilityCompany", e.target.value)}
                  className={errors.utilityCompany ? "border-red-500" : ""}
                />
                {errors.utilityCompany && <p className="text-red-500 text-sm mt-1">{errors.utilityCompany}</p>}
              </div>
              <div className="space-y-3">
                <Label>Additional Energy Usage</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPool"
                    checked={data.hasPool}
                    onCheckedChange={(checked) => updateData("hasPool", checked)}
                  />
                  <Label htmlFor="hasPool">Swimming Pool</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasEv"
                    checked={data.hasEv}
                    onCheckedChange={(checked) => updateData("hasEv", checked)}
                  />
                  <Label htmlFor="hasEv">Electric Vehicle</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="planningAdditions"
                    checked={data.planningAdditions}
                    onCheckedChange={(checked) => updateData("planningAdditions", checked)}
                  />
                  <Label htmlFor="planningAdditions">Planning Home Additions</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-green-500" />
                Roof Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roofType">Roof Type *</Label>
                  <Select value={data.roofType} onValueChange={(value) => updateData("roofType", value)}>
                    <SelectTrigger className={errors.roofType ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select roof type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asphalt_shingle">Asphalt Shingle</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                      <SelectItem value="tile">Tile</SelectItem>
                      <SelectItem value="slate">Slate</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.roofType && <p className="text-red-500 text-sm mt-1">{errors.roofType}</p>}
                </div>
                <div>
                  <Label htmlFor="roofAge">Roof Age *</Label>
                  <Select value={data.roofAge} onValueChange={(value) => updateData("roofAge", value)}>
                    <SelectTrigger className={errors.roofAge ? "border-red-500" : ""}>
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
                  {errors.roofAge && <p className="text-red-500 text-sm mt-1">{errors.roofAge}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roofCondition">Roof Condition *</Label>
                  <Select value={data.roofCondition} onValueChange={(value) => updateData("roofCondition", value)}>
                    <SelectTrigger className={errors.roofCondition ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.roofCondition && <p className="text-red-500 text-sm mt-1">{errors.roofCondition}</p>}
                </div>
                <div>
                  <Label htmlFor="shadingLevel">Shading Level *</Label>
                  <Select value={data.shadingLevel} onValueChange={(value) => updateData("shadingLevel", value)}>
                    <SelectTrigger className={errors.shadingLevel ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select shading" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Shading</SelectItem>
                      <SelectItem value="minimal">Minimal Shading</SelectItem>
                      <SelectItem value="moderate">Moderate Shading</SelectItem>
                      <SelectItem value="heavy">Heavy Shading</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.shadingLevel && <p className="text-red-500 text-sm mt-1">{errors.shadingLevel}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-500" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  placeholder="John Doe"
                  value={data.customerName}
                  onChange={(e) => updateData("customerName", e.target.value)}
                  className={errors.customerName ? "border-red-500" : ""}
                />
                {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerEmail">Email Address *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    placeholder="john@example.com"
                    value={data.customerEmail}
                    onChange={(e) => updateData("customerEmail", e.target.value)}
                    className={errors.customerEmail ? "border-red-500" : ""}
                  />
                  {errors.customerEmail && <p className="text-red-500 text-sm mt-1">{errors.customerEmail}</p>}
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number *</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={data.customerPhone}
                    onChange={(e) => updateData("customerPhone", e.target.value)}
                    className={errors.customerPhone ? "border-red-500" : ""}
                  />
                  {errors.customerPhone && <p className="text-red-500 text-sm mt-1">{errors.customerPhone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return results ? <SolarResults results={results} /> : null

      default:
        return null
    }
  }

  if (currentStep === 5 && results) {
    return renderStep()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-500">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {renderStep()}

      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 bg-transparent"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button onClick={nextStep} className="flex items-center gap-2">
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCalculate}
            disabled={isCalculating}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-blue-500 hover:from-amber-600 hover:to-blue-600"
          >
            <Calculator className="h-4 w-4" />
            {isCalculating ? "Calculating..." : "Calculate Solar"}
          </Button>
        )}
      </div>
    </div>
  )
}
