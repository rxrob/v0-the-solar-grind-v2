import { redirect } from "next/navigation"
import { VisualAnalysisPageClient } from "@/components/visual-analysis-page-client"
import { createClient } from "@/lib/supabase/server"

export default async function VisualAnalysisPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, subscription_status")
    .eq("user_id", user.id)
    .single()

  if (!profile?.is_pro || profile?.subscription_status !== "active") {
    redirect("/pricing")
  }

  return <VisualAnalysisPageClient />
}
