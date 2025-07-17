import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: "Missing latitude or longitude" }, { status: 400 })
    }

    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({ success: false, error: "Invalid coordinates" }, { status: 400 })
    }

    // Check if we have Google Geocoding API key
    const apiKey = process.env.GOOGLE_GEOCODING_API_KEY
    if (!apiKey) {
      console.warn("Google Geocoding API key not found, using fallback location detection")

      // Fallback location detection based on coordinates
      const fallbackLocation = getFallbackLocation(latitude, longitude)
      return NextResponse.json({
        success: true,
        city: fallbackLocation.city,
        state: fallbackLocation.state,
        country: fallbackLocation.country,
        zip_code: fallbackLocation.zip_code,
        source: "fallback",
      })
    }

    // Use Google Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`

    const response = await fetch(geocodeUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.warn("Google Geocoding API failed:", data.status)

      // Use fallback
      const fallbackLocation = getFallbackLocation(latitude, longitude)
      return NextResponse.json({
        success: true,
        city: fallbackLocation.city,
        state: fallbackLocation.state,
        country: fallbackLocation.country,
        zip_code: fallbackLocation.zip_code,
        source: "fallback",
      })
    }

    // Parse Google response
    const result = data.results[0]
    const components = result.address_components

    let city = ""
    let state = ""
    let country = ""
    let zip_code = ""

    components.forEach((component: any) => {
      const types = component.types

      if (types.includes("locality")) {
        city = component.long_name
      } else if (types.includes("sublocality") && !city) {
        city = component.long_name
      } else if (types.includes("administrative_area_level_1")) {
        state = component.short_name
      } else if (types.includes("country")) {
        country = component.short_name
      } else if (types.includes("postal_code")) {
        zip_code = component.long_name
      }
    })

    // If we didn't get a city, try to extract from formatted address
    if (!city && result.formatted_address) {
      const addressParts = result.formatted_address.split(", ")
      if (addressParts.length > 1) {
        city = addressParts[1] || addressParts[0]
      }
    }

    return NextResponse.json({
      success: true,
      city: city || "Unknown City",
      state: state || "Unknown State",
      country: country || "US",
      zip_code: zip_code || null,
      source: "google",
      formatted_address: result.formatted_address,
    })
  } catch (error) {
    console.error("Geocoding error:", error)

    // Return fallback location on error
    const lat = Number.parseFloat(request.nextUrl.searchParams.get("lat") || "0")
    const lng = Number.parseFloat(request.nextUrl.searchParams.get("lng") || "0")

    const fallbackLocation = getFallbackLocation(lat, lng)

    return NextResponse.json({
      success: true,
      city: fallbackLocation.city,
      state: fallbackLocation.state,
      country: fallbackLocation.country,
      zip_code: fallbackLocation.zip_code,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

// Fallback location detection based on coordinate ranges
function getFallbackLocation(lat: number, lng: number) {
  // Texas coordinates roughly: 25.8-36.5 N, 93.5-106.6 W
  if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) {
    // More specific Texas regions
    if (lat >= 32.5 && lat <= 33.0 && lng >= -97.5 && lng <= -96.5) {
      return { city: "Dallas", state: "TX", country: "US", zip_code: "75201" }
    } else if (lat >= 29.5 && lat <= 30.0 && lng >= -95.8 && lng <= -95.0) {
      return { city: "Houston", state: "TX", country: "US", zip_code: "77001" }
    } else if (lat >= 30.0 && lat <= 30.5 && lng >= -98.0 && lng <= -97.5) {
      return { city: "Austin", state: "TX", country: "US", zip_code: "78701" }
    } else if (lat >= 29.2 && lat <= 29.7 && lng >= -99.0 && lng <= -98.2) {
      return { city: "San Antonio", state: "TX", country: "US", zip_code: "78201" }
    } else {
      return { city: "Texas", state: "TX", country: "US", zip_code: null }
    }
  }

  // California coordinates roughly: 32.5-42 N, 114-124 W
  if (lat >= 32.5 && lat <= 42.0 && lng >= -124.0 && lng <= -114.0) {
    if (lat >= 34.0 && lat <= 34.3 && lng >= -118.7 && lng <= -118.1) {
      return { city: "Los Angeles", state: "CA", country: "US", zip_code: "90001" }
    } else if (lat >= 37.7 && lat <= 37.8 && lng >= -122.5 && lng <= -122.3) {
      return { city: "San Francisco", state: "CA", country: "US", zip_code: "94102" }
    } else {
      return { city: "California", state: "CA", country: "US", zip_code: null }
    }
  }

  // Florida coordinates roughly: 24.5-31 N, 80-87 W
  if (lat >= 24.5 && lat <= 31.0 && lng >= -87.0 && lng <= -80.0) {
    return { city: "Florida", state: "FL", country: "US", zip_code: null }
  }

  // New York coordinates roughly: 40.5-45 N, 71-79 W
  if (lat >= 40.5 && lat <= 45.0 && lng >= -79.0 && lng <= -71.0) {
    if (lat >= 40.6 && lat <= 40.9 && lng >= -74.1 && lng <= -73.7) {
      return { city: "New York", state: "NY", country: "US", zip_code: "10001" }
    } else {
      return { city: "New York", state: "NY", country: "US", zip_code: null }
    }
  }

  // General US fallback
  if (lat >= 24.0 && lat <= 49.0 && lng >= -125.0 && lng <= -66.0) {
    return { city: "United States", state: "US", country: "US", zip_code: null }
  }

  // International fallback
  return { city: "Your Location", state: "", country: "Unknown", zip_code: null }
}
