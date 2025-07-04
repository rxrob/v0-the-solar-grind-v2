import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.NREL_API_KEY

    const status = {
      configured: !!apiKey,
      apiKey: apiKey ? "Set" : "Missing",
      lastChecked: new Date().toISOString(),
    }

    // Test API key if available
    if (apiKey) {
      try {
        const testResponse = await fetch(
          `https://developer.nrel.gov/api/pvwatts/v6.json?api_key=${apiKey}&lat=40&lon=-105&system_capacity=4&azimuth=180&tilt=40&array_type=1&module_type=1&losses=10`,
        )
        const testData = await testResponse.json()

        status.apiTest = {
          success: !testData.errors,
          error: testData.errors ? testData.errors[0] : null,
        }
      } catch (error) {
        status.apiTest = {
          success: false,
          error: "Failed to test API key",
        }
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking NREL status:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to check NREL status",
        lastChecked: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
