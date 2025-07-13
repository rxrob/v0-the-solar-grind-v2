"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useProCalculatorStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { Description } from "@/components/ui/description" // Import Description component

interface ImageryData {
  streetViewUrl?: string
  aerialViewUrl?: string
  error?: string
}

export default function Step3Client() {
  const router = useRouter()
  const { address, setImagery, imagery } = useProCalculatorStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchImagery = useCallback(async () => {
    if (!address) {
      setError("Address not found. Please go back to Step 1.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/property-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.formatted_address }),
      })

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to fetch property imagery and could not parse error." }))
        throw new Error(errorData.error || "Failed to fetch property imagery.")
      }

      const data: ImageryData = await response.json()
      setImagery({
        streetViewUrl: data.streetViewUrl,
        aerialViewUrl: data.aerialViewUrl,
      })
      if (data.error) {
        setError(data.error)
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }, [address, setImagery])

  useEffect(() => {
    if (!imagery.streetViewUrl && !imagery.aerialViewUrl) {
      fetchImagery()
    } else {
      setLoading(false)
    }
  }, [fetchImagery, imagery])

  const handleNext = () => {
    router.push("/pro-calculator/step-4")
  }

  const handleBack = () => {
    router.push("/pro-calculator/step-2")
  }

  const renderImage = (src: string | undefined, alt: string) => {
    if (!src) {
      return (
        <div className="aspect-video w-full bg-muted rounded-md flex items-center justify-center">
          <p className="text-muted-foreground">Image not available</p>
        </div>
      )
    }
    return (
      <div className="aspect-video w-full relative">
        <Image src={src || "/placeholder.svg"} alt={alt} layout="fill" objectFit="cover" className="rounded-md" />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Step 3: Visual Property Analysis</CardTitle>
        <CardDescription>
          Review the satellite and street view imagery for your property. This helps ensure an accurate assessment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Fetching property imagery...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Aerial View</h3>
              {renderImage(imagery.aerialViewUrl, "Aerial view of property")}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Street View</h3>
              {renderImage(imagery.streetViewUrl, "Street view of property")}
            </div>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Imagery Loaded</AlertTitle>
              <Description>Imagery has been successfully loaded. Please proceed to the next step.</Description>
            </Alert>
          </div>
        )}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext} disabled={loading || !!error}>
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
