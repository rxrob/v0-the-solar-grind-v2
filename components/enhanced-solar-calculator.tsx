"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast-sonner"
import {
  Calculator,
  Home,
  Sun,
  Zap,
  DollarSign,
  BarChart3,
  MapPin,
  Battery,
  Leaf,
  TrendingUp,
  FileText,
  Download,
  Share,
  AlertCircle,
  CheckCircle,
  Info,
} from "lucide-react"

interface SolarCalculatorData {
  // Basic Info
  address: string
  zipCode: string
  monthlyBill: number[]
  electricityRate: number[]

  // Property Details
  roofType: string
  roofAge: string
  roofArea: number[]
  roofOrientation: string
  shadingLevel: string
  structuralCondition: string

  // System Configuration
  panelType: string
  panelWattage: number[]
  inverterType: string
  batteryBackup: boolean
  batteryCapacity: number[]
  smartMonitoring: boolean
  futureExpansion: boolean

  // Financial
  financingOption: string
  downPayment: number[]
  federalTaxCredit: boolean
  stateIncentives: boolean
  utilityRebates: boolean
  netMetering: boolean
}

const initialData: SolarCalculatorData = {
  address: "",
  zipCode: "",
  monthlyBill: [180],
  electricityRate: [0.12],
  roofType: "",
  roofAge: "",
  roofArea: [1500],
  roofOrientation: "",
  shadingLevel: "",
  structuralCondition: "",
  panelType: "",
  panelWattage: [350],
  inverterType: "",
  batteryBackup: false,
  batteryCapacity: [10],
  smartMonitoring: true,
  futureExpansion: false,
  financingOption: "",
  downPayment: [20],
  federalTaxCredit: true,
  stateIncentives: true,
  utilityRebates: true,
  netMetering: true,
}

export default function EnhancedSolarCalculator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<SolarCalculatorData>(initialData)
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<any>(null)

  const steps = [
    { id: "basic", label: "Basic Info", icon: Home, description: "Property and usage details" },
    { id: "property", label: "Property", icon: Sun, description: "Roof and site conditions" },
    { id: "system", label: "System", icon: Zap, description: "Equipment configuration" },
    { id: "financial", label: "Financial", icon: DollarSign, description: "Financing and incentives" },
    { id: "results", label: "Results", icon: BarChart3, description: "Analysis and recommendations" },
  ]

  const calculateResults = async () => {
    setIsCalculating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Calculate system size based on monthly bill and electricity rate
    const monthlyUsage = data.monthlyBill[0] / data.electricityRate[0]
    const annualUsage = monthlyUsage * 12
    const systemSize = Math.round((annualUsage / 1200) * 10) / 10 // Assuming 1200 kWh per kW per year

    // Calculate costs and savings
    const systemCostPerWatt = 3.0
    const totalSystemCost = systemSize * 1000 * systemCostPerWatt
    const federalTaxCreditAmount = data.federalTaxCredit ? totalSystemCost * 0.3 : 0
    const stateIncentiveAmount = data.stateIncentives ? 2000 : 0
    const utilityRebateAmount = data.utilityRebates ? 1500 : 0
    const totalIncentives = federalTaxCreditAmount + stateIncentiveAmount + utilityRebateAmount
    const netSystemCost = totalSystemCost - totalIncentives

    const annualProduction = systemSize * 1200 // kWh per year
    const annualSavings = annualProduction * data.electricityRate[0]
    const paybackPeriod = netSystemCost / annualSavings
    const twentyYearSavings = annualSavings * 20 - netSystemCost
    const co2Offset = annualProduction * 0.0004 // tons CO2 per kWh

    const calculatedResults = {
      systemSize,
      totalSystemCost,
      netSystemCost,
      annualProduction,
      annualSavings,
      paybackPeriod,
      twentyYearSavings,
      co2Offset,
      incentives: {
        federalTaxCredit: federalTaxCreditAmount,
        stateIncentives: stateIncentiveAmount,
        utilityRebates: utilityRebateAmount,
        total: totalIncentives,
      },
      monthlyProduction: Math.round(annualProduction / 12),
      monthlySavings: Math.round(annualSavings / 12),
      roiPercentage: Math.round((twentyYearSavings / netSystemCost) * 100),
    }

    setResults(calculatedResults)
    setIsCalculating(false)

    toast.success("Solar analysis complete!", {
      description: `Your ${systemSize} kW system could save you $${Math.round(annualSavings).toLocaleString()} annually.`,
    })
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      if (currentStep === steps.length - 2) {
        calculateResults()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || stepIndex === 0) {
      setCurrentStep(stepIndex)
    }
  }

  const updateData = (field: keyof SolarCalculatorData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const isStepComplete = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return data.address && data.zipCode && data.monthlyBill[0] > 0
      case 1:
        return data.roofType && data.roofAge && data.roofOrientation && data.shadingLevel
      case 2:
        return data.panelType && data.inverterType
      case 3:
        return data.financingOption
      default:
        return false
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Calculator className="h-8 w-8 text-yellow-500" />
          Enhanced Solar Calculator
        </h1>
        <p className="text-muted-foreground">
          Professional solar system analysis with comprehensive financial modeling
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps[currentStep].icon, { className: "h-5 w-5" })}
                {steps[currentStep].label}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </div>
            <Badge variant="outline">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index === currentStep
                      ? "bg-primary text-primary-foreground"
                      : index < currentStep || isStepComplete(index)
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  } ${index <= currentStep ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"}`}
                  disabled={index > currentStep && !isStepComplete(index)}
                >
                  {index < currentStep || isStepComplete(index) ? <CheckCircle className="h-4 w-4" /> : index + 1}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 ${index < currentStep ? "bg-green-500" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={steps[currentStep].id} className="w-full">
            <TabsList className="hidden" />

            <TabsContent value="basic" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Property Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Property Address *</Label>
                    <Input
                      id="address"
                      placeholder="123 Solar Street, Austin, TX"
                      value={data.address}
                      onChange={(e) => updateData("address", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipcode">ZIP Code *</Label>
                    <Input
                      id="zipcode"
                      placeholder="78701"
                      value={data.zipCode}
                      onChange={(e) => updateData("zipCode", e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Energy Usage</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Monthly Electric Bill *</Label>
                      <Badge variant="secondary">${data.monthlyBill[0]}</Badge>
                    </div>
                    <Slider
                      value={data.monthlyBill}
                      onValueChange={(value) => updateData("monthlyBill", value)}
                      max={500}
                      min={50}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>$50</span>
                      <span>$500</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Electricity Rate ($/kWh)</Label>
                      <Badge variant="secondary">${data.electricityRate[0].toFixed(3)}</Badge>
                    </div>
                    <Slider
                      value={data.electricityRate}
                      onValueChange={(value) => updateData("electricityRate", value)}
                      max={0.3}
                      min={0.08}
                      step={0.001}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>$0.08</span>
                      <span>$0.30</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your electricity rate can usually be found on your utility bill. The average rate in the US is
                    $0.12/kWh.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="property" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Roof Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roof-type">Roof Type *</Label>
                    <Select value={data.roofType} onValueChange={(value) => updateData("roofType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asphalt">Asphalt Shingles</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="tile">Clay/Concrete Tile</SelectItem>
                        <SelectItem value="slate">Slate</SelectItem>
                        <SelectItem value="flat">Flat/Membrane</SelectItem>
                        <SelectItem value="wood">Wood Shingles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roof-age">Roof Age *</Label>
                    <Select value={data.roofAge} onValueChange={(value) => updateData("roofAge", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">0-5 years (New)</SelectItem>
                        <SelectItem value="good">6-15 years (Good)</SelectItem>
                        <SelectItem value="fair">16-25 years (Fair)</SelectItem>
                        <SelectItem value="old">25+ years (Needs replacement)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roof-orientation">Primary Roof Orientation *</Label>
                    <Select
                      value={data.roofOrientation}
                      onValueChange={(value) => updateData("roofOrientation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select orientation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="south">South (Best)</SelectItem>
                        <SelectItem value="southwest">Southwest (Excellent)</SelectItem>
                        <SelectItem value="southeast">Southeast (Excellent)</SelectItem>
                        <SelectItem value="west">West (Good)</SelectItem>
                        <SelectItem value="east">East (Good)</SelectItem>
                        <SelectItem value="north">North (Poor)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shading-level">Shading Level *</Label>
                    <Select value={data.shadingLevel} onValueChange={(value) => updateData("shadingLevel", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shading level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No shading (Full sun all day)</SelectItem>
                        <SelectItem value="minimal">Minimal shading (Morning/evening only)</SelectItem>
                        <SelectItem value="moderate">Moderate shading (Some trees/buildings)</SelectItem>
                        <SelectItem value="heavy">Heavy shading (Significant obstructions)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Available Roof Area (sq ft)</Label>
                    <Badge variant="secondary">{data.roofArea[0].toLocaleString()} sq ft</Badge>
                  </div>
                  <Slider
                    value={data.roofArea}
                    onValueChange={(value) => updateData("roofArea", value)}
                    max={5000}
                    min={200}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>200 sq ft</span>
                    <span>5,000 sq ft</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="structural-condition">Structural Condition</Label>
                  <Select
                    value={data.structuralCondition}
                    onValueChange={(value) => updateData("structuralCondition", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select structural condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent (Recently built/renovated)</SelectItem>
                      <SelectItem value="good">Good (Well maintained)</SelectItem>
                      <SelectItem value="fair">Fair (Some maintenance needed)</SelectItem>
                      <SelectItem value="poor">Poor (Structural work required)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {data.roofAge === "old" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your roof may need replacement before solar installation. Consider including roof replacement in
                      your solar project budget.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sun className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">Solar Panel Configuration</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="panel-type">Solar Panel Type *</Label>
                    <Select value={data.panelType} onValueChange={(value) => updateData("panelType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select panel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monocrystalline">Monocrystalline (Highest efficiency)</SelectItem>
                        <SelectItem value="polycrystalline">Polycrystalline (Good value)</SelectItem>
                        <SelectItem value="thin-film">Thin Film (Budget option)</SelectItem>
                        <SelectItem value="bifacial">Bifacial (Premium performance)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inverter-type">Inverter Type *</Label>
                    <Select value={data.inverterType} onValueChange={(value) => updateData("inverterType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inverter type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String Inverter (Most common)</SelectItem>
                        <SelectItem value="power-optimizer">Power Optimizers (Better performance)</SelectItem>
                        <SelectItem value="microinverter">Microinverters (Best performance)</SelectItem>
                        <SelectItem value="hybrid">Hybrid Inverter (Battery ready)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Panel Wattage</Label>
                    <Badge variant="secondary">{data.panelWattage[0]}W</Badge>
                  </div>
                  <Slider
                    value={data.panelWattage}
                    onValueChange={(value) => updateData("panelWattage", value)}
                    max={500}
                    min={250}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>250W</span>
                    <span>500W</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-2 mb-4">
                  <Battery className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Energy Storage</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="battery-backup"
                      checked={data.batteryBackup}
                      onCheckedChange={(checked) => updateData("batteryBackup", checked)}
                    />
                    <Label htmlFor="battery-backup" className="flex items-center gap-2">
                      <Battery className="h-4 w-4" />
                      Include Battery Backup System
                    </Label>
                  </div>

                  {data.batteryBackup && (
                    <div className="ml-6 space-y-4 p-4 bg-muted rounded-lg">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label>Battery Capacity (kWh)</Label>
                          <Badge variant="secondary">{data.batteryCapacity[0]} kWh</Badge>
                        </div>
                        <Slider
                          value={data.batteryCapacity}
                          onValueChange={(value) => updateData("batteryCapacity", value)}
                          max={50}
                          min={5}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>5 kWh</span>
                          <span>50 kWh</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Battery backup provides power during outages and can store excess solar energy for use during
                        peak hours.
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  <h3 className="text-lg font-semibold">Additional Features</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smart-monitoring"
                      checked={data.smartMonitoring}
                      onCheckedChange={(checked) => updateData("smartMonitoring", checked)}
                    />
                    <Label htmlFor="smart-monitoring">Smart Monitoring System</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="future-expansion"
                      checked={data.futureExpansion}
                      onCheckedChange={(checked) => updateData("futureExpansion", checked)}
                    />
                    <Label htmlFor="future-expansion">Plan for Future Expansion</Label>
                  </div>
                </div>

                {data.smartMonitoring && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Smart monitoring provides real-time performance tracking, maintenance alerts, and detailed energy
                      production analytics.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Financing Options</h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="financing-option">Financing Method *</Label>
                  <Select value={data.financingOption} onValueChange={(value) => updateData("financingOption", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select financing option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash Purchase (Best ROI)</SelectItem>
                      <SelectItem value="solar-loan">Solar Loan (0% down options)</SelectItem>
                      <SelectItem value="home-equity">Home Equity Loan/HELOC</SelectItem>
                      <SelectItem value="lease">Solar Lease (No upfront cost)</SelectItem>
                      <SelectItem value="ppa">Power Purchase Agreement (PPA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(data.financingOption === "cash" ||
                  data.financingOption === "solar-loan" ||
                  data.financingOption === "home-equity") && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label>Down Payment (%)</Label>
                      <Badge variant="secondary">{data.downPayment[0]}%</Badge>
                    </div>
                    <Slider
                      value={data.downPayment}
                      onValueChange={(value) => updateData("downPayment", value)}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Incentives & Rebates</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="federal-tax-credit"
                      checked={data.federalTaxCredit}
                      onCheckedChange={(checked) => updateData("federalTaxCredit", checked)}
                    />
                    <Label htmlFor="federal-tax-credit">Federal Solar Tax Credit (30%)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="state-incentives"
                      checked={data.stateIncentives}
                      onCheckedChange={(checked) => updateData("stateIncentives", checked)}
                    />
                    <Label htmlFor="state-incentives">State Incentives & Rebates</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="utility-rebates"
                      checked={data.utilityRebates}
                      onCheckedChange={(checked) => updateData("utilityRebates", checked)}
                    />
                    <Label htmlFor="utility-rebates">Utility Company Rebates</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="net-metering"
                      checked={data.netMetering}
                      onCheckedChange={(checked) => updateData("netMetering", checked)}
                    />
                    <Label htmlFor="net-metering">Net Metering Available</Label>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Available Incentives Summary</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {data.federalTaxCredit && <li>• Federal Solar Tax Credit: 30% of system cost</li>}
                    {data.stateIncentives && <li>• State Rebates: Up to $2,000</li>}
                    {data.utilityRebates && <li>• Utility Rebates: Up to $1,500</li>}
                    {data.netMetering && <li>• Net Metering: Sell excess power back to grid</li>}
                    <li>• Property Tax Exemption: Solar adds no property tax</li>
                    <li>• Accelerated Depreciation: For commercial installations</li>
                  </ul>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Incentives vary by location and change over time. We'll provide current incentives for your area in
                    the results.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {isCalculating ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Analyzing Your Solar Potential</h3>
                  <p className="text-muted-foreground">
                    Calculating system size, costs, savings, and environmental impact...
                  </p>
                  <Progress value={66} className="w-64 mx-auto mt-4" />
                </div>
              ) : results ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">Your Solar Analysis Results</h3>
                    <p className="text-muted-foreground">Based on your property details and energy usage</p>
                  </div>

                  {/* System Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          System Size
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{results.systemSize} kW</div>
                        <p className="text-xs text-muted-foreground">
                          ~{Math.ceil((results.systemSize * 1000) / data.panelWattage[0])} panels
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Sun className="h-4 w-4 text-orange-500" />
                          Annual Production
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{results.annualProduction.toLocaleString()} kWh</div>
                        <p className="text-xs text-muted-foreground">
                          {results.monthlyProduction.toLocaleString()} kWh/month
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          Annual Savings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          ${Math.round(results.annualSavings).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">${results.monthlySavings}/month</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Leaf className="h-4 w-4 text-green-500" />
                          CO₂ Offset
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{results.co2Offset.toFixed(1)} tons</div>
                        <p className="text-xs text-muted-foreground">per year</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Financial Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Financial Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="font-semibold">System Costs</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Total System Cost:</span>
                              <span className="font-medium">${results.totalSystemCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Federal Tax Credit (30%):</span>
                              <span className="font-medium">
                                -${results.incentives.federalTaxCredit.toLocaleString()}
                              </span>
                            </div>
                            {results.incentives.stateIncentives > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>State Incentives:</span>
                                <span className="font-medium">
                                  -${results.incentives.stateIncentives.toLocaleString()}
                                </span>
                              </div>
                            )}
                            {results.incentives.utilityRebates > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Utility Rebates:</span>
                                <span className="font-medium">
                                  -${results.incentives.utilityRebates.toLocaleString()}
                                </span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Net System Cost:</span>
                              <span>${results.netSystemCost.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold">Return on Investment</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Payback Period:</span>
                              <span className="font-medium">{results.paybackPeriod.toFixed(1)} years</span>
                            </div>
                            <div className="flex justify-between">
                              <span>20-Year Savings:</span>
                              <span className="font-medium text-green-600">
                                ${results.twentyYearSavings.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>ROI Percentage:</span>
                              <span className="font-medium text-green-600">{results.roiPercentage}%</span>
                            </div>
                            <Separator />
                            <div className="p-3 bg-green-50 rounded-lg">
                              <div className="text-sm text-green-600 mb-1">Total 20-Year Benefit</div>
                              <div className="text-xl font-bold text-green-700">
                                ${(results.twentyYearSavings + results.netSystemCost).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Environmental Impact */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-500" />
                        Environmental Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{(results.co2Offset * 20).toFixed(1)}</div>
                          <div className="text-sm text-green-600">Tons CO₂ offset (20 years)</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(results.co2Offset * 20 * 2.5)}
                          </div>
                          <div className="text-sm text-blue-600">Trees planted equivalent</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(results.co2Offset * 20 * 2204)}
                          </div>
                          <div className="text-sm text-purple-600">Pounds of coal avoided</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Detailed Report
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1 bg-transparent">
                      <Share className="h-4 w-4 mr-2" />
                      Share Results
                    </Button>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      This analysis is based on your inputs and average conditions. Contact a solar professional for a
                      detailed site assessment and custom quote.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Calculate</h3>
                  <p className="text-muted-foreground">
                    Complete the previous steps to see your solar analysis results.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 bg-transparent"
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              {currentStep < steps.length - 1 && !isStepComplete(currentStep) && (
                <Badge variant="destructive" className="text-xs">
                  Incomplete
                </Badge>
              )}
            </div>

            <Button
              onClick={handleNext}
              disabled={
                currentStep === steps.length - 1 || (currentStep < steps.length - 1 && !isStepComplete(currentStep))
              }
              className="flex items-center gap-2"
            >
              {currentStep === steps.length - 1 ? "Complete" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
