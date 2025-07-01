"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  Bell,
  Calculator,
  FileText,
  Activity,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react"
import { toast } from "@/hooks/use-toast-sonner"

export default function TabsDemo() {
  const [currentStep, setCurrentStep] = useState(0)
  const [solarData, setSolarData] = useState({
    address: "",
    monthlyBill: 150,
    electricityRate: 0.12,
    roofType: "",
    roofAge: "",
    shading: "",
    panelType: "",
    batteryBackup: false,
    futureNeeds: false,
    financing: "",
    taxCredit: true,
    localIncentives: false,
  })

  const steps = ["Basic Info", "Property Details", "System Configuration", "Financial Options", "Results"]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      toast.success(`Moved to ${steps[currentStep + 1]}`)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      toast.info(`Back to ${steps[currentStep - 1]}`)
    }
  }

  const calculateResults = () => {
    const systemSize = Math.ceil((solarData.monthlyBill * 12) / (solarData.electricityRate * 1000 * 4.5))
    const systemCost = systemSize * 3000
    const annualSavings = solarData.monthlyBill * 12 * 0.9
    const paybackPeriod = systemCost / annualSavings
    const co2Offset = systemSize * 1.2

    return {
      systemSize,
      systemCost,
      annualSavings,
      paybackPeriod: Math.round(paybackPeriod * 10) / 10,
      co2Offset: Math.round(co2Offset * 10) / 10,
    }
  }

  const results = calculateResults()

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Tabs Component Demo</h1>
        <p className="text-muted-foreground">Comprehensive showcase of tab functionality across different use cases</p>
      </div>

      {/* Basic Tabs Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Basic Dashboard Tabs
          </CardTitle>
          <CardDescription>Simple tab navigation for dashboard sections</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2,350</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12.5%</div>
                    <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Metrics</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Efficiency</span>
                    <span className="text-sm font-medium">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">Energy Production</span>
                    <span className="text-sm font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">System Uptime</span>
                    <span className="text-sm font-medium">99.2%</span>
                  </div>
                  <Progress value={99.2} className="h-2" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Reports</h3>
                <div className="space-y-2">
                  {[
                    { name: "Monthly Performance Report", date: "Dec 2024", status: "completed" },
                    { name: "Annual Energy Analysis", date: "Dec 2024", status: "processing" },
                    { name: "Cost Savings Summary", date: "Nov 2024", status: "completed" },
                    { name: "Environmental Impact Report", date: "Nov 2024", status: "completed" },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{report.name}</p>
                          <p className="text-xs text-muted-foreground">{report.date}</p>
                        </div>
                      </div>
                      <Badge variant={report.status === "completed" ? "default" : "secondary"}>{report.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Notifications</h3>
                <div className="space-y-2">
                  {[
                    { message: "System maintenance completed successfully", time: "2 hours ago", type: "success" },
                    { message: "Monthly report is ready for download", time: "4 hours ago", type: "info" },
                    { message: "Energy production exceeded expectations", time: "1 day ago", type: "success" },
                    { message: "Scheduled maintenance reminder", time: "2 days ago", type: "warning" },
                  ].map((notification, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Bell className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Multi-Step Solar Calculator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Multi-Step Solar Calculator
          </CardTitle>
          <CardDescription>Step-by-step solar system configuration with tabs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={steps[currentStep].toLowerCase().replace(" ", "-")} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {steps.map((step, index) => (
                <TabsTrigger
                  key={step}
                  value={step.toLowerCase().replace(" ", "-")}
                  disabled={index !== currentStep}
                  className="relative"
                >
                  {index < currentStep && <CheckCircle className="h-4 w-4 mr-1 text-green-500" />}
                  {step}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="basic-info" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Property Address</Label>
                    <Input
                      id="address"
                      placeholder="Enter your address"
                      value={solarData.address}
                      onChange={(e) => setSolarData({ ...solarData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly-bill">Monthly Electric Bill ($)</Label>
                    <Input
                      id="monthly-bill"
                      type="number"
                      value={solarData.monthlyBill}
                      onChange={(e) => setSolarData({ ...solarData, monthlyBill: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Electricity Rate ($/kWh): {solarData.electricityRate}</Label>
                    <Slider
                      value={[solarData.electricityRate]}
                      onValueChange={(value) => setSolarData({ ...solarData, electricityRate: value[0] })}
                      max={0.5}
                      min={0.05}
                      step={0.01}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="property-details" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Roof Type</Label>
                    <Select
                      value={solarData.roofType}
                      onValueChange={(value) => setSolarData({ ...solarData, roofType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asphalt">Asphalt Shingles</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="tile">Tile</SelectItem>
                        <SelectItem value="flat">Flat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Roof Age</Label>
                    <Select
                      value={solarData.roofAge}
                      onValueChange={(value) => setSolarData({ ...solarData, roofAge: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select roof age" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">0-5 years</SelectItem>
                        <SelectItem value="good">6-15 years</SelectItem>
                        <SelectItem value="older">16+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Shading Conditions</Label>
                    <Select
                      value={solarData.shading}
                      onValueChange={(value) => setSolarData({ ...solarData, shading: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select shading" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No shading</SelectItem>
                        <SelectItem value="minimal">Minimal shading</SelectItem>
                        <SelectItem value="moderate">Moderate shading</SelectItem>
                        <SelectItem value="heavy">Heavy shading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system-configuration" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">System Configuration</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Panel Type</Label>
                    <Select
                      value={solarData.panelType}
                      onValueChange={(value) => setSolarData({ ...solarData, panelType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select panel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monocrystalline">Monocrystalline (High Efficiency)</SelectItem>
                        <SelectItem value="polycrystalline">Polycrystalline (Standard)</SelectItem>
                        <SelectItem value="thin-film">Thin Film (Budget)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Battery Backup System</Label>
                      <p className="text-sm text-muted-foreground">Store excess energy for later use</p>
                    </div>
                    <Switch
                      checked={solarData.batteryBackup}
                      onCheckedChange={(checked) => setSolarData({ ...solarData, batteryBackup: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Future Expansion Ready</Label>
                      <p className="text-sm text-muted-foreground">Plan for future energy needs</p>
                    </div>
                    <Switch
                      checked={solarData.futureNeeds}
                      onCheckedChange={(checked) => setSolarData({ ...solarData, futureNeeds: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial-options" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Financial Options</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Financing Option</Label>
                    <Select
                      value={solarData.financing}
                      onValueChange={(value) => setSolarData({ ...solarData, financing: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select financing" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash Purchase</SelectItem>
                        <SelectItem value="loan">Solar Loan</SelectItem>
                        <SelectItem value="lease">Solar Lease</SelectItem>
                        <SelectItem value="ppa">Power Purchase Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Federal Tax Credit (30%)</Label>
                      <p className="text-sm text-muted-foreground">Apply federal solar tax credit</p>
                    </div>
                    <Switch
                      checked={solarData.taxCredit}
                      onCheckedChange={(checked) => setSolarData({ ...solarData, taxCredit: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Local Incentives</Label>
                      <p className="text-sm text-muted-foreground">Include local rebates and incentives</p>
                    </div>
                    <Switch
                      checked={solarData.localIncentives}
                      onCheckedChange={(checked) => setSolarData({ ...solarData, localIncentives: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Solar Analysis Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">System Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>System Size:</span>
                        <span className="font-medium">{results.systemSize} kW</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Cost:</span>
                        <span className="font-medium">${results.systemCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Savings:</span>
                        <span className="font-medium text-green-600">${results.annualSavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payback Period:</span>
                        <span className="font-medium">{results.paybackPeriod} years</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Environmental Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>CO₂ Offset (Annual):</span>
                        <span className="font-medium text-green-600">{results.co2Offset} tons</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trees Equivalent:</span>
                        <span className="font-medium">{Math.round(results.co2Offset * 16)} trees</span>
                      </div>
                      <div className="flex justify-between">
                        <span>25-Year CO₂ Offset:</span>
                        <span className="font-medium">{results.co2Offset * 25} tons</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
              </div>
              <Button onClick={handleNext} disabled={currentStep === steps.length - 1}>
                {currentStep === steps.length - 1 ? "Complete" : "Next"}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dashboard Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Dashboard Analytics
          </CardTitle>
          <CardDescription>Multi-view performance dashboard with detailed metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">System Performance</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Energy Production</span>
                      <span className="text-sm font-medium">8,450 kWh</span>
                    </div>
                    <Progress value={84} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Efficiency</span>
                      <span className="text-sm font-medium">92.3%</span>
                    </div>
                    <Progress value={92.3} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium">99.7%</span>
                    </div>
                    <Progress value={99.7} className="h-2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Monthly Comparison</h4>
                  <div className="space-y-2">
                    {[
                      { month: "December", production: 7200, target: 8000 },
                      { month: "November", production: 6800, target: 7500 },
                      { month: "October", production: 8100, target: 8500 },
                      { month: "September", production: 9200, target: 9000 },
                    ].map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{data.month}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{data.production} kWh</span>
                          <Badge variant={data.production >= data.target ? "default" : "secondary"}>
                            {data.production >= data.target ? "Target Met" : "Below Target"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Monthly Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$12,450</div>
                    <p className="text-xs text-green-600">+15.2% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Annual Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$142,300</div>
                    <p className="text-xs text-green-600">+22.1% from last year</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Profit Margin</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">34.2%</div>
                    <p className="text-xs text-green-600">+2.1% improvement</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">23</div>
                      <p className="text-xs text-muted-foreground">In progress</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Completed This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-green-600">+33% from last month</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Pipeline Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$890K</div>
                      <p className="text-xs text-muted-foreground">Potential revenue</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Customer Satisfaction</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Rating</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-sm ml-1">4.8/5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Referral Rate</span>
                      <span className="text-sm font-medium">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Repeat Customers</span>
                      <span className="text-sm font-medium">34%</span>
                    </div>
                    <Progress value={34} className="h-2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Customer Growth</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">New Customers (Dec)</span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Active Customers</span>
                      <span className="font-medium">1,234</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Customer Retention</span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Upcoming Maintenance</h4>
                <div className="space-y-2">
                  {[
                    {
                      system: "Residential - 123 Oak St",
                      type: "Annual Inspection",
                      date: "Jan 15, 2025",
                      priority: "medium",
                    },
                    { system: "Commercial - ABC Corp", type: "Panel Cleaning", date: "Jan 18, 2025", priority: "low" },
                    {
                      system: "Residential - 456 Pine Ave",
                      type: "Inverter Check",
                      date: "Jan 22, 2025",
                      priority: "high",
                    },
                    {
                      system: "Industrial - XYZ Factory",
                      type: "System Upgrade",
                      date: "Feb 1, 2025",
                      priority: "high",
                    },
                  ].map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{task.system}</p>
                          <p className="text-xs text-muted-foreground">
                            {task.type} - {task.date}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {task.priority} priority
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings Management
          </CardTitle>
          <CardDescription>Comprehensive application settings with multiple categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Profile Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input id="first-name" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input id="last-name" placeholder="Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" placeholder="Solar Solutions Inc." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" placeholder="Tell us about yourself..." />
                  </div>
                </div>
                <Button>Save Profile</Button>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Display Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Use dark theme</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Compact View</Label>
                        <p className="text-sm text-muted-foreground">Show more content in less space</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Notification Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive promotional content</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Password & Authentication</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable 2FA</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Active Sessions</h4>
                  <div className="space-y-2">
                    {[
                      { device: "MacBook Pro", location: "San Francisco, CA", lastActive: "Current session" },
                      { device: "iPhone 15", location: "San Francisco, CA", lastActive: "2 hours ago" },
                      { device: "Chrome Browser", location: "New York, NY", lastActive: "1 day ago" },
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{session.device}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.location} • {session.lastActive}
                          </p>
                        </div>
                        {index !== 0 && (
                          <Button variant="outline" size="sm">
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Third-Party Integrations</h4>
                  <div className="space-y-4">
                    {[
                      { name: "Google Analytics", description: "Track website performance", connected: true },
                      { name: "Stripe", description: "Payment processing", connected: true },
                      { name: "Mailchimp", description: "Email marketing", connected: false },
                      { name: "Slack", description: "Team communication", connected: false },
                      { name: "Zapier", description: "Workflow automation", connected: true },
                    ].map((integration, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${integration.connected ? "bg-green-500" : "bg-gray-300"}`}
                          />
                          <div>
                            <p className="text-sm font-medium">{integration.name}</p>
                            <p className="text-xs text-muted-foreground">{integration.description}</p>
                          </div>
                        </div>
                        <Button variant={integration.connected ? "outline" : "default"} size="sm">
                          {integration.connected ? "Disconnect" : "Connect"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">API Access</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <div className="flex gap-2">
                        <Input id="api-key" value="sk_live_..." readOnly />
                        <Button variant="outline">Copy</Button>
                        <Button variant="outline">Regenerate</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>API Usage This Month</Label>
                      <div className="flex items-center justify-between text-sm">
                        <span>12,450 / 50,000 requests</span>
                        <span>24.9%</span>
                      </div>
                      <Progress value={24.9} className="h-2" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
