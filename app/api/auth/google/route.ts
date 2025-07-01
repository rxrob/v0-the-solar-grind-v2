import { createClient } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })

    if (error) throw error

    return NextResponse.json({ url: data.url })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
