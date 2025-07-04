import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const status = {
      configured: !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey),
      url: supabaseUrl ? "Set" : "Missing",
      anonKey: supabaseAnonKey ? "Set" : "Missing",
      serviceKey: supabaseServiceKey ? "Set" : "Missing",
      lastChecked: new Date().toISOString(),
    }

    // Test connection if configured
    if (status.configured) {
      try {
        const supabase = createServerSupabaseClient()
        const { data, error } = await supabase.from("users").select("count").limit(1)

        status.connectionTest = {
          success: !error,
          error: error?.message || null,
        }
      } catch (error) {
        status.connectionTest = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("Error checking Supabase status:", error)
    return NextResponse.json(
      {
        configured: false,
        error: "Failed to check Supabase status",
        lastChecked: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
