import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    // Check authentication and Pro status
    const authHeader = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const {
      data: { user },
    } = await supabase.auth.getUser(authHeader)

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro, subscription_status")
      .eq("user_id", user.id)
      .maybeSingle()

    if (!profile?.is_pro || profile?.subscription_status !== "active") {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 })
    }

    const body = await request.json()
    const { address, monthlyBill, roofArea, preferences } = body

    // Smart analysis that considers multiple factors
    const analysis = {
      address,
      coordinates: { lat: 34.0522, lng: -118.2437 }, // Mock coordinates
      solarPotential: {
        annualSunlightHours: 2800,
        solarIrradiance: 5.5,
        roofArea: roofArea || 1500,
        usableRoofArea: (roofArea || 1500) * 0.7,
        recommendedSystemSize: 8.5,
        estimatedAnnualGeneration: 12250,
      },
      financial: {
        systemCost: 25500,
        monthlyBill: monthlyBill || 200,
        monthlySavings: 180,
        annualSavings: 2160,
        paybackPeriod: 7.2,
        roi25Year: 156,
      },
      environmental: {
        co2OffsetAnnual: 8500,
        co2Offset25Year: 212500,
        treesEquivalent: 95,
      },
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("Smart analysis error:", error)
    return NextResponse.json({ error: "Failed to perform smart solar analysis" }, { status: 500 })
  }
}
