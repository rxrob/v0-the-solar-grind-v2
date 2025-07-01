"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Calculator,
  MapPin,
  Zap,
  DollarSign,
  FileText,
  Settings,
  Users,
  Crown,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  Leaf,
  Home,
  Car,
  Waves,
} from "lucide-react"

const steps = [
  { id: 1, title: "Customer Info", icon: Users },
  { id: 2, title: "Property Analysis", icon: Home },
  { id: 3, title: "Energy Profile", icon: Zap },
  { id: 4, title: "Advanced Features", icon: Settings },
  { id: 5, title: "System Design", icon: Calculator },
  { id: 6, title: "Financial Options", icon: DollarSign },
  { id: 7, title: "Installation", icon: MapPin },
  { id: 8, title: "Results", icon: FileText },
]

export default function TestAdvancedCalculator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Customer Info
    customerName: "",
    email: "",
    phone: "",
    address: "",

    // Property Analysis
    roofType: "",
    roofAge: "",
    shading: "",
    orientation: "",

    // Energy Profile
    monthlyBill: "",
    annualUsage: "",
    utilityCompany: "",

    // Advanced Features
    hasEV: false,
    hasPool: false,
    hasBattery: false,

    // System Design
    panelType: "",
    inverterType: "",
    systemSize: "",

    // Financial
    financingType: "",
    downPayment: "",

    // Installation
    installationDate: "",
    installer: "",
  })

  const progress = (currentStep / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Customer Information</h2>
              <p className="text-muted-foreground">Let's start with basic customer details</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="address">Property Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Property Analysis</h2>
              <p className="text-muted-foreground">Tell us about your roof and property</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roofType">Roof Type</Label>
                <Select
                  value={formData.roofType}
                  onValueChange={(value) => setFormData({ ...formData, roofType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select roof type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asphalt">Asphalt Shingles</SelectItem>
                    <SelectItem value="tile">Tile</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="flat">Flat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="roofAge">Roof Age</Label>
                <Select
                  value={formData.roofAge}
                  onValueChange={(value) => setFormData({ ...formData, roofAge: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select roof age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-5">0-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="11-15">11-15 years</SelectItem>
                    <SelectItem value="16+">16+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="shading">Shading Level</Label>
                <Select
                  value={formData.shading}
                  onValueChange={(value) => setFormData({ ...formData, shading: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shading level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Shading</SelectItem>
                    <SelectItem value="minimal">Minimal Shading</SelectItem>
                    <SelectItem value="moderate">Moderate Shading</SelectItem>
                    <SelectItem value="heavy">Heavy Shading</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="orientation">Primary Roof Orientation</Label>
                <Select
                  value={formData.orientation}
                  onValueChange={(value) => setFormData({ ...formData, orientation: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select orientation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="south">South</SelectItem>
                    <SelectItem value="southwest">Southwest</SelectItem>
                    <SelectItem value="southeast">Southeast</SelectItem>
                    <SelectItem value="east">East</SelectItem>
                    <SelectItem value="west">West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Satellite Analysis Available</span>
              </div>
              <p className="text-sm text-blue-700">
                We'll use high-resolution satellite imagery to analyze your roof's solar potential automatically.
              </p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Energy Profile</h2>
              <p className="text-muted-foreground">Understanding your current energy usage</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyBill">Average Monthly Electric Bill</Label>
                <Input
                  id="monthlyBill"
                  type="number"
                  value={formData.monthlyBill}
                  onChange={(e) => setFormData({ ...formData, monthlyBill: e.target.value })}
                  placeholder="150"
                />
              </div>
              <div>
                <Label htmlFor="annualUsage">Annual kWh Usage (if known)</Label>
                <Input
                  id="annualUsage"
                  type="number"
                  value={formData.annualUsage}
                  onChange={(e) => setFormData({ ...formData, annualUsage: e.target.value })}
                  placeholder="12000"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="utilityCompany">Utility Company</Label>
                <Input
                  id="utilityCompany"
                  value={formData.utilityCompany}
                  onChange={(e) => setFormData({ ...formData, utilityCompany: e.target.value })}
                  placeholder="Pacific Gas & Electric"
                />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Smart Usage Analysis</span>
              </div>
              <p className="text-sm text-green-700">
                We'll analyze your utility's rate structure and time-of-use patterns for maximum savings.
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Advanced Features</h2>
              <p className="text-muted-foreground">Additional considerations for your solar system</p>
            </div>
            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Car className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-medium">Electric Vehicle</h3>
                      <p className="text-sm text-muted-foreground">Do you have or plan to get an EV?</p>
                    </div>
                  </div>
                  <Button
                    variant={formData.hasEV ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, hasEV: !formData.hasEV })}
                  >
                    {formData.hasEV ? "Yes" : "No"}
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Waves className="h-6 w-6 text-cyan-600" />
                    <div>
                      <h3 className="font-medium">Swimming Pool</h3>
                      <p className="text-sm text-muted-foreground">Pool pump increases energy usage</p>
                    </div>
                  </div>
                  <Button
                    variant={formData.hasPool ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, hasPool: !formData.hasPool })}
                  >
                    {formData.hasPool ? "Yes" : "No"}
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-amber-600" />
                    <div>
                      <h3 className="font-medium">Battery Storage</h3>
                      <p className="text-sm text-muted-foreground">Backup power and energy independence</p>
                    </div>
                  </div>
                  <Button
                    variant={formData.hasBattery ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, hasBattery: !formData.hasBattery })}
                  >
                    {formData.hasBattery ? "Yes" : "No"}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">System Design</h2>
              <p className="text-muted-foreground">Configure your solar system components</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="panelType">Solar Panel Type</Label>
                <Select
                  value={formData.panelType}
                  onValueChange={(value) => setFormData({ ...formData, panelType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select panel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silfab-prime">Silfab Prime 400W (Premium)</SelectItem>
                    <SelectItem value="silfab-elite">Silfab Elite 380W (Standard)</SelectItem>
                    <SelectItem value="qcells">Q CELLS Q.PEAK 365W</SelectItem>
                    <SelectItem value="rec">REC Alpha Pure 405W</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="inverterType">Inverter Type</Label>
                <Select
                  value={formData.inverterType}
                  onValueChange={(value) => setFormData({ ...formData, inverterType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inverter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enphase-iq8">Enphase IQ8+ Microinverters</SelectItem>
                    <SelectItem value="solaredge">SolarEdge Power Optimizers</SelectItem>
                    <SelectItem value="string">String Inverter (Basic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="systemSize">Target System Size (kW)</Label>
                <Input
                  id="systemSize"
                  type="number"
                  value={formData.systemSize}
                  onChange={(e) => setFormData({ ...formData, systemSize: e.target.value })}
                  placeholder="8.5"
                />
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-900">AI-Optimized Design</span>
              </div>
              <p className="text-sm text-amber-700">
                Our AI will optimize panel placement and system configuration for maximum efficiency and aesthetics.
              </p>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Financial Options</h2>
              <p className="text-muted-foreground">Choose your preferred financing method</p>
            </div>
            <div className="grid gap-4">
              <Card
                className={`p-4 cursor-pointer border-2 ${formData.financingType === "cash" ? "border-green-500 bg-green-50" : "border-gray-200"}`}
                onClick={() => setFormData({ ...formData, financingType: "cash" })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Cash Purchase</h3>
                    <p className="text-sm text-muted-foreground">Best long-term savings, immediate ownership</p>
                  </div>
                  <Badge variant={formData.financingType === "cash" ? "default" : "outline"}>Recommended</Badge>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer border-2 ${formData.financingType === "loan" ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                onClick={() => setFormData({ ...formData, financingType: "loan" })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Solar Loan</h3>
                    <p className="text-sm text-muted-foreground">Low interest rates, immediate savings</p>
                  </div>
                  <Badge variant={formData.financingType === "loan" ? "default" : "outline"}>Popular</Badge>
                </div>
              </Card>

              <Card
                className={`p-4 cursor-pointer border-2 ${formData.financingType === "lease" ? "border-purple-500 bg-purple-50" : "border-gray-200"}`}
                onClick={() => setFormData({ ...formData, financingType: "lease" })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Solar Lease/PPA</h3>
                    <p className="text-sm text-muted-foreground">No upfront cost, predictable payments</p>
                  </div>
                  <Badge variant={formData.financingType === "lease" ? "default" : "outline"}>$0 Down</Badge>
                </div>
              </Card>
            </div>

            {formData.financingType === "cash" && (
              <div>
                <Label htmlFor="downPayment">Down Payment Amount</Label>
                <Input
                  id="downPayment"
                  type="number"
                  value={formData.downPayment}
                  onChange={(e) => setFormData({ ...formData, downPayment: e.target.value })}
                  placeholder="25000"
                />
              </div>
            )}
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Installation Details</h2>
              <p className="text-muted-foreground">Timeline and installer preferences</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="installationDate">Preferred Installation Timeframe</Label>
                <Select
                  value={formData.installationDate}
                  onValueChange={(value) => setFormData({ ...formData, installationDate: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">As soon as possible</SelectItem>
                    <SelectItem value="1-3months">1-3 months</SelectItem>
                    <SelectItem value="3-6months">3-6 months</SelectItem>
                    <SelectItem value="6months+">6+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="installer">Preferred Installer</Label>
                <Select
                  value={formData.installer}
                  onValueChange={(value) => setFormData({ ...formData, installer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select installer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunrun">Sunrun</SelectItem>
                    <SelectItem value="tesla">Tesla Solar</SelectItem>
                    <SelectItem value="local">Local Installer</SelectItem>
                    <SelectItem value="multiple">Get Multiple Quotes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Installation Network</span>
              </div>
              <p className="text-sm text-blue-700">
                We'll connect you with certified installers in your area and help you compare quotes.
              </p>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="h-8 w-8 text-amber-500" />
                <h2 className="text-3xl font-bold">Professional Solar Analysis</h2>
              </div>
              <p className="text-muted-foreground">Comprehensive results and recommendations</p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="financial">Financial</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="environmental">Environmental</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="report">Report</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">System Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">8.5 kW</div>
                      <p className="text-sm text-muted-foreground">22 panels</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Annual Production</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">12,450 kWh</div>
                      <p className="text-sm text-muted-foreground">103% of usage</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">First Year Savings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-600">$1,847</div>
                      <p className="text-sm text-muted-foreground">Monthly: $154</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Investment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>System Cost:</span>
                        <span className="font-medium">$25,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Federal Tax Credit (30%):</span>
                        <span className="font-medium text-green-600">-$7,650</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State Incentives:</span>
                        <span className="font-medium text-green-600">-$2,000</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Net Investment:</span>
                        <span>$15,850</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        25-Year Projection
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Savings:</span>
                        <span className="font-medium text-green-600">$46,175</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payback Period:</span>
                        <span className="font-medium">8.6 years</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI:</span>
                        <span className="font-medium text-green-600">291%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Specifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Panels:</span>
                        <span className="font-medium">22x Silfab Prime 400W</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inverters:</span>
                        <span className="font-medium">Enphase IQ8+</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span className="font-medium">21.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Warranty:</span>
                        <span className="font-medium">25 years</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Production Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Peak Sun Hours:</span>
                        <span className="font-medium">5.2 hours/day</span>
                      </div>
                      <div className="flex justify-between">
                        <span>System Efficiency:</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shading Loss:</span>
                        <span className="font-medium">3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Degradation:</span>
                        <span className="font-medium">0.5%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="environmental" className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Leaf className="h-5 w-5 text-green-600" />
                        CO₂ Avoided
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">6.2 tons</div>
                      <p className="text-sm text-muted-foreground">per year</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Trees Equivalent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">155 trees</div>
                      <p className="text-sm text-muted-foreground">planted annually</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">25-Year Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">155 tons</div>
                      <p className="text-sm text-muted-foreground">CO₂ avoided</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Installation Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Site Survey & Design</h4>
                          <p className="text-sm text-muted-foreground">1-2 weeks</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Permits & Approvals</h4>
                          <p className="text-sm text-muted-foreground">2-4 weeks</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Installation</h4>
                          <p className="text-sm text-muted-foreground">1-3 days</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Inspection & Activation</h4>
                          <p className="text-sm text-muted-foreground">1-2 weeks</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="report" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Professional Report
                    </CardTitle>
                    <CardDescription>Generate a comprehensive PDF report with all analysis details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Report Includes:</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Executive summary</li>
                          <li>• Detailed financial analysis</li>
                          <li>• System specifications</li>
                          <li>• Satellite imagery</li>
                          <li>• Environmental impact</li>
                          <li>• Installation timeline</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Customization:</h4>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Company branding</li>
                          <li>• Customer information</li>
                          <li>• Multiple scenarios</li>
                          <li>• Installer recommendations</li>
                        </ul>
                      </div>
                    </div>
                    <Button className="w-full" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Generate Professional Report
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="h-8 w-8 text-amber-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced Solar Calculator</h1>
                <p className="text-sm text-muted-foreground">Professional solar analysis and reporting</p>
              </div>
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pro Feature</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div key={step.id} className="flex flex-col items-center min-w-0 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs text-center ${isActive ? "text-blue-600 font-medium" : "text-gray-600"}`}>
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Main Content */}
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={nextStep}
            disabled={currentStep === steps.length}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {currentStep === steps.length ? "Complete Analysis" : "Next Step"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
