import { NextResponse } from "next/server"
import { getSupabaseConfig, testConnection } from "@/lib/supabase"

export async function GET() {
  try {
    const config = getSupabaseConfig()
    const connectionTest = await testConnection()

    return NextResponse.json(
      {
        ...config,
        ...connectionTest,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      },
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to get Supabase status",
        details: error.message,
        isAvailable: false,
        connectionStatus: "error",
      },
      { status: 500 },
    )
  }
}
