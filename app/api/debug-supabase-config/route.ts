import { NextResponse } from "next/server"

export async function GET() {
  try {
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      config,
      message: "Supabase configuration check complete",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
