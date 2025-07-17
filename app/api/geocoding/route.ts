import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: "Latitude and longitude are required" }, { status: 400 })
    }

    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    // Try Google Geocoding API first if available
    if (process.env.GOOGLE_GEOCODING_API_KEY) {
      try {
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_GEOCODING_API_KEY}`,
        )

        if (googleResponse.ok) {
          const googleData = await googleResponse.json()

          if (googleData.status === "OK" && googleData.results.length > 0) {
            const result = googleData.results[0]
            const addressComponents = result.address_components

            let city = ""
            let state = ""
            let country = ""
            let zip_code = ""

            addressComponents.forEach((component: any) => {
              if (component.types.includes("locality")) {
                city = component.long_name
              } else if (component.types.includes("administrative_area_level_1")) {
                state = component.short_name
              } else if (component.types.includes("country")) {
                country = component.short_name
              } else if (component.types.includes("postal_code")) {
                zip_code = component.long_name
              }
            })

            return NextResponse.json({
              success: true,
              city: city || "Unknown City",
              state: state || "",
              country: country || "US",
              zip_code: zip_code || "",
              source: "google",
              formatted_address: result.formatted_address,
            })
          }
        }
      } catch (googleError) {
        console.error("Google Geocoding API error:", googleError)
      }
    }

    // Fallback to coordinate-based location detection
    const fallbackLocation = getFallbackLocation(latitude, longitude)

    return NextResponse.json({
      success: true,
      city: fallbackLocation.city,
      state: fallbackLocation.state,
      country: fallbackLocation.country,
      zip_code: "",
      source: "estimated",
    })
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json({ success: false, error: "Failed to geocode location" }, { status: 500 })
  }
}

function getFallbackLocation(lat: number, lng: number) {
  // Texas regions
  if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) {
    if (lat >= 32.5 && lat <= 33.5 && lng >= -97.5 && lng <= -96.0) {
      return { city: "Dallas", state: "TX", country: "US" }
    }
    if (lat >= 29.5 && lat <= 30.0 && lng >= -95.8 && lng <= -95.0) {
      return { city: "Houston", state: "TX", country: "US" }
    }
    if (lat >= 30.0 && lat <= 30.5 && lng >= -98.0 && lng <= -97.5) {
      return { city: "Austin", state: "TX", country: "US" }
    }
    return { city: "Texas", state: "TX", country: "US" }
  }

  // California
  if (lat >= 32.5 && lat <= 42.0 && lng >= -124.4 && lng <= -114.1) {
    if (lat >= 34.0 && lat <= 34.3 && lng >= -118.7 && lng <= -118.1) {
      return { city: "Los Angeles", state: "CA", country: "US" }
    }
    if (lat >= 37.7 && lat <= 37.8 && lng >= -122.5 && lng <= -122.3) {
      return { city: "San Francisco", state: "CA", country: "US" }
    }
    return { city: "California", state: "CA", country: "US" }
  }

  // Florida
  if (lat >= 24.5 && lat <= 31.0 && lng >= -87.6 && lng <= -80.0) {
    return { city: "Florida", state: "FL", country: "US" }
  }

  // New York
  if (lat >= 40.4 && lat <= 45.0 && lng >= -79.8 && lng <= -71.8) {
    return { city: "New York", state: "NY", country: "US" }
  }

  // General US fallback
  if (lat >= 24.0 && lat <= 49.0 && lng >= -125.0 && lng <= -66.0) {
    return { city: "United States", state: "", country: "US" }
  }

  return { city: "Your Location", state: "", country: "" }
}
