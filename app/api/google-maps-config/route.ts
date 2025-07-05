import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ? "Set" : "Missing",
    googleGeocodingApiKey: process.env.GOOGLE_GEOCODING_API_KEY ? "Set" : "Missing",
    googleElevationApiKey: process.env.GOOGLE_ELEVATION_API_KEY ? "Set" : "Missing",
    publicGoogleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Set" : "Missing",
  }

  return NextResponse.json(config)
}
