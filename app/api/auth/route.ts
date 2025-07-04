import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    return NextResponse.json({
      authenticated: !!session,
      user: session?.user || null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : "Authentication check failed",
      },
      { status: 500 },
    )
  }
}
