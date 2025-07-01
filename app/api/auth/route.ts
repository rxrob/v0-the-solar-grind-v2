import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json()
    const supabase = createClient()

    if (action === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, data })
    }

    if (action === "signin") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true, data })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 })
  }
}
