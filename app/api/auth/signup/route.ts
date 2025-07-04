import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createSupabaseServerClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 400 })
    }

    // Create user profile
    const { error: profileError } = await supabase.from("users").insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      subscription_type: "free",
      created_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Don't fail the request if profile creation fails
    }

    return NextResponse.json({
      user: authData.user,
      message: "Account created successfully",
    })
  } catch (error) {
    console.error("Signup API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
