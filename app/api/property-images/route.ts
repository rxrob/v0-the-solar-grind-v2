import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!address && (!lat || !lng)) {
      return NextResponse.json({ error: "Address or coordinates are required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        error: "Google Maps API not configured",
        usingDemo: true,
        images: {
          satellite: "/placeholder.svg?height=400&width=800&text=Demo+Satellite+View",
          streetViews: {
            north: "/placeholder.svg?height=300&width=400&text=Demo+North+View",
            south: "/placeholder.svg?height=300&width=400&text=Demo+South+View",
            east: "/placeholder.svg?height=300&width=400&text=Demo+East+View",
            west: "/placeholder.svg?height=300&width=400&text=Demo+West+View",
          },
        },
      })
    }

    let coordinates = { lat: Number.parseFloat(lat || "0"), lng: Number.parseFloat(lng || "0") }

    // If we only have an address, geocode it first
    if (address && (!lat || !lng)) {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${apiKey}`

      try {
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: {
            "User-Agent": "MySolarAI/1.0",
          },
        })

        if (!geocodeResponse.ok) {
          throw new Error(`Geocoding API error: ${geocodeResponse.status}`)
        }

        const geocodeData = await geocodeResponse.json()

        if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
          coordinates = geocodeData.results[0].geometry.location
        } else {
          throw new Error(`Geocoding failed: ${geocodeData.status}`)
        }
      } catch (error) {
        console.error("Geocoding error:", error)
        return NextResponse.json(
          {
            error: "Failed to geocode address",
            details: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 400 },
        )
      }
    }

    // Generate satellite image URL
    const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=19&size=800x400&maptype=satellite&key=${apiKey}`

    // Generate street view URLs for all four directions
    const streetViewUrls = {
      north: `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${coordinates.lat},${coordinates.lng}&heading=0&pitch=0&key=${apiKey}`,
      east: `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${coordinates.lat},${coordinates.lng}&heading=90&pitch=0&key=${apiKey}`,
      south: `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${coordinates.lat},${coordinates.lng}&heading=180&pitch=0&key=${apiKey}`,
      west: `https://maps.googleapis.com/maps/api/streetview?size=400x300&location=${coordinates.lat},${coordinates.lng}&heading=270&pitch=0&key=${apiKey}`,
    }

    // Check if street view is available
    const streetViewMetadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${coordinates.lat},${coordinates.lng}&key=${apiKey}`

    let streetViewAvailable = false
    try {
      const metadataResponse = await fetch(streetViewMetadataUrl, {
        headers: {
          "User-Agent": "MySolarAI/1.0",
        },
      })

      if (metadataResponse.ok) {
        const metadataData = await metadataResponse.json()
        streetViewAvailable = metadataData.status === "OK"
      }
    } catch (error) {
      console.warn("Failed to check street view availability:", error)
    }

    return NextResponse.json({
      success: true,
      coordinates,
      streetViewAvailable,
      images: {
        satellite: satelliteUrl,
        streetViews: streetViewAvailable
          ? streetViewUrls
          : {
              north: "/placeholder.svg?height=300&width=400&text=Street+View+Not+Available",
              south: "/placeholder.svg?height=300&width=400&text=Street+View+Not+Available",
              east: "/placeholder.svg?height=300&width=400&text=Street+View+Not+Available",
              west: "/placeholder.svg?height=300&width=400&text=Street+View+Not+Available",
            },
      },
      attribution: "© Google Maps",
    })
  } catch (error) {
    console.error("Property images API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch property images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
