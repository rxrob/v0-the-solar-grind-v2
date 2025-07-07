"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, Home, Zap, DollarSign, Sun, Leaf, TrendingUp, MapPin, CheckCircle, Info } from "lucide-react"
import { calculateSolarSavings } from "@/app/actions/solar-calculation"

// State solar data with peak sun hours and average electricity rates
const US_STATES = {
  AL: { name: "Alabama", sunHours: 4.23, rate: 0.1299 },
  AK: { name: "Alaska", sunHours: 2.5, rate: 0.2337 },
  AZ: { name: "Arizona", sunHours: 6.57, rate: 0.1285 },
  AR: { name: "Arkansas", sunHours: 4.69, rate: 0.1067 },
  CA: { name: "California", sunHours: 5.38, rate: 0.2068 },
  CO: { name: "Colorado", sunHours: 5.0, rate: 0.1368 },
  CT: { name: "Connecticut", sunHours: 3.86, rate: 0.211 },
  DE: { name: "Delaware", sunHours: 4.17, rate: 0.1372 },
  FL: { name: "Florida", sunHours: 5.27, rate: 0.1198 },
  GA: { name: "Georgia", sunHours: 4.74, rate: 0.1188 },
  HI: { name: "Hawaii", sunHours: 5.59, rate: 0.3315 },
  ID: { name: "Idaho", sunHours: 4.2, rate: 0.1015 },
  IL: { name: "Illinois", sunHours: 4.0, rate: 0.1287 },
  IN: { name: "Indiana", sunHours: 4.21, rate: 0.1398 },
  IA: { name: "Iowa", sunHours: 4.26, rate: 0.1231 },
  KS: { name: "Kansas", sunHours: 4.96, rate: 0.1368 },
  KY: { name: "Kentucky", sunHours: 4.2, rate: 0.1087 },
  LA: { name: "Louisiana", sunHours: 4.92, rate: 0.0987 },
  ME: { name: "Maine", sunHours: 3.56, rate: 0.1644 },
  MD: { name: "Maryland", sunHours: 4.2, rate: 0.1372 },
  MA: { name: "Massachusetts", sunHours: 3.84, rate: 0.2285 },
  MI: { name: "Michigan", sunHours: 3.78, rate: 0.1598 },
  MN: { name: "Minnesota", sunHours: 4.53, rate: 0.1368 },
  MS: { name: "Mississippi", sunHours: 4.54, rate: 0.1198 },
  MO: { name: "Missouri", sunHours: 4.73, rate: 0.1087 },
  MT: { name: "Montana", sunHours: 4.0, rate: 0.1087 },
  NE: { name: "Nebraska", sunHours: 4.9, rate: 0.1087 },
  NV: { name: "Nevada", sunHours: 6.41, rate: 0.1198 },
  NH: { name: "New Hampshire", sunHours: 3.64, rate: 0.1987 },
  NJ: { name: "New Jersey", sunHours: 4.0, rate: 0.1598 },
  NM: { name: "New Mexico", sunHours: 6.77, rate: 0.1287 },
  NY: { name: "New York", sunHours: 3.79, rate: 0.1887 },
  NC: { name: "North Carolina", sunHours: 4.71, rate: 0.1198 },
  ND: { name: "North Dakota", sunHours: 4.53, rate: 0.1087 },
  OH: { name: "Ohio", sunHours: 3.93, rate: 0.1287 },
  OK: { name: "Oklahoma", sunHours: 5.59, rate: 0.1087 },
  OR: { name: "Oregon", sunHours: 3.72, rate: 0.1087 },
  PA: { name: "Pennsylvania", sunHours: 3.91, rate: 0.1398 },
  RI: { name: "Rhode Island", sunHours: 3.85, rate: 0.2285 },
  SC: { name: "South Carolina", sunHours: 4.64, rate: 0.1287 },
  SD: { name: "South Dakota", sunHours: 4.59, rate: 0.1287 },
  TN: { name: "Tennessee", sunHours: 4.45, rate: 0.1087 },
  TX: { name: "Texas", sunHours: 5.26, rate: 0.1198 },
  UT: { name: "Utah", sunHours: 5.26, rate: 0.1087 },
  VT: { name: "Vermont", sunHours: 3.61, rate: 0.1887 },
  VA: { name: "Virginia", sunHours: 4.5, rate: 0.1198 },
  WA: { name: "Washington", sunHours: 3.06, rate: 0.1087 },
  WV: { name: "West Virginia", sunHours: 3.89, rate: 0.1198 },
  WI: { name: "Wisconsin", sunHours: 4.29, rate: 0.1487 },
  WY: { name: "Wyoming", sunHours: 5.0, rate: 0.1087 },
}

interface FormData {
  // Step 1: Location & Property
  state: string
  houseSquareFeet: string

  // Step 2: Energy Usage
  monthlyElectricBill: string
  monthlyKwhUsage: string
  electricityRate: string
  hasPool: boolean
  hasEV: boolean
  hasAddition: boolean

  // Step 3: Roof Information
  roofType: string
  roofAge: string
  roofCondition: string
  shadingLevel: string

  // Step 4: System Preferences
  systemSize: string
  panelType: string
  financing: string

  // Step 5: Goals & Timeline
  primaryGoal: string
  timeline: string
  additionalNotes: string
}

interface CalculationResult {
  systemSize: number
  annualProduction: number
  monthlyProduction: number
  firstYearSavings: number
  twentyYearSavings: number
  paybackPeriod: number
  co2Offset: number
  treesEquivalent: number
  roofUtilization: number
  availableRoofArea: number
  estimatedCost: number
  monthlyPayment: number
  netMonthlySavings: number
  roi: number
  stateName: string
  peakSunHours: number
}

export default function SolarCalculator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    state: "",
    houseSquareFeet: "",
    monthlyElectricBill: "",
    monthlyKwhUsage: "",
    electricityRate: "",
    hasPool: false,
    hasEV: false,
    hasAddition: false,
    roofType: "",
    roofAge: "",
    roofCondition: "",
    shadingLevel: "",
    systemSize: "",
    panelType: "",
    financing: "",
    primaryGoal: "",
    timeline: "",
    additionalNotes: "",
  })
  const [results, setResults] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-fill electricity rate when state changes
  useEffect(() => {
    if (formData.state && US_STATES[formData.state as keyof typeof US_STATES]) {
      const stateData = US_STATES[formData.state as keyof typeof US_STATES]
      setFormData((prev) => ({
        ...prev,
        electricityRate: (stateData.rate * 100).toFixed(2), // Convert to cents
      }))
    }
  }, [formData.state])

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.state) newErrors.state = "Please select your state"
        if (!formData.houseSquareFeet) newErrors.houseSquareFeet = "House square footage is required"
        else if (Number.parseInt(formData.houseSquareFeet) < 500)
          newErrors.houseSquareFeet = "House size seems too small"
        else if (Number.parseInt(formData.houseSquareFeet) > 10000)
          newErrors.houseSquareFeet = "House size seems too large"
        break
      case 2:
        if (!formData.monthlyElectricBill) newErrors.monthlyElectricBill = "Monthly electric bill is required"
        if (!formData.monthlyKwhUsage) newErrors.monthlyKwhUsage = "Monthly kWh usage is required"
        if (!formData.electricityRate) newErrors.electricityRate = "Electricity rate is required"
        break
      case 3:
        if (!formData.roofType) newErrors.roofType = "Please select your roof type"
        if (!formData.roofAge) newErrors.roofAge = "Please select your roof age"
        if (!formData.roofCondition) newErrors.roofCondition = "Please select your roof condition"
        if (!formData.shadingLevel) newErrors.shadingLevel = "Please select your shading level"
        break
      case 4:
        if (!formData.panelType) newErrors.panelType = "Please select a panel type"
        if (!formData.financing) newErrors.financing = "Please select a financing option"
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleCalculate = async () => {
    if (!validateStep(4)) return

    setIsCalculating(true)
    try {
      const result = await calculateSolarSavings(formData)
      setResults(result)
      setCurrentStep(6) // Results step
    } catch (error) {
      console.error("Calculation error:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const resetCalculator = () => {
    setCurrentStep(1)
    setFormData({
      state: "",
      houseSquareFeet: "",
      monthlyElectricBill: "",
      monthlyKwhUsage: "",
      electricityRate: "",
      hasPool: false,
      hasEV: false,
      hasAddition: false,
      roofType: "",
      roofAge: "",
      roofCondition: "",
      shadingLevel: "",
      systemSize: "",
      panelType: "",
      financing: "",
      primaryGoal: "",
      timeline: "",
      additionalNotes: "",
    })
    setResults(null)
    setErrors({})
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Property Information
              </CardTitle>
              <CardDescription>
                Tell us about your location and house size for accurate solar calculations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => updateFormData("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(US_STATES).map(([code, data]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center justify-between w-full">
                          <span>{data.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                            <Sun className="h-3 w-3" />
                            {data.sunHours}h<span>•</span>${(data.rate * 100).toFixed(1)}¢/kWh
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                {formData.state && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    Peak sun hours: {US_STATES[formData.state as keyof typeof US_STATES]?.sunHours}/day
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="houseSquareFeet">House Size (sq ft) *</Label>
                <Input
                  id="houseSquareFeet"
                  type="number"
                  placeholder="e.g., 2000"
                  value={formData.houseSquareFeet}
                  onChange={(e) => updateFormData("houseSquareFeet", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Total square footage of your house</p>
                {errors.houseSquareFeet && <p className="text-sm text-red-500">{errors.houseSquareFeet}</p>}
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Energy Usage & Costs
              </CardTitle>
              <CardDescription>Help us understand your current electricity usage and costs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyElectricBill">Monthly Electric Bill ($) *</Label>
                  <Input
                    id="monthlyElectricBill"
                    type="number"
                    placeholder="e.g., 150"
                    value={formData.monthlyElectricBill}
                    onChange={(e) => updateFormData("monthlyElectricBill", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Average monthly electricity bill</p>
                  {errors.monthlyElectricBill && <p className="text-sm text-red-500">{errors.monthlyElectricBill}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyKwhUsage">Monthly kWh Usage *</Label>
                  <Input
                    id="monthlyKwhUsage"
                    type="number"
                    placeholder="e.g., 1000"
                    value={formData.monthlyKwhUsage}
                    onChange={(e) => updateFormData("monthlyKwhUsage", e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">Check your electric bill for kWh usage</p>
                  {errors.monthlyKwhUsage && <p className="text-sm text-red-500">{errors.monthlyKwhUsage}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="electricityRate">Electricity Rate (¢/kWh) *</Label>
                <Input
                  id="electricityRate"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 12.5"
                  value={formData.electricityRate}
                  onChange={(e) => updateFormData("electricityRate", e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.state
                    ? `Auto-filled based on ${US_STATES[formData.state as keyof typeof US_STATES]?.name} average`
                    : "Your rate per kWh in cents"}
                </p>
                {errors.electricityRate && <p className="text-sm text-red-500">{errors.electricityRate}</p>}
              </div>

              <div className="space-y-4">
                <Label>Additional Energy Usage (optional)</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="hasPool"
                        checked={formData.hasPool}
                        onChange={(e) => updateFormData("hasPool", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="hasPool">Swimming Pool</Label>
                    </div>
                    <Badge variant="secondary">+20% usage</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="hasEV"
                        checked={formData.hasEV}
                        onChange={(e) => updateFormData("hasEV", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="hasEV">Electric Vehicle</Label>
                    </div>
                    <Badge variant="secondary">+30% usage</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="hasAddition"
                        checked={formData.hasAddition}
                        onChange={(e) => updateFormData("hasAddition", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="hasAddition">Home Addition Planned</Label>
                    </div>
                    <Badge variant="secondary">+15% usage</Badge>
                  </div>
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
                <Home className="h-5 w-5" />
                Roof Information
              </CardTitle>
              <CardDescription>Details about your roof help us determine solar panel suitability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roofType">Roof Type *</Label>
                  <Select value={formData.roofType} onValueChange={(value) => updateFormData("roofType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select roof type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asphalt-shingle">Asphalt Shingle</SelectItem>
                      <SelectItem value="metal">Metal</SelectItem>
                      <SelectItem value="tile">Tile</SelectItem>
                      <SelectItem value="slate">Slate</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.roofType && <p className="text-sm text-red-500">{errors.roofType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="roofAge">Roof Age *</Label>
                  <Select value={formData.roofAge} onValueChange={(value) => updateFormData("roofAge", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select roof age" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-5">0-5 years (New)</SelectItem>
                      <SelectItem value="6-10">6-10 years (Good)</SelectItem>
                      <SelectItem value="11-15">11-15 years (Fair)</SelectItem>
                      <SelectItem value="16-20">16-20 years (Aging)</SelectItem>
                      <SelectItem value="20+">20+ years (Old)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.roofAge && <p className="text-sm text-red-500">{errors.roofAge}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roofCondition">Roof Condition *</Label>
                  <Select
                    value={formData.roofCondition}
                    onValueChange={(value) => updateFormData("roofCondition", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent - No issues</SelectItem>
                      <SelectItem value="good">Good - Minor wear</SelectItem>
                      <SelectItem value="fair">Fair - Some repairs needed</SelectItem>
                      <SelectItem value="poor">Poor - Major repairs needed</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.roofCondition && <p className="text-sm text-red-500">{errors.roofCondition}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shadingLevel">Shading Level *</Label>
                  <Select
                    value={formData.shadingLevel}
                    onValueChange={(value) => updateFormData("shadingLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select shading" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center justify-between w-full">
                          <span>No Shading</span>
                          <Badge variant="secondary" className="ml-2">
                            100% efficiency
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="minimal">
                        <div className="flex items-center justify-between w-full">
                          <span>Minimal Shading</span>
                          <Badge variant="secondary" className="ml-2">
                            90-95% efficiency
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="moderate">
                        <div className="flex items-center justify-between w-full">
                          <span>Moderate Shading</span>
                          <Badge variant="secondary" className="ml-2">
                            80-90% efficiency
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="heavy">
                        <div className="flex items-center justify-between w-full">
                          <span>Heavy Shading</span>
                          <Badge variant="secondary" className="ml-2">
                            60-80% efficiency
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.shadingLevel && <p className="text-sm text-red-500">{errors.shadingLevel}</p>}
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
                <Calculator className="h-5 w-5" />
                System Preferences
              </CardTitle>
              <CardDescription>Choose your preferred solar panel type and financing options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="panelType">Panel Type *</Label>
                <Select value={formData.panelType} onValueChange={(value) => updateFormData("panelType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select panel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monocrystalline">
                      <div className="space-y-1">
                        <div className="font-medium">Monocrystalline (Premium)</div>
                        <div className="text-sm text-muted-foreground">Highest efficiency, best for limited space</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="polycrystalline">
                      <div className="space-y-1">
                        <div className="font-medium">Polycrystalline (Standard)</div>
                        <div className="text-sm text-muted-foreground">Good efficiency, cost-effective</div>
                      </div>
                    </SelectItem>
                    <SelectItem value="thin-film">
                      <div className="space-y-1">
                        <div className="font-medium">Thin-Film (Budget)</div>
                        <div className="text-sm text-muted-foreground">Lower efficiency, lowest cost</div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.panelType && <p className="text-sm text-red-500">{errors.panelType}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="financing">Financing Option *</Label>
                <Select value={formData.financing} onValueChange={(value) => updateFormData("financing", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select financing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash Purchase</SelectItem>
                    <SelectItem value="loan">Solar Loan</SelectItem>
                    <SelectItem value="lease">Solar Lease</SelectItem>
                    <SelectItem value="ppa">Power Purchase Agreement (PPA)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.financing && <p className="text-sm text-red-500">{errors.financing}</p>}
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Goals & Timeline
              </CardTitle>
              <CardDescription>Tell us about your solar goals and timeline (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primaryGoal">Primary Goal</Label>
                <Select value={formData.primaryGoal} onValueChange={(value) => updateFormData("primaryGoal", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="What's your main goal?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="save-money">Save Money on Electric Bills</SelectItem>
                    <SelectItem value="environmental">Environmental Impact</SelectItem>
                    <SelectItem value="energy-independence">Energy Independence</SelectItem>
                    <SelectItem value="increase-home-value">Increase Home Value</SelectItem>
                    <SelectItem value="backup-power">Backup Power</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Installation Timeline</Label>
                <Select value={formData.timeline} onValueChange={(value) => updateFormData("timeline", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you want to install?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">As soon as possible</SelectItem>
                    <SelectItem value="3-months">Within 3 months</SelectItem>
                    <SelectItem value="6-months">Within 6 months</SelectItem>
                    <SelectItem value="1-year">Within 1 year</SelectItem>
                    <SelectItem value="exploring">Just exploring options</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any additional information about your property, energy needs, or concerns..."
                  value={formData.additionalNotes}
                  onChange={(e) => updateFormData("additionalNotes", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )

      case 6:
        return results ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Your Solar Analysis Results
                </CardTitle>
                <CardDescription>
                  Based on your {results.stateName} location with {results.peakSunHours} peak sun hours per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Recommended System Size</span>
                    </div>
                    <div className="text-2xl font-bold">{results.systemSize.toFixed(1)} kW</div>
                    <p className="text-sm text-muted-foreground">
                      {Math.round(results.systemSize / 0.4)} panels (400W each)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Annual Production</span>
                    </div>
                    <div className="text-2xl font-bold">{results.annualProduction.toLocaleString()} kWh</div>
                    <p className="text-sm text-muted-foreground">
                      ~{results.monthlyProduction.toLocaleString()} kWh/month
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">First Year Savings</span>
                    </div>
                    <div className="text-2xl font-bold">${results.firstYearSavings.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">
                      ${Math.round(results.firstYearSavings / 12)}/month average
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">20-Year Savings</span>
                    </div>
                    <div className="text-2xl font-bold">${results.twentyYearSavings.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Total lifetime savings</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Payback Period</span>
                    </div>
                    <div className="text-2xl font-bold">{results.paybackPeriod.toFixed(1)} years</div>
                    <p className="text-sm text-muted-foreground">Break-even point</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">CO₂ Offset</span>
                    </div>
                    <div className="text-2xl font-bold">{results.co2Offset.toLocaleString()} lbs</div>
                    <p className="text-sm text-muted-foreground">= {results.treesEquivalent} trees planted</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Available Roof Area:</span>
                    <span className="font-medium">{results.availableRoofArea.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Roof Utilization:</span>
                    <span className="font-medium">{results.roofUtilization.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated System Cost:</span>
                    <span className="font-medium">${results.estimatedCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Return on Investment:</span>
                    <span className="font-medium">{results.roi.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Current Electric Bill:</span>
                    <span className="font-medium">${formData.monthlyElectricBill}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Solar Payment:</span>
                    <span className="font-medium">${results.monthlyPayment.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Net Monthly Savings:</span>
                    <span className="text-green-600">${results.netMonthlySavings.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                These calculations are estimates based on your inputs and average conditions. Actual results may vary
                based on specific installation conditions, local regulations, and utility policies. We recommend getting
                quotes from certified solar installers for precise pricing and system design.
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <Button onClick={resetCalculator} variant="outline">
                Start New Calculation
              </Button>
              <Button>Get Professional Quote</Button>
            </div>
          </div>
        ) : null

      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Solar Calculator</h1>
        <p className="text-muted-foreground">Get a personalized solar analysis for your home in just a few steps</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Step {currentStep} of 5</span>
          <span className="text-sm text-muted-foreground">{Math.round((currentStep / 5) * 100)}% Complete</span>
        </div>
        <Progress value={(currentStep / 5) * 100} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Navigation Buttons */}
      {currentStep < 6 && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button onClick={nextStep}>Next Step</Button>
          ) : (
            <Button onClick={handleCalculate} disabled={isCalculating}>
              {isCalculating ? "Calculating..." : "Calculate Solar Savings"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
