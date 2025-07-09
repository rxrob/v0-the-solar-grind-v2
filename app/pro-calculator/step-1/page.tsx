"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { GoogleMap, MarkerF } from "@react-google-maps/api"
import { useSolarCalculatorStore } from "@/lib/store"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    google: any
  }
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const mapOptions = {
  mapId: "SOLAR_GRIND_MAP_ID",
  disableDefaultUI: true,
  zoomControl: true,
}

export default function Step1() {
  const router = useRouter()
  const { propertyData, setPropertyData, setCurrentStep, isHydrated } = useSolarCalculatorStore()

  const [address, setAddress] = useState(propertyData.address || "")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(propertyData.coordinates)
  const [isApiLoaded, setIsApiLoaded] = useState(false)

  const autocompleteRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setCurrentStep(1)
  }, [setCurrentStep])

  useEffect(() => {
    if (!autocompleteRef.current) return

    const intervalId = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        clearInterval(intervalId)
        setIsApiLoaded(true)

        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current!, {
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["address_components", "formatted_address", "geometry"],
        })

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()
          if (!place.geometry || !place.geometry.location) {
            toast.error("Could not get coordinates from this address.")
            return
          }

          const location = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }

          const zipCodeComponent = place.address_components?.find((c: any) => c.types.includes("postal_code"))
          const zipCode = zipCodeComponent ? zipCodeComponent.long_name : null

          setCoords(location)
          setAddress(place.formatted_address || "")
          setPropertyData({
            address: place.formatted_address || "",
            coordinates: location,
            zipCode,
          })

          toast.success("Address found! Roof location loaded.")
        })
      }
    }, 300)

    return () => clearInterval(intervalId)
  }, [setPropertyData])

  const handleSubmit = () => {
    if (!address || !coords) {
      toast.error("Please enter a valid address to continue.")
      return
    }
    router.push("/pro-calculator/step-2")
  }

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    )
  }

  return (
    <Card className="bg-[#0a0a0a] border border-gray-800">
      <CardHeader>
        <CardTitle className="text-orange-400 text-2xl">Step 1: Property Details</CardTitle>
        <CardDescription className="text-gray-400">
          Enter the property address to begin. The map will update to the location.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div>
              <Label htmlFor="address-autocomplete" className="text-gray-300">
                Property Address
              </Label>
              <Input
                id="address-autocomplete"
                ref={autocompleteRef}
                type="text"
                placeholder={isApiLoaded ? "Enter a US address" : "Loading Google API..."}
                defaultValue={address}
                className="bg-gray-800 border-gray-600 text-white"
                disabled={!isApiLoaded}
              />
            </div>
            <Button onClick={handleSubmit} className="w-full bg-orange-500 hover:bg-orange-600">
              Continue to Step 2
            </Button>
          </div>
          <div className="md:col-span-2">
            <div className="w-full h-96 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
              {isApiLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={coords || { lat: 32.7767, lng: -96.797 }}
                  zoom={coords ? 19 : 12}
                  options={mapOptions}
                  mapTypeId="satellite"
                >
                  {coords && <MarkerF position={coords} />}
                </GoogleMap>
              ) : (
                <div className="text-center text-gray-400">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  Loading Map...
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
