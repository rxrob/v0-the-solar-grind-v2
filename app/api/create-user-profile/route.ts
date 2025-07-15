import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create admin client with service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields: userId and email" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("id", userId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking existing user:", checkError)
      return NextResponse.json({ error: "Database error while checking user" }, { status: 500 })
    }

    // If user already exists, return existing data
    if (existingUser) {
      const { data: userData } = await supabaseAdmin
        .from("users")
        .select("id, email, full_name, subscription_status, subscription_type")
        .eq("id", userId)
        .single()

      return NextResponse.json({
        success: true,
        data: userData,
        message: "User profile already exists",
      })
    }

    // Create new user profile
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        subscription_status: "active",
        subscription_type: "free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id, email, full_name, subscription_status, subscription_type")
      .single()

    if (insertError) {
      console.error("Error creating user profile:", insertError)
      return NextResponse.json(
        { error: "Failed to create user profile", details: insertError.message },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "User profile created successfully",
    })
  } catch (error) {
    console.error("API error in create-user-profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
