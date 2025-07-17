"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calculator, Home, Zap, Settings, DollarSign, BarChart3, Crown } from "lucide-react"

interface CalculationResults {
  annualProduction: number
  annualSavings: number
  paybackPeriod: number
  roi25Year: number
  monthlyPayment: number
  systemCost: number
  netCost: number
}

export default function ProCalculatorPage() {
  const [activeTab, setActiveTab] = useState("property")
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<CalculationResults | null>(null)

  // Form state
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
    utilityCompany: "oncor",
    electricityRate: 0.12,

    // System
    systemSize: 8.5,
    panelType: "monocrystalline",
    inverterType: "string",
    batteryStorage: false,

    // Financial
    installationCost: 25500,
    federalTaxCredit: 7650,
    stateIncentives: 2000,
    financingType: "cash",
    loanTerm: 20,
    interestRate: 4.5,
    downPayment: 0,
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateResults = async () => {
    setIsCalculating(true)

    // Simulate calculation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Calculate results based on form data
    const annualProduction = formData.systemSize * 1200 // kWh per kW
    const annualSavings = annualProduction * formData.electricityRate
    const netCost = formData.installationCost - formData.federalTaxCredit - formData.stateIncentives
    const paybackPeriod = netCost / annualSavings
    const roi25Year = ((annualSavings * 25 - netCost) / netCost) * 100

    let monthlyPayment = 0
    if (formData.financingType === "loan") {
      const principal = netCost - formData.downPayment
      const monthlyRate = formData.interestRate / 100 / 12
      const numPayments = formData.loanTerm * 12
      monthlyPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1)
    }

    setResults({
      annualProduction,
      annualSavings,
      paybackPeriod,
      roi25Year,
      monthlyPayment,
      systemCost: formData.installationCost,
      netCost,
    })

    setIsCalculating(false)
    setActiveTab("results")
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
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Advanced solar analysis with professional-grade calculations and detailed financial modeling
          </p>
          <Badge className="mt-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">Professional Edition</Badge>
        </div>

        {/* Calculator Interface */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800 mb-8">
              <TabsTrigger value="property" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Property
              </TabsTrigger>
              <TabsTrigger value="energy" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Energy
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Financial
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Results
              </TabsTrigger>
            </TabsList>

            {/* Property Tab */}
            <TabsContent value="property" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Property Information
                  </CardTitle>
                  <CardDescription>Enter details about the property for solar installation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="address">Property Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St, City, State"
                        value={formData.address}
                        onChange={(e) => updateFormData("address", e.target.value)}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select
                        value={formData.propertyType}
                        onValueChange={(value) => updateFormData("propertyType", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roofType">Roof Type</Label>
                      <Select value={formData.roofType} onValueChange={(value) => updateFormData("roofType", value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asphalt">Asphalt Shingles</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                          <SelectItem value="tile">Tile</SelectItem>
                          <SelectItem value="flat">Flat Roof</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roofAge">Roof Age (years)</Label>
                      <Input
                        id="roofAge"
                        type="number"
                        value={formData.roofAge}
                        onChange={(e) => updateFormData("roofAge", Number.parseInt(e.target.value))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Shading Level: {formData.shadingLevel}%</Label>
                    <Slider
                      value={[formData.shadingLevel]}
                      onValueChange={(value) => updateFormData("shadingLevel", value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>No Shade</span>
                      <span>Heavy Shade</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Energy Tab */}
            <TabsContent value="energy" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Energy Usage Analysis
                  </CardTitle>
                  <CardDescription>Current energy consumption and utility information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="monthlyBill">Average Monthly Bill ($)</Label>
                      <Input
                        id="monthlyBill"
                        type="number"
                        value={formData.monthlyBill}
                        onChange={(e) => updateFormData("monthlyBill", Number.parseFloat(e.target.value))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="annualUsage">Annual Usage (kWh)</Label>
                      <Input
                        id="annualUsage"
                        type="number"
                        value={formData.annualUsage}
                        onChange={(e) => updateFormData("annualUsage", Number.parseInt(e.target.value))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="utilityCompany">Utility Company</Label>
                      <Select
                        value={formData.utilityCompany}
                        onValueChange={(value) => updateFormData("utilityCompany", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oncor">Oncor (Texas)</SelectItem>
                          <SelectItem value="pge">PG&E (California)</SelectItem>
                          <SelectItem value="sce">SCE (California)</SelectItem>
                          <SelectItem value="fpl">FPL (Florida)</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="electricityRate">Electricity Rate ($/kWh)</Label>
                      <Input
                        id="electricityRate"
                        type="number"
                        step="0.01"
                        value={formData.electricityRate}
                        onChange={(e) => updateFormData("electricityRate", Number.parseFloat(e.target.value))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>Solar system specifications and components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="systemSize">System Size (kW)</Label>
                      <Input
                        id="systemSize"
                        type="number"
                        step="0.1"
                        value={formData.systemSize}
                        onChange={(e) => updateFormData("systemSize", Number.parseFloat(e.target.value))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="panelType">Panel Type</Label>
                      <Select value={formData.panelType} onValueChange={(value) => updateFormData("panelType", value)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monocrystalline">Monocrystalline</SelectItem>
                          <SelectItem value="polycrystalline">Polycrystalline</SelectItem>
                          <SelectItem value="thin-film">Thin Film</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inverterType">Inverter Type</Label>
                      <Select
                        value={formData.inverterType}
                        onValueChange={(value) => updateFormData("inverterType", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String Inverter</SelectItem>
                          <SelectItem value="power-optimizer">Power Optimizers</SelectItem>
                          <SelectItem value="microinverter">Microinverters</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batteryStorage">Battery Storage</Label>
                      <Select
                        value={formData.batteryStorage ? "yes" : "no"}
                        onValueChange={(value) => updateFormData("batteryStorage", value === "yes")}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No Battery</SelectItem>
                          <SelectItem value="yes">Include Battery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Analysis
                  </CardTitle>
                  <CardDescription>Cost breakdown and financing options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="installationCost">Installation Cost ($)</Label>
                      <Input
                        id="installationCost"
                        type="number"
                        value={formData.installationCost}
                        onChange={(e) => updateFormData("installationCost", Number.parseFloat(e.target.value))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="federalTaxCredit">Federal Tax Credit ($)</Label>
                      <Input
                        id="federalTaxCredit"
                        type="number"
                        value={formData.federalTaxCredit}
                        onChange={(e) => updateFormData("federalTaxCredit", Number.parseFloat(e.target.value))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stateIncentives">State Incentives ($)</Label>
                      <Input
                        id="stateIncentives"
                        type="number"
                        value={formData.stateIncentives}
                        onChange={(e) => updateFormData("stateIncentives", Number.parseFloat(e.target.value))}
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="financingType">Financing Type</Label>
                      <Select
                        value={formData.financingType}
                        onValueChange={(value) => updateFormData("financingType", value)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600">
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
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="loanTerm">Loan Term (years)</Label>
                          <Input
                            id="loanTerm"
                            type="number"
                            value={formData.loanTerm}
                            onChange={(e) => updateFormData("loanTerm", Number.parseInt(e.target.value))}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="interestRate">Interest Rate (%)</Label>
                          <Input
                            id="interestRate"
                            type="number"
                            step="0.1"
                            value={formData.interestRate}
                            onChange={(e) => updateFormData("interestRate", Number.parseFloat(e.target.value))}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="downPayment">Down Payment ($)</Label>
                          <Input
                            id="downPayment"
                            type="number"
                            value={formData.downPayment}
                            onChange={(e) => updateFormData("downPayment", Number.parseFloat(e.target.value))}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              {!results ? (
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-12 text-center">
                    <Calculator className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Ready to Calculate</h3>
                    <p className="text-slate-300 mb-6">
                      Complete the configuration tabs and click calculate to see your professional solar analysis
                    </p>
                    <Button
                      onClick={calculateResults}
                      disabled={isCalculating}
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    >
                      {isCalculating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Calculator className="mr-2 h-4 w-4" />
                          Calculate Results
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/50">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          {results.annualProduction.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-300">kWh/year</div>
                        <div className="text-xs text-slate-400 mt-1">Annual Production</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/50">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                          ${results.annualSavings.toLocaleString()}
                        </div>
                        <div className="text-sm text-slate-300">per year</div>
                        <div className="text-xs text-slate-400 mt-1">Annual Savings</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/50">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-orange-400 mb-2">
                          {results.paybackPeriod.toFixed(1)}
                        </div>
                        <div className="text-sm text-slate-300">years</div>
                        <div className="text-xs text-slate-400 mt-1">Payback Period</div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/50">
                      <CardContent className="p-6 text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">{results.roi25Year.toFixed(0)}%</div>
                        <div className="text-sm text-slate-300">25-year</div>
                        <div className="text-xs text-slate-400 mt-1">ROI</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Results */}
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Professional Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold text-white">System Performance</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-300">System Size:</span>
                              <span className="text-white">{formData.systemSize} kW</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Annual Production:</span>
                              <span className="text-white">{results.annualProduction.toLocaleString()} kWh</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Production Factor:</span>
                              <span className="text-white">
                                {(results.annualProduction / formData.systemSize).toFixed(0)} kWh/kW
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold text-white">Financial Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-300">System Cost:</span>
                              <span className="text-white">${results.systemCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-300">Net Cost:</span>
                              <span className="text-white">${results.netCost.toLocaleString()}</span>
                            </div>
                            {formData.financingType === "loan" && (
                              <div className="flex justify-between">
                                <span className="text-slate-300">Monthly Payment:</span>
                                <span className="text-white">${results.monthlyPayment.toFixed(0)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-700">
                        <Button onClick={() => setActiveTab("property")} variant="outline" className="mr-4">
                          Modify Inputs
                        </Button>
                        <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
                          Generate Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
