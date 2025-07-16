import { type NextRequest, NextResponse } from "next/server"
import { createSupabaseServiceClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName } = await request.json()

    if (!userId || !email) {
      return NextResponse.json({ success: false, error: "User ID and email are required" }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()
    const isIONEmployee = email.toLowerCase().includes("@ionsolar.com")

    // Create or update user profile
    const { data, error } = await supabase
      .from("users")
      .upsert(
        {
          id: userId, // ✅ Use the auth user ID
          email,
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

    if (error) {
      console.error("Profile creation error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: isIONEmployee ? "ION Solar profile created with pro access" : "Profile created successfully",
    })
  } catch (error) {
    console.error("Create profile API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
