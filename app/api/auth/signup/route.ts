import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long" },
        { status: 400 },
      )
    }

    // Use the correct client for authentication
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // Use service role client for database operations
    const serviceClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    console.log("[SIGNUP] Attempting signup for:", email)

    // Check if user already exists in our database
    const { data: existingProfile } = await serviceClient.from("users").select("email").eq("email", email).single()

    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        },
        { status: 409 },
      )
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || "",
        },
      },
    })

    if (error) {
      console.error("[SIGNUP] Auth error:", error.message)

      if (error.message.includes("User already registered")) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email already exists. Please sign in instead.",
          },
          { status: 409 },
        )
      }

      if (error.message.includes("Password should be at least")) {
        return NextResponse.json(
          {
            success: false,
            error: "Password must be at least 6 characters long.",
          },
          { status: 400 },
        )
      }

      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ success: false, error: "Failed to create user account" }, { status: 500 })
    }

    console.log("[SIGNUP] User created:", data.user.id)

    // Create user profile
    const isIONEmployee = email.toLowerCase().includes("@ionsolar.com")

    const { data: profile, error: profileError } = await serviceClient
      .from("users")
      .upsert(
        {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || "",
          subscription_type: isIONEmployee ? "pro" : "free",
          subscription_status: "active",
          single_reports_purchased: isIONEmployee ? 999 : 0,
          single_reports_used: 0,
          pro_trial_used: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
          ignoreDuplicates: false,
        },
      )
      .select()
      .single()

    if (profileError) {
      console.error("[SIGNUP] Profile creation error:", profileError)

      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(data.user.id)

      return NextResponse.json({ success: false, error: "Failed to create user profile" }, { status: 500 })
    }

    console.log("[SIGNUP] Profile created:", profile.subscription_type)

    return NextResponse.json({
      success: true,
      message: isIONEmployee
        ? "Welcome to the ION Solar team! Your pro account has been created. 👑"
        : "Account created successfully! Please check your email to confirm your account.",
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        subscription_type: profile.subscription_type,
      },
      needsConfirmation: !data.session, // If no session, email confirmation is required
    })
  } catch (error) {
    console.error("[SIGNUP] Fatal error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
