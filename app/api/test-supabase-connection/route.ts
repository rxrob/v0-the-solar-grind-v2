import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase configuration missing",
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseAnonKey,
          },
        },
        { status: 500 },
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test the connection by trying to get the current user
    const { data, error } = await supabase.auth.getUser()

    if (error && error.message !== "Auth session missing!") {
      return NextResponse.json(
        {
          success: false,
          error: "Supabase connection failed",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      details: {
        connected: true,
        hasUser: !!data.user,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Connection test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
