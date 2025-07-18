import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

// Lightweight health check endpoint for external monitoring services
export async function GET() {
  const startTime = Date.now()

  try {
    // Quick database ping
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database configuration missing",
          timestamp: new Date().toISOString(),
          response_time: Date.now() - startTime,
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Simple connection test
    const { error } = await supabase.from("users").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          timestamp: new Date().toISOString(),
          response_time: Date.now() - startTime,
        },
        { status: 500 },
      )
    }

    // All good
    return NextResponse.json({
      status: "healthy",
      message: "All systems operational",
      timestamp: new Date().toISOString(),
      response_time: Date.now() - startTime,
      services: {
        database: "operational",
        api: "operational",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        response_time: Date.now() - startTime,
      },
      { status: 500 },
    )
  }
}
