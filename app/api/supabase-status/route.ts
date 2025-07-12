import { NextResponse } from "next/server"
import { testServerConnection } from "@/lib/supabase/test-connection"

export const dynamic = "force-dynamic"

export async function GET() {
  const { success, error } = await testServerConnection()

  if (!success) {
    return NextResponse.json(
      {
        status: "error",
        message: "Supabase connection failed.",
        error: error,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({
    status: "ok",
    message: "Supabase connection is healthy.",
  })
}
