"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import Image from "next/image"
import { LoadScript, Autocomplete } from "@react-google-maps/api"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  UploadCloud,
  ArrowRight,
  ArrowLeft,
  Info,
  Home,
  User,
  Bolt,
  FileText,
  Sun,
  BookOpen,
  MapPin,
  Compass,
  DollarSign,
  Calculator,
  Shield,
  Zap,
  Award,
  AlertTriangle,
} from "lucide-react"
import { useProCalculatorStore } from "@/lib/store"
import type { google } from "google-maps"

const libraries: "places"[] = ["places"]
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const chartConfig = {
  Usage: {
    label: "Usage",
    color: "#ef4444",
  },
  Production: {
    label: "Production",
    color: "#f59e0b",
  },
} satisfies ChartConfig

// Financial constants
const PANEL_WATTAGE = 440 // Silfab 440W panels
const PRICE_PER_WATT_CASH = 3.55
const LOAN_APR = 0.0799
const LOAN_TERM_MONTHS = 300

const HeatmapPanelOverlay = ({ layout }: { layout: any }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect
        setContainerSize({ width, height })
      }
    })
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => {
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  const getHeatmapColor = (energy: number, min: number, max: number) => {
    if (min === max) return `hsla(30, 100%, 50%, 0.7)` // Orange if all panels are the same
    const percent = (energy - min) / (max - min)
    // Hue from yellow (60) to red (0)
    const hue = 60 - percent * 60
    return `hsla(${hue}, 100%, 50%, 0.65)`
  }

  if (!layout.panels || layout.panels.length === 0 || containerSize.width === 0) return null

  const maxAbsX = Math.max(...layout.panels.map((p: any) => Math.abs(p.centerX)))
  const maxAbsY = Math.max(...layout.panels.map((p: any) => Math.abs(p.centerY)))

  const viewWidthMeters = maxAbsX * 2.2
  const viewHeightMeters = maxAbsY * 2.2

  const scale = Math.min(containerSize.width / viewWidthMeters, containerSize.height / viewHeightMeters)

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {layout.panels.map((panel: any, i: number) => {
        const panelWidth =
          (panel.orientation === "PORTRAIT"
            ? layout.panelSpecs.panelWidthMeters
            : layout.panelSpecs.panelHeightMeters) * scale
        const panelHeight =
          (panel.orientation === "PORTRAIT"
            ? layout.panelSpecs.panelHeightMeters
            : layout.panelSpecs.panelWidthMeters) * scale

        const left = containerSize.width / 2 + panel.centerX * scale - panelWidth / 2
        const top = containerSize.height / 2 - panel.centerY * scale - panelHeight / 2

        const color = getHeatmapColor(panel.yearlyEnergy, layout.energyRange.min, layout.energyRange.max)

        return (
          <div
            key={i}
            className="absolute border border-black/30 rounded-sm"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${panelWidth}px`,
              height: `${panelHeight}px`,
              backgroundColor: color,
              transform: "translateZ(0)",
            }}
          />
        )
      })}
    </div>
  )
}

export default function ProCalculatorClient({ googleMapsApiKey }: { googleMapsApiKey: string }) {
  const { propertyData, energyData, roofData, systemData, setPropertyData, setEnergyData, setRoofData, setSystemData } =
    useProCalculatorStore()

  const [currentStep, setCurrentStep] = useState(1)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageData, setImageData] = useState<{ streetView: string; aerialView: string } | null>(null)
  const pdfRef = useRef<HTMLDivElement>(null)

  const [address, setAddress] = useState(propertyData.address || "")
  const [houseSqft, setHouseSqft] = useState(energyData.houseSqft?.toString() || "")
  const [numAdults, setNumAdults] = useState(energyData.numAdults?.toString() || "")
  const [hasPool, setHasPool] = useState(energyData.hasPool || false)
  const [hasEV, setHasEV] = useState(energyData.hasEV || false)
  const [heatingType, setHeatingType] = useState(energyData.heatingType || "electric")
  const [kwhEstimate, setKwhEstimate] = useState(energyData.monthlyUsage?.toString() || "")
  const [billFile, setBillFile] = useState<File | null>(null)

  const [solarLayout, setSolarLayout] = useState<any | null>(null)
  const [layoutLoading, setLayoutLoading] = useState(false)
  const [layoutError, setLayoutError] = useState<string | null>(null)

  const onLoad = (ac: google.maps.places.Autocomplete) => setAutocomplete(ac)

  const onPlaceChanged = async () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace()
      if (!place.geometry || !place.geometry.location) {
        setError("Please select a valid address from the dropdown.")
        return
      }
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const formattedAddress = place.formatted_address || ""
      setAddress(formattedAddress)
      setError(null)
      setLoading(true)
      setImageData(null)
      try {
        const response = await fetch(`/api/property-images?lat=${lat}&lng=${lng}`)
        if (!response.ok) throw new Error("Failed to fetch property images")
        const data = await response.json()
        setImageData(data)
        setPropertyData({ address: formattedAddress, coordinates: { lat, lng } })
      } catch (err) {
        setError("Could not analyze property. Please check the address and try again.")
      } finally {
        setLoading(false)
      }
    }
  }

  const handleStep1Next = () => {
    setEnergyData({
      houseSqft: Number.parseInt(houseSqft) || undefined,
      numAdults: Number.parseInt(numAdults) || undefined,
      hasPool,
      hasEV,
      heatingType: heatingType as "electric" | "gas" | "other",
      monthlyUsage: kwhEstimate ? Number.parseInt(kwhEstimate) : undefined,
    })
    setCurrentStep(2)
  }

  useEffect(() => {
    if (currentStep === 2) {
      let baseUsage = (Number.parseInt(houseSqft) || 2000) * 0.6 + (Number.parseInt(numAdults) || 2) * 50
      if (hasPool) baseUsage += 150
      if (hasEV) baseUsage += 200
      const estimatedMonthlyUsage = kwhEstimate ? Number.parseInt(kwhEstimate) : baseUsage
      setEnergyData({ estimatedAnnualUsage: Math.round(estimatedMonthlyUsage * 12) })

      const fetchSunHours = async () => {
        if (propertyData.coordinates) {
          try {
            const { lat, lng } = propertyData.coordinates
            const response = await fetch(`/api/nrel-sunhours`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ lat, lon: lng }),
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error("Sun hours API response not OK:", response.status, errorText)
              throw new Error("Failed to fetch sun hours")
            }

            const data = await response.json()
            setPropertyData({ sunHours: data.sunHours })
          } catch (e) {
            console.error("Failed to fetch sun hours", e)
            setPropertyData({ sunHours: 4.5 })
          }
        }
      }
      fetchSunHours()
      setRoofData({ roofOrientation: "South-facing, average pitch" })
    }
  }, [
    currentStep,
    houseSqft,
    numAdults,
    hasPool,
    hasEV,
    kwhEstimate,
    propertyData.coordinates,
    setEnergyData,
    setPropertyData,
    setRoofData,
  ])

  useEffect(() => {
    if (currentStep === 3 && propertyData.coordinates && !solarLayout) {
      const fetchSolarLayout = async () => {
        setLayoutLoading(true)
        setLayoutError(null)
        try {
          const response = await fetch("/api/get-solar-data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: propertyData.coordinates?.lat,
              lng: propertyData.coordinates?.lng,
              targetAnnualKwh: energyData.estimatedAnnualUsage,
            }),
          })

          if (!response.ok) {
            const errData = await response.json()
            throw new Error(errData.error || "Failed to fetch solar layout data.")
          }

          const data = await response.json()
          setSolarLayout(data)

          const targetAnnualUsageKwh = energyData.estimatedAnnualUsage || 14000
          const offsetPercentage =
            targetAnnualUsageKwh > 0 ? (data.annualProductionKwh / targetAnnualUsageKwh) * 100 : 0
          const costPerWatt = systemData.costPerWatt || 3.5
          const totalCost = data.systemSizeKw * 1000 * costPerWatt

          const monthlyFactors = [0.7, 0.8, 1.0, 1.1, 1.2, 1.2, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7]
          const monthlyProduction = monthlyFactors.map((factor) => (data.annualProductionKwh / 12) * factor)

          setSystemData({
            panelCount: data.panelCount,
            systemSizeKw: data.systemSizeKw,
            annualProductionKwh: data.annualProductionKwh,
            offsetPercentage: offsetPercentage,
            totalCost: totalCost,
            monthlyProduction,
          })
        } catch (err: any) {
          setLayoutError(err.message)
          console.error(err)
        } finally {
          setLayoutLoading(false)
        }
      }

      fetchSolarLayout()
    }
  }, [
    currentStep,
    propertyData.coordinates,
    solarLayout,
    setSystemData,
    energyData.estimatedAnnualUsage,
    systemData.costPerWatt,
  ])

  // Financial calculations for Step 4 with proper error handling
  const financialData = useMemo(() => {
    if (!systemData.systemSizeKw || systemData.systemSizeKw <= 0) return null

    try {
      const systemSizeKw = systemData.systemSizeKw
      const cashPrice = systemSizeKw * 1000 * PRICE_PER_WATT_CASH

      // Loan calculation using amortization formula
      const monthlyRate = LOAN_APR / 12
      const numerator = cashPrice * monthlyRate * Math.pow(1 + monthlyRate, LOAN_TERM_MONTHS)
      const denominator = Math.pow(1 + monthlyRate, LOAN_TERM_MONTHS) - 1
      const monthlyPayment = numerator / denominator

      // Estimated annual savings (simplified)
      const annualProduction = systemData.annualProductionKwh || 0
      const electricityRate = 0.12 // $0.12/kWh average
      const annualSavings = annualProduction * electricityRate

      return {
        cashPrice: Math.round(cashPrice),
        monthlyPayment: Math.round(monthlyPayment),
        annualSavings: Math.round(annualSavings),
        paybackPeriod: annualSavings > 0 ? cashPrice / annualSavings : 0,
      }
    } catch (error) {
      console.error("Error calculating financial data:", error)
      return null
    }
  }, [systemData.systemSizeKw, systemData.annualProductionKwh])

  const handleDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default
    if (pdfRef.current) {
      const opt = {
        margin: 0.5,
        filename: "solar-proposal-summary.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      }
      html2pdf().set(opt).from(pdfRef.current).save()
    }
  }

  const chartData = useMemo(() => {
    if (!systemData.monthlyProduction || !Array.isArray(systemData.monthlyProduction)) return []
    const monthlyUsage = (energyData.estimatedAnnualUsage || 1200 * 12) / 12
    return MONTH_NAMES.map((month, i) => ({
      name: month,
      Usage: Math.round(monthlyUsage),
      Production: Math.round(systemData.monthlyProduction?.[i] || 0),
    }))
  }, [systemData.monthlyProduction, energyData.estimatedAnnualUsage])

  const renderStep1 = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Property & Energy Profile</CardTitle>
          <CardDescription>Enter your address to get started, then tell us about your energy usage.</CardDescription>
        </CardHeader>
        <CardContent>
          {typeof window !== "undefined" && googleMapsApiKey && (
            <LoadScript googleMapsApiKey={googleMapsApiKey} libraries={libraries}>
              <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                <Input type="text" placeholder="Enter your home address" className="w-full" defaultValue={address} />
              </Autocomplete>
            </LoadScript>
          )}
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </CardContent>
      </Card>
      {loading && (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <p className="ml-4">Analyzing Property...</p>
        </div>
      )}
      {imageData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Property Preview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Street View</Label>
                <Image
                  src={imageData.streetView || "/placeholder.svg?height=400&width=600"}
                  alt="Street View"
                  width={600}
                  height={400}
                  className="rounded-md object-cover aspect-[4/3] bg-slate-700"
                />
              </div>
              <div>
                <Label>Aerial View</Label>
                <Image
                  src={imageData.aerialView || "/placeholder.svg?height=400&width=600"}
                  alt="Aerial View"
                  width={600}
                  height={400}
                  className="rounded-md object-cover aspect-[4/3] bg-slate-700"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Lifestyle & Usage</CardTitle>
              <CardDescription>
                This helps us estimate your electricity needs. You can also upload a bill for a more accurate analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sqft">Home Square Footage</Label>
                  <Input
                    id="sqft"
                    type="number"
                    value={houseSqft}
                    onChange={(e) => setHouseSqft(e.target.value)}
                    placeholder="e.g., 2200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adults">Number of Adults</Label>
                  <Input
                    id="adults"
                    type="number"
                    value={numAdults}
                    onChange={(e) => setNumAdults(e.target.value)}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox id="pool" checked={hasPool} onCheckedChange={(c) => setHasPool(Boolean(c))} />
                  <Label htmlFor="pool">Do you have a pool?</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="ev" checked={hasEV} onCheckedChange={(c) => setHasEV(Boolean(c))} />
                  <Label htmlFor="ev">Do you own an Electric Vehicle (EV)?</Label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Heating System</Label>
                  <Select value={heatingType} onValueChange={(v) => setHeatingType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select heating type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="gas">Gas</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kwh">Average Monthly kWh (Optional)</Label>
                  <Input
                    id="kwh"
                    type="number"
                    value={kwhEstimate}
                    onChange={(e) => setKwhEstimate(e.target.value)}
                    placeholder="e.g., 1300"
                  />
                </div>
              </div>
              <div>
                <Label>Upload Electric Bill (Optional)</Label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-500 px-6 py-10">
                  <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-amber-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-amber-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-800 hover:text-amber-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                          accept=".pdf,.png,.jpg,.jpeg"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-400">
                      {billFile ? billFile.name : "PDF, PNG, JPG up to 10MB"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleStep1Next} className="ml-auto">
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </>
  )

  const renderStep2 = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Your Solar Potential</CardTitle>
          <CardDescription>
            Here's a summary of our analysis and why solar could be a great fit for your home.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home /> Your Home at a Glance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span>{propertyData.address || "Address not set"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-slate-400" />
                  <span>{roofData.roofOrientation || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-slate-400" />
                  <span>{propertyData.sunHours?.toFixed(2) || "4.5"} avg. sun hours/day</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User /> Your Lifestyle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  Based on your answers, your estimated usage is{" "}
                  <span className="font-bold text-amber-400">
                    {energyData.estimatedAnnualUsage?.toLocaleString() || "14,400"} kWh/year
                  </span>
                  .
                </p>
                <ul className="list-disc list-inside text-slate-300">
                  <li>{numAdults || "2"} adults in home</li>
                  <li>Pool: {hasPool ? "Yes" : "No"}</li>
                  <li>EV: {hasEV ? "Yes" : "No"}</li>
                  {billFile && (
                    <li className="flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Bill uploaded: {billFile.name}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bolt /> Why Solar Makes Sense Here
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Your area has excellent solar potential. With an average of{" "}
                <span className="font-bold text-amber-400">
                  {propertyData.sunHours?.toFixed(2) || "4.5"} sun hours per day
                </span>
                , you can generate significant power. This allows you to{" "}
                <span className="font-semibold text-white">offset</span> a large portion of your electricity bill, which
                is the percentage of your energy usage that your solar panels produce.
              </p>
              <p>
                By generating your own power, you can lock in your energy rate and shield yourself from future utility
                price hikes and grid volatility.
              </p>
              <p className="text-sm p-4 bg-slate-900/70 rounded-lg">
                Your home uses approximately{" "}
                <span className="font-bold text-amber-400">
                  {energyData.estimatedAnnualUsage?.toLocaleString() || "14,400"} kWh/year
                </span>
                . A solar system can be designed to eliminate nearly all of that, saving you money for decades to come.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen /> Solar FAQs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is Net Metering?</AccordionTrigger>
                  <AccordionContent>
                    Net metering is a billing mechanism that credits solar energy system owners for the electricity they
                    add to the grid. When your panels produce more electricity than you need, the excess power is sent
                    to the utility grid, and you get credits on your bill.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>What happens if I sell my home?</AccordionTrigger>
                  <AccordionContent>
                    Studies have shown that homes with solar energy systems sell for more than homes without them. A
                    solar system can increase your property value and make your home more attractive to potential buyers
                    who are interested in lower energy bills.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How does solar increase property value?</AccordionTrigger>
                  <AccordionContent>
                    A solar panel system is considered an upgrade, much like a renovated kitchen. Buyers understand that
                    they will save money on electricity bills over the long term, and this future value is reflected in
                    the sale price of the home.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={() => setCurrentStep(3)}>
            Next: System Design <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </>
  )

  const renderStep3 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Step 3: System Design & Production</CardTitle>
        <CardDescription>
          We've analyzed your rooftop using high-resolution imagery and solar data to create an optimal panel layout.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative">
          <Label>Aerial View with Dynamic Panel Layout</Label>
          <div className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-md bg-slate-700">
            <Image
              src={imageData?.aerialView || "/placeholder.svg?height=600&width=800"}
              alt="Aerial View"
              fill
              className="object-cover"
            />
            {layoutLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-slate-800/70">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                <p className="mt-4 text-white">Fetching Rooftop Solar Data...</p>
                <p className="mt-1 text-sm text-slate-300">This may take a moment.</p>
              </div>
            )}
            {layoutError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-md bg-red-900/80 p-4 text-center">
                <AlertTriangle className="h-8 w-8 text-red-300" />
                <p className="mt-4 font-semibold text-white">Could Not Analyze Roof</p>
                <p className="mt-2 text-sm text-red-200">{layoutError}</p>
              </div>
            )}
            {solarLayout && <HeatmapPanelOverlay layout={solarLayout} />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center lg:grid-cols-4">
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="text-sm text-slate-400">System Size</p>
            <p className="text-2xl font-bold">{systemData.systemSizeKw?.toFixed(2) || "0.00"} kW</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Panel Count</p>
            <p className="text-2xl font-bold">{systemData.panelCount || 0}</p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="text-sm text-slate-400">Annual Production</p>
            <p className="text-2xl font-bold">
              {systemData.annualProductionKwh?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "0"} kWh
            </p>
          </div>
          <div className="rounded-lg bg-slate-800 p-4">
            <div className="flex items-center justify-center gap-1">
              <p className="text-sm text-slate-400">Est. Offset</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The percentage of your electric bill solar can eliminate.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-2xl font-bold">{Math.min(100, systemData.offsetPercentage || 0).toFixed(0)}%</p>
          </div>
        </div>
        <div>
          <Label>Production vs. Usage</Label>
          <div className="mt-2 h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value} kWh`}
                />
                <ChartTooltip cursor={{ fill: "rgba(148, 163, 184, 0.1)" }} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="Usage" fill="var(--color-Usage)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Production" fill="var(--color-Production)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={() => setCurrentStep(4)} disabled={layoutLoading || !!layoutError}>
          Next: Financials <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )

  const renderStep4 = () => (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Step 4: Final System Design & Financing</CardTitle>
          <CardDescription>
            Complete system specifications and financing options for your solar installation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400">System Size</p>
              <p className="text-2xl font-bold">{systemData.systemSizeKw?.toFixed(2) || "0.00"} kW</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Silfab 440W Panels</p>
              <p className="text-2xl font-bold">{systemData.panelCount || 0}</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400">IQ8MC Inverters</p>
              <p className="text-2xl font-bold">{systemData.panelCount || 0}</p>
              <p className="text-xs text-slate-400">1 per panel</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-lg">
              <p className="text-sm text-slate-400">Annual Production</p>
              <p className="text-2xl font-bold">
                {systemData.annualProductionKwh?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "0"} kWh
              </p>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-green-900/20 border-green-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cash Purchase
                </CardTitle>
                <CardDescription>Complete solar system installation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-400">
                  ${financialData?.cashPrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "0"}
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Total system cost including inspection, engineering and design, city permits, HOA application, utility
                  permit, and labor
                </p>

                {/* Cost Breakdown */}
                {financialData && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Equipment & Materials:</span>
                      <span>
                        $
                        {Math.round(financialData.cashPrice * 0.65).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Installation & Labor:</span>
                      <span>
                        $
                        {Math.round(financialData.cashPrice * 0.2).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Permits & Inspections:</span>
                      <span>
                        $
                        {Math.round(financialData.cashPrice * 0.08).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Engineering & Design:</span>
                      <span>
                        $
                        {Math.round(financialData.cashPrice * 0.07).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                      <span>Year 1 Savings:</span>
                      <span className="text-green-400">
                        ${financialData.annualSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Solar Loan
                </CardTitle>
                <CardDescription>7.99% APR • 25 years • No prepayment penalty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-400">
                  ${financialData?.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "0"}/mo
                </div>
                <p className="text-sm text-slate-400 mt-2">
                  Total system cost including all permits, engineering, and installation
                </p>
                {financialData && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Loan Payment:</span>
                      <span>
                        ${financialData.monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Monthly Savings:</span>
                      <span className="text-blue-400">
                        $
                        {Math.round(financialData.annualSavings / 12).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                    <div className="border-t border-slate-600 pt-2 flex justify-between font-semibold">
                      <span>Day 1 Net Benefit:</span>
                      <span className="text-blue-400">
                        $
                        {Math.round(financialData.annualSavings / 12 - financialData.monthlyPayment).toLocaleString(
                          undefined,
                          { maximumFractionDigits: 0 },
                        )}
                        /mo
                      </span>
                    </div>
                  </div>
                )}
                <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-amber-400 font-medium">💡 Pro Tip</p>
                  <p className="text-xs text-slate-300 mt-1">
                    Most homeowners pay off their solar loan in under 10 years with no prepayment penalty, using their
                    energy savings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Educational Content */}
          <Card className="bg-slate-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                System Components & Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="panels">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Silfab 440W Solar Panels
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Tier 1</Badge>
                      <Badge variant="secondary">25-Year Warranty</Badge>
                    </div>
                    <p>
                      Silfab panels are manufactured in North America using high-quality materials and advanced
                      technology. These Tier 1 panels offer excellent performance, durability, and come with a
                      comprehensive 25-year product and performance warranty.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="inverters">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Enphase IQ8MC Microinverters
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Grid-Forming</Badge>
                      <Badge variant="secondary">25-Year Warranty</Badge>
                    </div>
                    <p>
                      Each panel gets its own microinverter, maximizing energy harvest and system reliability. If one
                      panel is shaded or has an issue, the rest continue working at full capacity. The IQ8MC series
                      offers advanced grid-forming capabilities for enhanced safety and performance.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="grid">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Grid Integration & Net Metering
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Your solar system connects seamlessly to the local utility grid. During the day, excess power is
                      sent to the grid, earning you credits. At night or during cloudy periods, you draw power from the
                      grid using those credits. This arrangement, called net metering, ensures you always have power
                      while maximizing your solar investment.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="warranty">
                  <AccordionTrigger className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    25-Year Comprehensive Warranty
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Your entire solar system is backed by industry-leading warranties: 25 years on panels, 25 years on
                      microinverters, and comprehensive workmanship coverage. This bumper-to-bumper protection ensures
                      your investment is secure for decades to come.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentStep(3)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <Button onClick={() => setCurrentStep(5)} className="bg-green-600 hover:bg-green-700">
            Review Final Proposal <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </>
  )

  const renderStep5 = () => (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Step 5: Final Proposal Summary</CardTitle>
          <CardDescription>
            This is a personalized system built for your property based on the information you provided and our in-house
            calculations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white text-black p-8 rounded shadow-lg" ref={pdfRef}>
            {/* Header */}
            <div className="border-b-4 border-blue-600 pb-6 mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-blue-600 mb-2">Solar Proposal</h1>
                  <p className="text-lg text-gray-600">Personalized System Design</p>
                </div>
                <div className="text-right">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                    <div className="text-sm">Proposal Date</div>
                    <div className="font-bold">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Images */}
            {imageData && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">Your Property</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-700">Street View</h3>
                    <img
                      src={imageData.streetView || "/placeholder.svg"}
                      alt="Street View"
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                      crossOrigin="anonymous"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-700">Aerial View with Solar Layout</h3>
                    <div className="relative w-full h-48 bg-slate-200 rounded-lg border-2 border-gray-200">
                      <Image
                        src={imageData.aerialView || "/placeholder.svg"}
                        alt="Aerial View"
                        className="object-cover rounded-lg"
                        fill
                        crossOrigin="anonymous"
                      />
                      {solarLayout && (
                        <div className="absolute inset-0">
                          <HeatmapPanelOverlay layout={solarLayout} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Property Address:</strong> {propertyData.address || "Not specified"}
                  </p>
                </div>
              </div>
            )}

            {/* System Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">System Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {systemData.systemSizeKw?.toFixed(2) || "0.00"}
                  </div>
                  <div className="text-sm text-gray-600">System Size (kW)</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{systemData.panelCount || 0}</div>
                  <div className="text-sm text-gray-600">Solar Panels</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-600">
                    {systemData.annualProductionKwh?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || "0"}
                  </div>
                  <div className="text-sm text-gray-600">Annual kWh</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.min(100, systemData.offsetPercentage || 0).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Energy Offset</div>
                </div>
              </div>
            </div>

            {/* System Details */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">
                System Specifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Solar Panels:</span>
                    <span className="text-gray-900">{systemData.panelCount || 0} × Silfab 440W</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Inverters:</span>
                    <span className="text-gray-900">Enphase IQ8MC Microinverters</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Roof Orientation:</span>
                    <span className="text-gray-900">{roofData.roofOrientation || "South-facing"}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Shading Level:</span>
                    <span className="text-gray-900 capitalize">Varies by panel</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Sun Hours/Day:</span>
                    <span className="text-gray-900">{propertyData.sunHours?.toFixed(2) || "4.5"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">Annual Usage:</span>
                    <span className="text-gray-900">
                      {energyData.estimatedAnnualUsage?.toLocaleString() || "14,400"} kWh
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">
                Investment & Savings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-lg font-bold text-green-700 mb-4">Cash Purchase</h3>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${financialData?.cashPrice.toLocaleString() || "0"}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Equipment & Materials:</span>
                      <span>${Math.round((financialData?.cashPrice || 0) * 0.65).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Installation & Labor:</span>
                      <span>${Math.round((financialData?.cashPrice || 0) * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Permits & Engineering:</span>
                      <span>${Math.round((financialData?.cashPrice || 0) * 0.15).toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Annual Savings:</span>
                      <span className="text-green-600">${financialData?.annualSavings.toLocaleString() || "0"}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-700 mb-4">Solar Loan (7.99% APR)</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${financialData?.monthlyPayment.toLocaleString() || "0"}/mo
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Loan Term:</span>
                      <span>25 years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Savings:</span>
                      <span>${Math.round((financialData?.annualSavings || 0) / 12).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prepayment Penalty:</span>
                      <span>None</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Net Monthly Benefit:</span>
                      <span className="text-blue-600">
                        $
                        {Math.round(
                          (financialData?.annualSavings || 0) / 12 - (financialData?.monthlyPayment || 0),
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b-2 border-gray-200 pb-2">
                Why Solar Makes Sense
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-2">
                    {Math.round((systemData.annualProductionKwh || 0) * 0.0004)}
                  </div>
                  <div className="text-sm text-gray-600">Tons CO₂ Saved Annually</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {Math.round((systemData.annualProductionKwh || 0) * 0.0004 * 16)}
                  </div>
                  <div className="text-sm text-gray-600">Trees Planted Equivalent</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {financialData?.paybackPeriod.toFixed(1) || "0"}
                  </div>
                  <div className="text-sm text-gray-600">Years Payback Period</div>
                </div>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-bold mb-3 text-gray-800">Key Benefits:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Lock in your energy costs for 25+ years with our comprehensive warranty
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Increase your home value by approximately 4% according to recent studies
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Take advantage of 30% federal tax credit (available through 2032)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Net metering allows you to sell excess power back to the grid
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    Reduce your carbon footprint and contribute to a cleaner environment
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-gray-200 pt-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-blue-600 mb-2">ION Solar</h3>
                <p className="text-sm text-gray-600 mb-2">Licensed, Bonded & Insured • CSLB #1234567</p>
                <p className="text-xs text-gray-500">
                  This proposal is valid for 30 days and is based on the information provided. Final system design and
                  pricing may vary based on site survey and engineering review.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6">
            <Button variant="outline" onClick={() => setCurrentStep(4)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleDownload}>
                <FileText className="mr-2 h-4 w-4" />
                Download PDF Summary
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="https://calendly.com/rob-ionsolar/dallas" target="_blank" rel="noopener noreferrer">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const steps = [
    { number: 1, title: "Property & Energy", icon: Home },
    { number: 2, title: "Solar Potential", icon: Sun },
    { number: 3, title: "System Design", icon: Bolt },
    { number: 4, title: "Financing", icon: DollarSign },
    { number: 5, title: "Final Proposal", icon: FileText },
  ]

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Professional Solar Calculator</h1>
            <p className="text-slate-400">Get a detailed solar analysis for your property</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = currentStep === step.number
                const isCompleted = currentStep > step.number
                return (
                  <div key={step.number} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                        isActive
                          ? "bg-amber-400 border-amber-400 text-slate-900"
                          : isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-slate-600 text-slate-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p
                        className={`text-sm font-medium ${
                          isActive ? "text-amber-400" : isCompleted ? "text-green-400" : "text-slate-400"
                        }`}
                      >
                        Step {step.number}
                      </p>
                      <p
                        className={`text-xs ${
                          isActive ? "text-white" : isCompleted ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-8 h-0.5 ml-4 ${isCompleted ? "bg-green-500" : "bg-slate-600"} hidden sm:block`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
