import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Check if environment variables exist
    const envCheck = {
      url: {
        exists: typeof supabaseUrl === "string" && supabaseUrl.length > 0,
        valid: typeof supabaseUrl === "string" && supabaseUrl.startsWith("https://"),
        value: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "Not set",
      },
      anonKey: {
        exists: typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 0,
        valid: typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 50,
        value: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "Not set",
      },
      serviceKey: {
        exists: typeof supabaseServiceKey === "string" && supabaseServiceKey.length > 0,
        valid: typeof supabaseServiceKey === "string" && supabaseServiceKey.length > 50,
        value: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : "Not set",
      },
    }

    // Test connection if all keys are present
    let connectionTest = null
    if (envCheck.url.valid && envCheck.anonKey.valid && envCheck.serviceKey.valid) {
      try {
        console.log("🧪 Testing Supabase connection...")

        const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

        // Test basic connection with a simple query
        const { data, error, count } = await supabase.from("users").select("id", { count: "exact" }).limit(1)

        if (error) {
          console.error("Supabase connection test failed:", error.message)
          connectionTest = {
            success: false,
            error: error.message,
            error_code: error.code,
            error_details: error.details,
            timestamp: new Date().toISOString(),
          }
        } else {
          console.log("✅ Supabase connection successful")
          connectionTest = {
            success: true,
            message: "Database connection successful",
            users_table_accessible: true,
            total_users: count || 0,
            sample_query_result: data?.length || 0,
            timestamp: new Date().toISOString(),
          }

          // Test authentication service
          try {
            const { data: authData, error: authError } = await supabase.auth.getSession()
            connectionTest.auth_service = {
              accessible: !authError,
              error: authError?.message || null,
            }
          } catch (authError) {
            connectionTest.auth_service = {
              accessible: false,
              error: authError instanceof Error ? authError.message : "Auth service test failed",
            }
          }
        }
      } catch (error) {
        console.error("Supabase connection error:", error)
        connectionTest = {
          success: false,
          error: error instanceof Error ? error.message : "Connection failed",
          error_type: error.constructor.name,
          timestamp: new Date().toISOString(),
        }
      }
    } else {
      connectionTest = {
        success: false,
        error: "Missing or invalid environment variables",
        missing_vars: Object.entries(envCheck)
          .filter(([_, config]) => !config.valid)
          .map(([key, _]) => key),
        timestamp: new Date().toISOString(),
      }
    }

    // Calculate health score
    const envScore = (Object.values(envCheck).filter((config) => config.valid).length / 3) * 50
    const connectionScore = connectionTest?.success ? 50 : 0
    const healthScore = Math.round(envScore + connectionScore)

    const response = {
      status: healthScore >= 90 ? "healthy" : healthScore >= 50 ? "degraded" : "unhealthy",
      health: {
        score: healthScore,
        message:
          healthScore >= 90
            ? "Supabase fully operational"
            : healthScore >= 50
              ? "Supabase partially configured"
              : "Supabase configuration issues",
      },
      environment: envCheck,
      connection: connectionTest,
      services: {
        database: connectionTest?.success || false,
        auth: connectionTest?.auth_service?.accessible || false,
        realtime: envCheck.url.valid && envCheck.anonKey.valid, // Assume realtime works if basic config is valid
      },
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Supabase status check error:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        health: {
          score: 0,
          message: "Status check failed",
        },
        error: error instanceof Error ? error.message : "Unknown error",
        error_type: error.constructor.name,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
