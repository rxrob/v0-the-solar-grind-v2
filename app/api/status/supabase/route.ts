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
        const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
        const { data, error } = await supabase.from("users").select("count").limit(1)

        connectionTest = {
          success: !error,
          error: error?.message || null,
          timestamp: new Date().toISOString(),
        }
      } catch (error) {
        connectionTest = {
          success: false,
          error: error instanceof Error ? error.message : "Connection failed",
          timestamp: new Date().toISOString(),
        }
      }
    }

    return NextResponse.json({
      status: "success",
      environment: envCheck,
      connection: connectionTest,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
