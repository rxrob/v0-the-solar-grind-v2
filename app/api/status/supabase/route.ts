import { NextResponse } from "next/server"
import { getSupabaseStatus } from "@/lib/supabase"

export async function GET() {
  try {
    const status = await getSupabaseStatus()

    return NextResponse.json({
      service: "Supabase",
      status: status.connected ? "operational" : "error",
      details: {
        connected: status.connected,
        url: status.url,
        key: status.key,
        error: status.error,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Supabase status check error:", error)

    return NextResponse.json(
      {
        service: "Supabase",
        status: "error",
        details: {
          connected: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
