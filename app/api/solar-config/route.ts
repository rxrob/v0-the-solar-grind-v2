import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Return only the API key from server-side environment
    const apiKey = process.env.SOLAR_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Solar API key not configured" }, { status: 500 })
    }

    return NextResponse.json({
      apiKey,
      baseUrl: "https://solar.googleapis.com/v1",
    })
  } catch (error) {
    console.error("Solar config error:", error)
    return NextResponse.json({ error: "Failed to get solar configuration" }, { status: 500 })
  }
}
