"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSolarCalculatorStore } from "@/lib/store"
import { GoogleMap, Polygon } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { useMapsApi } from "../layout"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const SOLAR_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!

export default function Step3() {
  const router = useRouter()
  const { propertyData, energyData, setCurrentStep, isHydrated, setAnalysisData } = useSolarCalculatorStore()

  const [sunlightHours, setSunlightHours] = useState<number | null>(null)
  const [polygonCoords, setPolygonCoords] = useState<any[]>([])
  const [isLoadingApi, setIsLoadingApi] = useState(true)

  const { isLoaded } = useMapsApi()

  const calculatePanels = (dailyKWh: number) => {
    if (!energyData.monthlyUsage || dailyKWh <= 0) return 0
    const panelWatt = 440
    const annualKWhNeeded = energyData.monthlyUsage * 12
    const annualKWhPerPanel = (panelWatt / 1000) * dailyKWh * 365
    if (annualKWhPerPanel === 0) return 0
    return Math.ceil(annualKWhNeeded / annualKWhPerPanel)
  }

  useEffect(() => {
    if (!isHydrated || !isLoaded) return

    if (!propertyData.coordinates) {
      toast.error("Address not found. Please start over.")
      router.push("/pro-calculator/step-1")
      return
    }

    setCurrentStep(3)
    const { lat, lng } = propertyData.coordinates

    const fetchSolarData = async () => {
      setIsLoadingApi(true)
      try {
        const url = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&key=${SOLAR_API_KEY}`
        console.log("📡 Fetching from:", url)
        const res = await fetch(url)
        const data = await res.json()
        console.log("📦 API Response:", data)

        if (!res.ok || !data?.solarPotential) {
          toast.error("No solar data available. Using fallback values.")
          setSunlightHours(4.5)
          setPolygonCoords([])
          return
        }

        const hours = +(data.solarPotential.maxSunshineHoursPerYear / 365).toFixed(1)
        setSunlightHours(hours)

        const segments = data.solarPotential.roofSegmentStats || []
        const polygons = segments.map((segment: any) => {
          const { sw, ne } = segment.latLngBox
          return [
            { lat: sw.latitude, lng: sw.longitude },
            { lat: ne.latitude, lng: sw.longitude },
            { lat: ne.latitude, lng: ne.longitude },
            { lat: sw.latitude, lng: ne.longitude },
          ]
        })
        setPolygonCoords(polygons)

        const panelCount = data.solarPotential.maxArrayPanelsCount || 0
        const annualKWh = data.solarPotential.wholeRoofStats?.yearlyEnergyDcKwh || 0
        const electricityRate =
          energyData.electricityRate ||
          (energyData.monthlyBill && energyData.monthlyUsage ? energyData.monthlyBill / energyData.monthlyUsage : 0.15)
        const monthlySavings = (annualKWh / 12) * electricityRate

        setAnalysisData({
          systemSize: (panelCount * 440) / 1000,
          annualProduction: annualKWh,
          monthlySavings,
          annualSavings: monthlySavings * 12,
        })
      } catch (err) {
        console.error("❌ Google Solar API Error:", err)
        toast.error("Solar API error — using fallback.")
        setSunlightHours(4.5)
        setPolygonCoords([])
      } finally {
        setIsLoadingApi(false)
      }
    }

    fetchSolarData()

    const fallbackTimeout = setTimeout(() => {
      if (isLoadingApi) {
        toast.warning("API timeout. Using fallback.")
        setSunlightHours(4.5)
        setPolygonCoords([])
        setIsLoadingApi(false)
      }
    }, 15000)

    return () => clearTimeout(fallbackTimeout)
  }, [isHydrated, isLoaded, propertyData.coordinates, setCurrentStep, router, energyData, setAnalysisData])

  const handleContinue = () => router.push("/pro-calculator/step-4")

  if (isLoadingApi) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400 mb-4" />
        <p>Loading solar insights from Google...</p>
      </div>
    )
  }

  const panelCount = sunlightHours ? calculatePanels(sunlightHours) : 0
  const annualKWh = Math.round(panelCount * 0.44 * (sunlightHours || 0) * 365)

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-orange-500 mb-2">Step 3: Solar Analysis</h1>
      <p className="mb-6 text-gray-300">Based on your data, here's your rooftop solar system summary:</p>

      <div className="rounded-xl overflow-hidden mb-6 border border-gray-700">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={propertyData.coordinates!}
          zoom={20}
          mapTypeId="satellite"
          options={{ streetViewControl: false, fullscreenControl: false }}
        >
          {polygonCoords.map((path, index) => (
            <Polygon
              key={index}
              path={path}
              options={{
                fillColor: "#ffa500",
                fillOpacity: 0.4,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
          ))}
        </GoogleMap>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">System Overview</h2>
          <p>
            <b>Estimated Sunlight:</b> {sunlightHours} hrs/day
          </p>
          <p>
            <b>Panels Needed:</b> {panelCount} × 440W Silfab
          </p>
          <p>
            <b>Microinverter:</b> Enphase IQ8+ MC
          </p>
          <p>
            <b>Estimated Output:</b> {annualKWh.toLocaleString()} kWh/year
          </p>
        </div>
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Warranties & Support</h2>
          <ul className="list-disc list-inside text-sm text-gray-300">
            <li>⚙️ 25-year bumper-to-bumper coverage</li>
            <li>🔋 Panel product & performance: 30 years</li>
            <li>⚡ Enphase inverter: 25 years</li>
            <li>🛠️ Installation workmanship: 10 years</li>
          </ul>
          <p className="mt-4 text-sm text-gray-400">
            Your system is protected by ION Solar’s industry-leading service and support. No surprise fees or fine
            print.
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <Button variant="outline" onClick={() => router.push("/pro-calculator/step-2")}>
          ← Back to Step 2
        </Button>
        <Button onClick={handleContinue} className="bg-orange-500 hover:bg-orange-600">
          Continue to Step 4
        </Button>
      </div>
    </div>
  )
}
