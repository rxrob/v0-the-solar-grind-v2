"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Home, Zap, Settings, DollarSign, BarChart3, Sun, Battery, Crown, FileText } from "lucide-react"

export default function ProCalculator() {
  const [activeTab, setActiveTab] = useState("property")
  const [formData, setFormData] = useState({
    // Property
    address: "",
    propertyType: "residential",
    roofType: "asphalt",
    roofAge: 10,
    shadingLevel: 20,

    // Energy
    monthlyBill: 150,
    annualUsage: 12000,
    utilityCompany: "",
    electricityRate: 0.12,

    // System
    systemSize: 8.5,
    panelType: "monocrystalline",
    inverterType: "string",
    batteryStorage: false,

    // Financial
    installationCost: 25000,
    federalTaxCredit: 30,
    stateIncentives: 2000,
    financingType: "cash",
    loanTerm: 20,
    interestRate: 4.5,
  })

  const [results, setResults] = useState({
    annualProduction: 12750,
    annualSavings: 1530,
    paybackPeriod: 8.2,
    roi25Year: 45600,
    monthlyPayment: 0,
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    calculateResults()
  }

  const calculateResults = () => {
    // Simplified calculation logic
    const production = formData.systemSize * 1500 * (1 - formData.shadingLevel / 100)
    const savings = production * formData.electricityRate
    const netCost =
      formData.installationCost -
      (formData.installationCost * formData.federalTaxCredit) / 100 -
      formData.stateIncentives
    const payback = netCost / savings
    const roi = savings * 25 - netCost

    let monthlyPayment = 0
    if (formData.financingType === "loan") {
      const monthlyRate = formData.interestRate / 100 / 12
      const numPayments = formData.loanTerm * 12
      monthlyPayment =
        (netCost * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1)
    }

    setResults({
      annualProduction: Math.round(production),
      annualSavings: Math.round(savings),
      paybackPeriod: Math.round(payback * 10) / 10,
      roi25Year: Math.round(roi),
      monthlyPayment: Math.round(monthlyPayment),
    })
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-orange-400 mr-3" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-yellow-500 bg-clip-text text-transparent">
              Pro Solar Calculator
            </h1>
          </div>
          <p className="text-slate-300 text-lg">Advanced solar analysis with professional-grade calculations</p>
          <Badge className="mt-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
            Unlimited Calculations
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Calculator */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Solar System Configuration
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Configure your solar system parameters for accurate calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5 bg-slate-700">
                    <TabsTrigger value="property" className="data-[state=active]:bg-orange-500">
                      <Home className="h-4 w-4 mr-1" />
                      Property
                    </TabsTrigger>
                    <TabsTrigger value="energy" className="data-[state=active]:bg-orange-500">
                      <Zap className="h-4 w-4 mr-1" />
                      Energy
                    </TabsTrigger>
                    <TabsTrigger value="system" className="data-[state=active]:bg-orange-500">
                      <Settings className="h-4 w-4 mr-1" />
                      System
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="data-[state=active]:bg-orange-500">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Financial
                    </TabsTrigger>
                    <TabsTrigger value="results" className="data-[state=active]:bg-orange-500">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Results
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="property" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="address" className="text-white">
                          Property Address
                        </Label>
                        <Input
                          id="address"
                          placeholder="Enter property address"
                          value={formData.address}
                          onChange={(e) => updateFormData("address", e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Property Type</Label>
                          <Select
                            value={formData.propertyType}
                            onValueChange={(value) => updateFormData("propertyType", value)}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="residential">Residential</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                              <SelectItem value="industrial">Industrial</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white">Roof Type</Label>
                          <Select
                            value={formData.roofType}
                            onValueChange={(value) => updateFormData("roofType", value)}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asphalt">Asphalt Shingles</SelectItem>
                              <SelectItem value="metal">Metal</SelectItem>
                              <SelectItem value="tile">Tile</SelectItem>
                              <SelectItem value="flat">Flat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Roof Age: {formData.roofAge} years</Label>
                        <Slider
                          value={[formData.roofAge]}
                          onValueChange={(value) => updateFormData("roofAge", value[0])}
                          max={50}
                          step={1}
                          className="mt-2"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Shading Level: {formData.shadingLevel}%</Label>
                        <Slider
                          value={[formData.shadingLevel]}
                          onValueChange={(value) => updateFormData("shadingLevel", value[0])}
                          max={100}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="energy" className="space-y-6 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthlyBill" className="text-white">
                          Monthly Electric Bill ($)
                        </Label>
                        <Input
                          id="monthlyBill"
                          type="number"
                          value={formData.monthlyBill}
                          onChange={(e) => updateFormData("monthlyBill", Number(e.target.value))}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="annualUsage" className="text-white">
                          Annual Usage (kWh)
                        </Label>
                        <Input
                          id="annualUsage"
                          type="number"
                          value={formData.annualUsage}
                          onChange={(e) => updateFormData("annualUsage", Number(e.target.value))}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="utilityCompany" className="text-white">
                        Utility Company
                      </Label>
                      <Input
                        id="utilityCompany"
                        placeholder="Enter utility company name"
                        value={formData.utilityCompany}
                        onChange={(e) => updateFormData("utilityCompany", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="electricityRate" className="text-white">
                        Electricity Rate ($/kWh)
                      </Label>
                      <Input
                        id="electricityRate"
                        type="number"
                        step="0.01"
                        value={formData.electricityRate}
                        onChange={(e) => updateFormData("electricityRate", Number(e.target.value))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="system" className="space-y-6 mt-6">
                    <div>
                      <Label className="text-white">System Size: {formData.systemSize} kW</Label>
                      <Slider
                        value={[formData.systemSize]}
                        onValueChange={(value) => updateFormData("systemSize", value[0])}
                        min={3}
                        max={20}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Panel Type</Label>
                        <Select
                          value={formData.panelType}
                          onValueChange={(value) => updateFormData("panelType", value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monocrystalline">Monocrystalline</SelectItem>
                            <SelectItem value="polycrystalline">Polycrystalline</SelectItem>
                            <SelectItem value="thin-film">Thin Film</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white">Inverter Type</Label>
                        <Select
                          value={formData.inverterType}
                          onValueChange={(value) => updateFormData("inverterType", value)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="string">String Inverter</SelectItem>
                            <SelectItem value="power-optimizer">Power Optimizer</SelectItem>
                            <SelectItem value="microinverter">Microinverter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="batteryStorage"
                        checked={formData.batteryStorage}
                        onChange={(e) => updateFormData("batteryStorage", e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="batteryStorage" className="text-white flex items-center">
                        <Battery className="mr-2 h-4 w-4" />
                        Include Battery Storage
                      </Label>
                    </div>
                  </TabsContent>

                  <TabsContent value="financial" className="space-y-6 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="installationCost" className="text-white">
                          Installation Cost ($)
                        </Label>
                        <Input
                          id="installationCost"
                          type="number"
                          value={formData.installationCost}
                          onChange={(e) => updateFormData("installationCost", Number(e.target.value))}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>

                      <div>
                        <Label htmlFor="federalTaxCredit" className="text-white">
                          Federal Tax Credit (%)
                        </Label>
                        <Input
                          id="federalTaxCredit"
                          type="number"
                          value={formData.federalTaxCredit}
                          onChange={(e) => updateFormData("federalTaxCredit", Number(e.target.value))}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="stateIncentives" className="text-white">
                        State Incentives ($)
                      </Label>
                      <Input
                        id="stateIncentives"
                        type="number"
                        value={formData.stateIncentives}
                        onChange={(e) => updateFormData("stateIncentives", Number(e.target.value))}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Financing Type</Label>
                      <Select
                        value={formData.financingType}
                        onValueChange={(value) => updateFormData("financingType", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash Purchase</SelectItem>
                          <SelectItem value="loan">Solar Loan</SelectItem>
                          <SelectItem value="lease">Solar Lease</SelectItem>
                          <SelectItem value="ppa">Power Purchase Agreement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.financingType === "loan" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="loanTerm" className="text-white">
                            Loan Term (years)
                          </Label>
                          <Input
                            id="loanTerm"
                            type="number"
                            value={formData.loanTerm}
                            onChange={(e) => updateFormData("loanTerm", Number(e.target.value))}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>

                        <div>
                          <Label htmlFor="interestRate" className="text-white">
                            Interest Rate (%)
                          </Label>
                          <Input
                            id="interestRate"
                            type="number"
                            step="0.1"
                            value={formData.interestRate}
                            onChange={(e) => updateFormData("interestRate", Number(e.target.value))}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="results" className="mt-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-lg flex items-center">
                            <Sun className="mr-2 h-5 w-5 text-yellow-400" />
                            Annual Production
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-yellow-400">
                            {results.annualProduction.toLocaleString()} kWh
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-lg flex items-center">
                            <DollarSign className="mr-2 h-5 w-5 text-green-400" />
                            Annual Savings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-400">
                            ${results.annualSavings.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-lg">Payback Period</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-blue-400">{results.paybackPeriod} years</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-lg">25-Year ROI</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-purple-400">
                            ${results.roi25Year.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {formData.financingType === "loan" && (
                      <Card className="bg-slate-700/50 border-slate-600 mt-6">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-lg">Monthly Payment</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-orange-400">
                            ${results.monthlyPayment.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Results Summary */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-400">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Quick Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Annual Production</span>
                  <span className="text-yellow-400 font-semibold">{results.annualProduction.toLocaleString()} kWh</span>
                </div>
                <Separator className="bg-slate-600" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Annual Savings</span>
                  <span className="text-green-400 font-semibold">${results.annualSavings.toLocaleString()}</span>
                </div>
                <Separator className="bg-slate-600" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Payback Period</span>
                  <span className="text-blue-400 font-semibold">{results.paybackPeriod} years</span>
                </div>
                <Separator className="bg-slate-600" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">25-Year ROI</span>
                  <span className="text-purple-400 font-semibold">${results.roi25Year.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Generate Report
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Create a professional PDF report with your calculations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF Report
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pro Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-green-400">
                  <Crown className="mr-2 h-4 w-4" />
                  <span className="text-sm">Unlimited calculations</span>
                </div>
                <div className="flex items-center text-green-400">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="text-sm">Professional PDF reports</span>
                </div>
                <div className="flex items-center text-green-400">
                  <Settings className="mr-2 h-4 w-4" />
                  <span className="text-sm">Advanced configuration</span>
                </div>
                <div className="flex items-center text-green-400">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span className="text-sm">Detailed analytics</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
