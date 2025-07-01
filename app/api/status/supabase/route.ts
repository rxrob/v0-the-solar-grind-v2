import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const startTime = Date.now()

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        name: "Supabase Database",
        category: "Database",
        endpoint: "/api/status/supabase",
        critical: true,
        status: "error",
        message: "Missing Supabase configuration",
        response_time: Date.now() - startTime,
        details: {
          url_configured: !!supabaseUrl,
          key_configured: !!supabaseKey,
          error: "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set",
        },
        timestamp: new Date().toISOString(),
        http_status: 500,
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Test basic connection
    const { data, error } = await supabase.from("users").select("count").limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      // Check if it's an RLS error (which means connection works but no access)
      if (error.code === "PGRST116" || error.message.includes("RLS")) {
        return NextResponse.json({
          name: "Supabase Database",
          category: "Database",
          endpoint: "/api/status/supabase",
          critical: true,
          status: "healthy",
          message: "Database connected (RLS active)",
          response_time: responseTime,
          details: {
            connection: "successful",
            rls_active: true,
            note: "Row Level Security is working as expected",
          },
          timestamp: new Date().toISOString(),
          http_status: 200,
        })
      }

      return NextResponse.json({
        name: "Supabase Database",
        category: "Database",
        endpoint: "/api/status/supabase",
        critical: true,
        status: "error",
        message: `Database error: ${error.message}`,
        response_time: responseTime,
        details: {
          error_code: error.code,
          error_details: error.details,
          hint: error.hint,
        },
        timestamp: new Date().toISOString(),
        http_status: 500,
      })
    }

    return NextResponse.json({
      name: "Supabase Database",
      category: "Database",
      endpoint: "/api/status/supabase",
      critical: true,
      status: "healthy",
      message: "Database connection successful",
      response_time: responseTime,
      details: {
        connection: "successful",
        query_executed: true,
      },
      timestamp: new Date().toISOString(),
      http_status: 200,
    })
  } catch (error) {
    return NextResponse.json({
      name: "Supabase Database",
      category: "Database",
      endpoint: "/api/status/supabase",
      critical: true,
      status: "error",
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      response_time: Date.now() - startTime,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp: new Date().toISOString(),
      http_status: 500,
    })
  }
}
