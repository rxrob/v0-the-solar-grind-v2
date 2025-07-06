import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseConfig, testConnection } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const config = getSupabaseConfig()
    const connectionTest = await testConnection()

    return NextResponse.json(
      {
        ...config,
        connection: connectionTest,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      },
    )
  } catch (error) {
    console.error("Supabase status error:", error)
    return NextResponse.json(
      {
        isAvailable: false,
        error: "Status check failed",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      },
    )
  }
}
