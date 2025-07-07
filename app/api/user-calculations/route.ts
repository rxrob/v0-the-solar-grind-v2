import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user calculations
    const { data: calculations, error: calculationsError } = await supabase
      .from("solar_calculations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (calculationsError) {
      console.error("Error fetching calculations:", calculationsError)
      return NextResponse.json({ error: "Failed to fetch calculations" }, { status: 500 })
    }

    return NextResponse.json({ calculations })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      address,
      monthly_bill,
      system_size,
      annual_production,
      annual_savings,
      payback_period,
      calculation_type = "basic",
    } = body

    // Create new calculation
    const { data: calculation, error: calculationError } = await supabase
      .from("solar_calculations")
      .insert({
        user_id: user.id,
        address,
        monthly_bill,
        system_size,
        annual_production,
        annual_savings,
        payback_period,
        calculation_type,
      })
      .select()
      .single()

    if (calculationError) {
      console.error("Error creating calculation:", calculationError)
      return NextResponse.json({ error: "Failed to create calculation" }, { status: 500 })
    }

    return NextResponse.json({ calculation })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
