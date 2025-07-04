import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ url: data.url })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OAuth initialization failed" },
      { status: 500 },
    )
  }
}
