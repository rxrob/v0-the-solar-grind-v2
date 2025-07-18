import { type NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, event_data, session_id, timestamp, page_url, user_agent } = body

    // Validate required fields
    if (!event_type || !session_id) {
      return NextResponse.json({ error: "Missing required fields: event_type, session_id" }, { status: 400 })
    }

    // Get Supabase client for this request
    const supabase = getServerSupabase(request)

    // Get user if authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get client IP
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip")

    // Insert tracking event
    const { data, error } = await supabase
      .from("user_tracking_events")
      .insert({
        event_type,
        event_data: event_data || {},
        session_id,
        user_id: user?.id || null,
        timestamp: timestamp || new Date().toISOString(),
        page_url,
        user_agent,
        ip_address: ip,
      })
      .select()

    if (error) {
      console.error("Database insert failed:", error)
      return NextResponse.json({ error: "Failed to track event", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Track event error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Tracking API is running",
    timestamp: new Date().toISOString(),
  })
}
