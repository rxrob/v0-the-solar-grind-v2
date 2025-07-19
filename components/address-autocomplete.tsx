"use client"

import * as React from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { google } from "googlemaps"

interface AddressAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void
  apiKey: string
}

export function AddressAutocomplete({ onPlaceSelect, apiKey }: AddressAutocompleteProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = React.useState(false)

  React.useEffect(() => {
    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["places"],
    })

    loader
      .load()
      .then(() => {
        setIsGoogleMapsLoaded(true)
      })
      .catch((e) => {
        console.error("Failed to load Google Maps API", e)
      })
  }, [apiKey])

  React.useEffect(() => {
    if (isGoogleMapsLoaded && inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "us" },
      })

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace()
        onPlaceSelect(place)
      })
    }
  }, [isGoogleMapsLoaded, onPlaceSelect])

  return (
    <div className="grid w-full items-center gap-1.5">
      <Label htmlFor="address">Property Address</Label>
      <Input
        ref={inputRef}
        id="address"
        type="text"
        placeholder="Enter a US property address"
        disabled={!isGoogleMapsLoaded}
      />
    </div>
  )
}
