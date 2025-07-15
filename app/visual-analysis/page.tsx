import { redirect } from "next/navigation"
import { VisualAnalysisPageClient } from "@/components/visual-analysis-page-client"
import { createClient } from "@/lib/supabase/server"

// Force dynamic rendering to prevent build-time auth issues
export const dynamic = "force-dynamic"

export default async function VisualAnalysisPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      redirect("/login")
    }

    // Get user profile with error handling
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_pro, subscription_status")
      .eq("user_id", user.id)
      .single()

    // If profile doesn't exist, try users table
    let isPro = false
    let subscriptionStatus = "inactive"

    if (profileError) {
      const { data: userData } = await supabase
        .from("users")
        .select("subscription_type, subscription_status")
        .eq("id", user.id)
        .single()

      isPro = userData?.subscription_type === "pro"
      subscriptionStatus = userData?.subscription_status || "inactive"
    } else {
      isPro = profile?.is_pro || false
      subscriptionStatus = profile?.subscription_status || "inactive"
    }

    if (!isPro || subscriptionStatus !== "active") {
      redirect("/pricing")
    }

    return <VisualAnalysisPageClient />
  } catch (error) {
    console.error("Error in visual analysis page:", error)
    redirect("/login")
  }
}
