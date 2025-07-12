"use client"

import { useState, useCallback, useEffect } from "react"
import { GoogleMap, useJsApiLoader, DrawingManager } from "@react-google-maps/api"
import { useFormContext } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"
import { useProCalculator } from "@/lib/store"
import * as google from "google.maps"

const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "0.5rem",
}

const libraries: ("places" | "geometry" | "marker" | "drawing")[] = ["places", "geometry", "marker", "drawing"]

export default function Step3Client() {
  const { address, setRoofPolygons } = useProCalculator()
  const { setValue } = useFormContext()

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [center, setCenter] = useState({ lat: 30.2672, lng: -97.7431 }) // Default to Austin, TX

  useEffect(() => {
    if (address?.lat && address?.lng) {
      const newCenter = { lat: address.lat, lng: address.lng }
      setCenter(newCenter)
      if (map) {
        map.panTo(newCenter)
        map.setZoom(20) // Zoom in close for roof drawing
        map.setMapTypeId("satellite") // Switch to satellite view
      }
    }
  }, [address, map])

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance)
  }, [])

  const onUnmount = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(null)
  }, [])

  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    const path = polygon
      .getPath()
      .getArray()
      .map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }))
    const area = google.maps.geometry.spherical.computeArea(polygon.getPath())

    const newPolygon = { path, area }
    const updatedPolygons = [...useProCalculator.getState().roofPolygons, newPolygon]
    setRoofPolygons(updatedPolygons)

    setValue("roofPolygons", updatedPolygons, { shouldValidate: true })

    polygon.setMap(null) // Remove the drawn polygon to allow drawing more
  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Map Error</AlertTitle>
        <AlertDescription>
          There was an error loading the Google Maps script. Please check your API key and network connection.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Draw Roof Sections</CardTitle>
        <CardDescription>
          Use the polygon tool to outline each flat section of the roof suitable for solar panels. The map will center
          on your property address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={18}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: false,
              mapTypeId: "satellite",
              tilt: 0,
            }}
          >
            <DrawingManager
              onPolygonComplete={onPolygonComplete}
              options={{
                drawingControl: true,
                drawingControlOptions: {
                  position: google.maps.ControlPosition.TOP_CENTER,
                  drawingModes: [google.maps.drawing.OverlayType.POLYGON],
                },
                polygonOptions: {
                  fillColor: "#2196F3",
                  fillOpacity: 0.5,
                  strokeWeight: 2,
                  strokeColor: "#2196F3",
                  clickable: false,
                  editable: false,
                  zIndex: 1,
                },
              }}
            />
          </GoogleMap>
        ) : (
          <Skeleton className="h-[500px] w-full rounded-lg" />
        )}
      </CardContent>
    </Card>
  )
}
