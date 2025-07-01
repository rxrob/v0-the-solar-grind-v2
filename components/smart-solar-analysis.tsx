"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calculator,
  Home,
  Zap,
  AlertTriangle,
  CheckCircle,
  Battery,
  Settings,
  Loader2,
  Flame,
  Snowflake,
  MapPin,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PDFDownloadButton } from "./pdf-download-button"

interface SmartSolarAnalysisProps {
  coordinates: string
  address: string
  peakSunHours?: number
  climateData?: any
  onAnalysisComplete?: () => void
}

interface SystemSizingResults {
  systemSizeKw: number
  panelCount: number
  panelWattage: number
  panelBrand: string
  inverterType: string
  inverterCount: number
  batteryInfo?: {
    model: string
    capacity: string
    count: number
  }
  annualProductionKwh: number
  monthlyProductionKwh: number[]
  offsetPercentage: number
  systemCost: number
  federalTaxCredit: number
  netCost: number
  paybackPeriod: number
  currentMonthlyBill: number
  monthlyBillWithSolar: number
  monthlySavings: number
  yearlyProjections: {
    year: number
    billWithoutSolar: number
    billWithSolar: number
    annualSavings: number
    cumulativeSavings: number
  }[]
  shadingLoss: number
  tiltAdjustment: number
  directionalLoss: number
  inverterEfficiency: number
  totalSystemEfficiency: number
  recommendations: string[]
  warnings: string[]
  nrelData?: any
}

function SmartSolarAnalysis({
  coordinates,
  address,
  peakSunHours = 5.5,
  climateData,
  onAnalysisComplete,
}: SmartSolarAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<SystemSizingResults | null>(null)
  const [nrelData, setNrelData] = useState<any>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [inputs, setInputs] = useState({
    // Home Info
    homeSquareFootage: "2500",
    homeAge: "10",
    roofAzimuth: "180", // South-facing
    roofTilt: "30",
    roofType: "shingle",
    roofCondition: "good",
    obstructions: [] as string[],

    // HVAC Info
    heatingType: "gas", // gas, electric, heat_pump, oil, propane
    coolingType: "electric", // electric, gas, none

    // Usage Info
    monthlyKwhUsage: "1200",
    monthlyElectricityBill: "144",

    // Billing
    utilityProvider: "Local Electric Company",
    ratePlan: "Standard",
    timeOfUseBilling: false,
    electricityRate: "0.12", // Auto-calculated

    // Preferences
    offsetGoal: "100",
    batteryStorage: false,

    // NREL System Parameters (auto-filled from system sizing)
    arrayType: "1", // Fixed Roof Mount
    losses: "14",
  })

  const [lat, lng] = coordinates.split(",").map((coord) => Number.parseFloat(coord.trim()))

  // Auto-calculate electricity rate when bill or usage changes
  useEffect(() => {
    const bill = Number.parseFloat(inputs.monthlyElectricityBill)
    const usage = Number.parseFloat(inputs.monthlyKwhUsage)

    if (bill > 0 && usage > 0) {
      const calculatedRate = (bill / usage).toFixed(4)
      setInputs((prev) => ({ ...prev, electricityRate: calculatedRate }))
    }
  }, [inputs.monthlyElectricityBill, inputs.monthlyKwhUsage])

  const handleInputChange = (field: string, value: any) => {
    setInputs((prev) => ({ ...prev, [field]: value }))
  }

  const handleObstructionChange = (obstruction: string, checked: boolean) => {
    setInputs((prev) => ({
      ...prev,
      obstructions: checked ? [...prev.obstructions, obstruction] : prev.obstructions.filter((o) => o !== obstruction),
    }))
  }

  const handleAnalysis = async () => {
    if (!coordinates) {
      alert("Please complete address selection first")
      return
    }

    setIsAnalyzing(true)
    try {
      const zipCode = address.match(/\b\d{5}\b/)?.[0] || "75001"

      console.log("🔧 Starting combined Smart Solar + NREL analysis...")

      // First, run the smart solar analysis to get system sizing
      const solarResponse = await fetch("/api/smart-solar-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Home Info
          zipCode,
          homeSquareFootage: inputs.homeSquareFootage,
          homeAge: inputs.homeAge,
          roofAzimuth: inputs.roofAzimuth,
          roofTilt: inputs.roofTilt,
          roofType: inputs.roofType,
          roofCondition: inputs.roofCondition,
          obstructions: inputs.obstructions,

          // HVAC Info
          heatingType: inputs.heatingType,
          coolingType: inputs.coolingType,

          // Usage Info
          monthlyKwhUsage: inputs.monthlyKwhUsage,
          monthlyElectricityBill: inputs.monthlyElectricityBill,

          // Billing
          utilityProvider: inputs.utilityProvider,
          ratePlan: inputs.ratePlan,
          timeOfUseBilling: inputs.timeOfUseBilling,
          electricityRate: inputs.electricityRate,

          // Preferences
          offsetGoal: inputs.offsetGoal,
          batteryStorage: inputs.batteryStorage,

          // Climate data
          climateData: climateData,

          // Location data
          peakSunHours,
          latitude: lat,
          longitude: lng,
        }),
      })

      const solarData = await solarResponse.json()

      if (!solarData.success) {
        throw new Error(solarData.error)
      }

      console.log("✅ Smart Solar Analysis completed")

      // Now run NREL PVWatts with the calculated system size
      console.log("🌞 Running NREL PVWatts with calculated system size...")

      const nrelResponse = await fetch("/api/nrel-pvwatts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          coordinates,
          systemSizeKw: solarData.results.systemSizeKw.toString(),
          tilt: inputs.roofTilt,
          azimuth: inputs.roofAzimuth,
          arrayType: inputs.arrayType,
          moduleType: "0", // Standard modules (Silfab 440W)
          losses: inputs.losses,
        }),
      })

      const nrelDataResult = await nrelResponse.json()

      if (nrelDataResult.success) {
        setNrelData(nrelDataResult)
        console.log("📊 NREL Analysis completed")
      } else {
        console.warn("⚠️ NREL Analysis failed, using smart solar data only")
      }

      // Combine results
      const combinedResults = {
        ...solarData.results,
        nrelData: nrelDataResult.success ? nrelDataResult : null,
        // Add coordinates for satellite image
        coordinates: { lat, lng },
        // Add elevation if available
        elevation: 500, // You can get this from your elevation API
      }

      setResults(combinedResults)
      onAnalysisComplete?.()
      console.log("✅ Combined Smart Solar + NREL Analysis completed")

      // Add 15-year projections with dramatic utility cost increases
      combinedResults.yearlyProjections = Array.from({ length: 15 }, (_, i) => {
        const year = i + 1
        const currentBill = solarData.results.currentMonthlyBill || 150
        const monthlySavings = solarData.results.monthlySavings || 100

        // Utility bills increase 3.5% annually (compounding)
        const billWithoutSolar = currentBill * 12 * Math.pow(1.035, i)

        // Solar savings also increase with utility rates
        const annualSavings = monthlySavings * 12 * Math.pow(1.035, i)

        // Solar bill stays relatively flat (small increases for maintenance)
        const billWithSolar = (currentBill - monthlySavings) * 12 * Math.pow(1.01, i)

        // Calculate cumulative savings
        const cumulativeSavings =
          Array.from({ length: year }, (_, j) => {
            return monthlySavings * 12 * Math.pow(1.035, j)
          }).reduce((sum, savings) => sum + savings, 0) - (solarData.results.netCost || 25000)

        return {
          year,
          billWithoutSolar: Math.round(billWithoutSolar),
          billWithSolar: Math.round(billWithSolar),
          annualSavings: Math.round(annualSavings),
          cumulativeSavings: Math.round(cumulativeSavings),
        }
      })

      setResults(combinedResults)
      onAnalysisComplete?.()
      console.log("✅ Combined Smart Solar + NREL Analysis completed")
    } catch (error) {
      console.error("❌ Analysis error:", error)
      alert("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number, decimals = 0) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-500" />
            Step 4: Smart Solar System Sizing with NREL PVWatts
          </CardTitle>
          <p className="text-sm text-gray-600">
            Configure your system with Silfab 440W panels, IQ8+ microinverters, and optional Tesla Powerwall 3. NREL
            PVWatts will validate production estimates using your calculated system size.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{address}</span>
            <span className="text-gray-400">
              ({lat.toFixed(4)}, {lng.toFixed(4)})
            </span>
          </div>

          {/* Home Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Home Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Square Footage</Label>
                    <Input
                      type="number"
                      value={inputs.homeSquareFootage}
                      onChange={(e) => handleInputChange("homeSquareFootage", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Home Age (years)</Label>
                    <Input
                      type="number"
                      value={inputs.homeAge}
                      onChange={(e) => handleInputChange("homeAge", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Roof Direction (Azimuth)</Label>
                    <Select
                      value={inputs.roofAzimuth}
                      onValueChange={(value) => handleInputChange("roofAzimuth", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">North (0°)</SelectItem>
                        <SelectItem value="90">East (90°)</SelectItem>
                        <SelectItem value="180">South (180°) - Optimal</SelectItem>
                        <SelectItem value="270">West (270°)</SelectItem>
                        <SelectItem value="135">Southeast (135°)</SelectItem>
                        <SelectItem value="225">Southwest (225°)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Roof Tilt (degrees)</Label>
                    <Input
                      type="number"
                      value={inputs.roofTilt}
                      onChange={(e) => handleInputChange("roofTilt", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Roof Type</Label>
                    <Select value={inputs.roofType} onValueChange={(value) => handleInputChange("roofType", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shingle">Asphalt Shingle</SelectItem>
                        <SelectItem value="tile">Tile</SelectItem>
                        <SelectItem value="metal">Metal</SelectItem>
                        <SelectItem value="flat">Flat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Roof Condition</Label>
                    <Select
                      value={inputs.roofCondition}
                      onValueChange={(value) => handleInputChange("roofCondition", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Obstructions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {["trees", "chimneys", "dormers", "nearby_buildings", "power_lines"].map((obstruction) => (
                      <div key={obstruction} className="flex items-center space-x-2">
                        <Checkbox
                          id={obstruction}
                          checked={inputs.obstructions.includes(obstruction)}
                          onCheckedChange={(checked) => handleObstructionChange(obstruction, checked as boolean)}
                        />
                        <Label htmlFor={obstruction} className="text-sm capitalize">
                          {obstruction.replace("_", " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage & Billing */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Usage & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* HVAC System */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      Heating Type
                    </Label>
                    <Select
                      value={inputs.heatingType}
                      onValueChange={(value) => handleInputChange("heatingType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gas">Natural Gas</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                        <SelectItem value="heat_pump">Heat Pump</SelectItem>
                        <SelectItem value="oil">Oil</SelectItem>
                        <SelectItem value="propane">Propane</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Snowflake className="h-4 w-4 text-blue-500" />
                      Cooling Type
                    </Label>
                    <Select
                      value={inputs.coolingType}
                      onValueChange={(value) => handleInputChange("coolingType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electric">Electric AC</SelectItem>
                        <SelectItem value="gas">Gas AC</SelectItem>
                        <SelectItem value="heat_pump">Heat Pump</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Monthly kWh Usage</Label>
                    <Input
                      type="number"
                      value={inputs.monthlyKwhUsage}
                      onChange={(e) => handleInputChange("monthlyKwhUsage", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Monthly Bill ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={inputs.monthlyElectricityBill}
                      onChange={(e) => handleInputChange("monthlyElectricityBill", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Utility Provider</Label>
                  <Input
                    value={inputs.utilityProvider}
                    onChange={(e) => handleInputChange("utilityProvider", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Electricity Rate ($/kWh)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.0001"
                        value={inputs.electricityRate}
                        onChange={(e) => handleInputChange("electricityRate", e.target.value)}
                        className="pr-20"
                      />
                      <Badge className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-100 text-green-800 text-xs">
                        Auto-calc
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated from bill ÷ usage</p>
                  </div>
                  <div>
                    <Label>Offset Goal (%)</Label>
                    <Select value={inputs.offsetGoal} onValueChange={(value) => handleInputChange("offsetGoal", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">60% - Partial</SelectItem>
                        <SelectItem value="80">80% - Most Usage</SelectItem>
                        <SelectItem value="100">100% - Full Offset</SelectItem>
                        <SelectItem value="120">120% - Overproduction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="batteryStorage"
                    checked={inputs.batteryStorage}
                    onCheckedChange={(checked) => handleInputChange("batteryStorage", checked)}
                  />
                  <Label htmlFor="batteryStorage" className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    Add Tesla Powerwall 3
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="timeOfUseBilling"
                    checked={inputs.timeOfUseBilling}
                    onCheckedChange={(checked) => handleInputChange("timeOfUseBilling", checked)}
                  />
                  <Label htmlFor="timeOfUseBilling">Time-of-Use Billing</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* HVAC Impact Info */}
          <Card className="bg-gradient-to-r from-orange-100 to-blue-100 border-2 border-orange-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-gray-950">
                <Flame className="h-4 w-4 text-orange-600" />
                <Snowflake className="h-4 w-4 text-blue-600" />
                HVAC System Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-950">Your Current Setup:</h4>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-950 font-medium">
                      Heating:{" "}
                      {inputs.heatingType === "gas"
                        ? "Natural Gas"
                        : inputs.heatingType === "electric"
                          ? "Electric"
                          : inputs.heatingType === "heat_pump"
                            ? "Heat Pump"
                            : inputs.heatingType === "oil"
                              ? "Oil"
                              : inputs.heatingType === "propane"
                                ? "Propane"
                                : "None"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-950 font-medium">
                      Cooling:{" "}
                      {inputs.coolingType === "electric"
                        ? "Electric AC"
                        : inputs.coolingType === "gas"
                          ? "Gas AC"
                          : inputs.coolingType === "heat_pump"
                            ? "Heat Pump"
                            : "None"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-950">Solar Impact:</h4>
                  <div className="text-sm">
                    {inputs.heatingType === "electric" || inputs.coolingType === "electric" ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">High solar benefit - electric HVAC can be offset</span>
                      </div>
                    ) : inputs.heatingType === "heat_pump" || inputs.coolingType === "heat_pump" ? (
                      <div className="flex items-center gap-2 text-blue-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Excellent solar benefit - heat pump is very efficient</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Moderate solar benefit - gas heating not offset by solar</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NREL Configuration */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                NREL PVWatts Configuration
              </CardTitle>
              <p className="text-sm text-gray-800">
                System size and panel type will be auto-calculated. Adjust technical parameters if needed.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Array Type</Label>
                  <Select value={inputs.arrayType} onValueChange={(value) => handleInputChange("arrayType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Fixed Open Rack</SelectItem>
                      <SelectItem value="1">Fixed Roof Mount</SelectItem>
                      <SelectItem value="2">1-Axis Tracking</SelectItem>
                      <SelectItem value="4">2-Axis Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>System Losses (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={inputs.losses}
                    onChange={(e) => handleInputChange("losses", e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-900">
                    <p className="font-medium">Auto-calculated:</p>
                    <p>• System Size from usage</p>
                    <p>• Silfab 440W panels only</p>
                    <p>• Tilt & Azimuth from roof</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Specifications */}
          <Card className="bg-gradient-to-r from-blue-50 to-green-50">
            <CardHeader>
              <CardTitle className="text-lg">Your Solar Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">Silfab SIL-440 BK</div>
                  <p className="text-sm text-gray-600">Solar Panels</p>
                  <p className="text-xs text-gray-600">440W • 21.2% Efficiency</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">Enphase IQ8+ MC</div>
                  <p className="text-sm text-gray-600">Microinverters</p>
                  <p className="text-xs text-gray-600">97.5% Efficiency • Panel-Level Monitoring</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">Tesla Powerwall 3</div>
                  <p className="text-sm text-gray-600">Battery Storage (Optional)</p>
                  <p className="text-xs text-gray-600">13.5 kWh Usable • Backup Power</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleAnalysis}
            disabled={isAnalyzing || !coordinates}
            className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Smart Solar + NREL Analysis...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Calculate My Solar System with NREL Validation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* System Overview */}
          <Card className="bg-gray-900 border-2 border-green-400 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Your Custom Solar System
                {results.nrelData && <Badge className="bg-orange-500 text-white ml-2">NREL Validated</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-white">{results.systemSizeKw} kW</div>
                  <p className="text-sm font-medium text-gray-200">System Size</p>
                  <p className="text-xs text-gray-400">{results.panelCount} × Silfab 440W panels</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-white">{formatNumber(results.annualProductionKwh)} kWh</div>
                  <p className="text-sm font-medium text-gray-200">Annual Production</p>
                  <p className="text-xs text-gray-400">{results.offsetPercentage}% offset</p>
                  {results.nrelData && (
                    <p className="text-xs text-orange-400 mt-1">
                      NREL: {formatNumber(results.nrelData.production.annual)} kWh
                    </p>
                  )}
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-white">{formatCurrency(results.netCost)}</div>
                  <p className="text-sm font-medium text-gray-200">Net Investment</p>
                  <p className="text-xs text-gray-400">After {formatCurrency(results.federalTaxCredit)} tax credit</p>
                </div>
                <div className="text-center p-4 bg-gray-800 rounded-lg">
                  <div className="text-3xl font-bold text-white">{results.paybackPeriod} years</div>
                  <p className="text-sm font-medium text-gray-200">Payback Period</p>
                  <p className="text-xs text-gray-400">Return on investment</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Info Collection for PDF */}
          <Card className="bg-gradient-to-r from-amber-50 to-blue-50 border-2 border-amber-200 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  📄 Generate Your Professional Solar Report
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Download a comprehensive PDF report with all analysis details, financial projections, NREL validation,
                  satellite imagery, and expert recommendations.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="customerName">Full Name (for report)</Label>
                    <Input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className="bg-white text-gray-900 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number (for report)</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="bg-white text-gray-900 border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
                  <span className="bg-white px-2 py-1 rounded">✅ System Specifications</span>
                  <span className="bg-white px-2 py-1 rounded">💰 15-Year Projections</span>
                  <span className="bg-white px-2 py-1 rounded">🌞 NREL Validation</span>
                  <span className="bg-white px-2 py-1 rounded">🏠 HVAC Analysis</span>
                  <span className="bg-white px-2 py-1 rounded">🛰️ Satellite Image</span>
                  <span className="bg-white px-2 py-1 rounded">📊 Interactive Charts</span>
                </div>

                <PDFDownloadButton
                  results={{
                    ...results,
                    // Add HVAC impact data
                    hvacImpact: {
                      heatingType: inputs.heatingType,
                      coolingType: inputs.coolingType,
                      benefitMultiplier:
                        inputs.heatingType === "electric" || inputs.coolingType === "electric" ? 1.1 : 1.0,
                      additionalSavings: results.monthlySavings * 12 * 0.1,
                    },
                    // Add climate data if available
                    climateData: climateData,
                    // Add coordinates for satellite image
                    coordinates: { lat, lng },
                  }}
                  address={address}
                  customerInfo={{
                    name: customerName || "Solar Customer",
                    phone: customerPhone || "",
                  }}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default SmartSolarAnalysis
