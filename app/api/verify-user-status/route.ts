import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter required" }, { status: 400 })
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    if (userError && userError.code !== "PGRST116") {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Get usage count
    const { data: usageData, error: usageError } = await supabase
      .from("usage_tracking")
      .select("*")
      .eq("user_email", email)

    if (usageError) {
      console.error("Error fetching usage:", usageError)
    }

    const usageCount = usageData?.length || 0

    // Get project count
    const { data: projectData, error: projectError } = await supabase
      .from("user_projects")
      .select("*")
      .eq("user_email", email)

    if (projectError) {
      console.error("Error fetching projects:", projectError)
    }

    const projectCount = projectData?.length || 0

    return NextResponse.json({
      user: user || null,
      usageCount,
      projectCount,
      subscription: {
        status: user?.subscription_status || "inactive",
        plan: user?.subscription_plan || "free",
        trial_ends_at: user?.trial_ends_at || null,
      },
    })
  } catch (error) {
    console.error("Error in verify-user-status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
