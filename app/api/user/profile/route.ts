import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { createSupabaseServiceClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (profileError) {
      // If profile doesn't exist, create it
      if (profileError.code === "PGRST116") {
        const serviceClient = createSupabaseServiceClient()

        const newProfile = {
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          subscription_tier: user.email?.endsWith("@ionsolar.com") ? "pro" : "free",
          subscription_status: "active",
          reports_used: 0,
          single_reports_purchased: 0,
          max_reports: user.email?.endsWith("@ionsolar.com") ? 999999 : 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const { data: createdProfile, error: createError } = await serviceClient
          .from("users")
          .insert(newProfile)
          .select()
          .single()

        if (createError) {
          console.error("Error creating profile:", createError)
          return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
        }

        return NextResponse.json({ profile: createdProfile })
      }

      console.error("Error fetching profile:", profileError)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
