import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ isAuthenticated: false, user: null, error: authError?.message }, { status: 401 })
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("subscription_type, subscription_status, single_reports_purchased, single_reports_used")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { isAuthenticated: true, user: { id: user.id }, error: "Failed to fetch user profile." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        ...userProfile,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ isAuthenticated: false, user: null, error: errorMessage }, { status: 500 })
  }
}
