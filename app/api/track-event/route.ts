import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Tracking event:", body.event_type, "for session:", body.session_id)

    // Validate required fields
    if (!body.event_type || !body.session_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: event_type and session_id are required",
        },
        { status: 400 },
      )
    }

    // Get Supabase client
    const supabase = createClient()

    // Get user if authenticated (but don't fail if not)
    let userId = null
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (!authError && user) {
        userId = user.id
      }
    } catch (authError) {
      console.warn("Auth check failed (continuing as anonymous):", authError)
    }

    // Get client IP
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ip = forwarded ? forwarded.split(",")[0].trim() : realIp

    // Prepare insert data with proper types
    const insertData = {
      event_type: String(body.event_type).substring(0, 255), // Limit length
      event_data: body.event_data && typeof body.event_data === "object" ? body.event_data : {},
      session_id: String(body.session_id).substring(0, 255), // Limit length
      user_id: userId,
      timestamp: body.timestamp ? new Date(body.timestamp).toISOString() : new Date().toISOString(),
      page_url: body.page_url ? String(body.page_url).substring(0, 2048) : null, // Limit URL length
      user_agent: body.user_agent
        ? String(body.user_agent).substring(0, 1024)
        : request.headers.get("user-agent")?.substring(0, 1024) || null,
    }

    console.log("Attempting to insert:", {
      event_type: insertData.event_type,
      session_id: insertData.session_id,
      user_id: insertData.user_id,
      has_event_data: !!insertData.event_data,
    })

    // Try to insert tracking event with better error handling
    const { data, error } = await supabase.from("user_tracking_events").insert(insertData).select()

    if (error) {
      console.error("Database insert failed:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })

      // Return success anyway for tracking (don't break user experience)
      return NextResponse.json({
        success: true,
        warning: "Event tracked but not persisted",
        error_details: error.message,
      })
    }

    console.log("Successfully tracked event:", data?.[0]?.id)
    return NextResponse.json({
      success: true,
      data: data?.[0],
    })
  } catch (error) {
    console.error("Track event API error:", error)

    // Return success anyway for tracking (don't break user experience)
    return NextResponse.json({
      success: true,
      warning: "Event received but not persisted",
      error_details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Tracking API is running",
    timestamp: new Date().toISOString(),
    status: "healthy",
  })
}
