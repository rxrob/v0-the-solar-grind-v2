import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { VisualAnalysisPageClient } from "@/components/visual-analysis-page-client"

export default async function VisualAnalysisPage() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {
          // This is a server component, so we don't need to set cookies here.
          // The client-side Supabase instance will handle that.
        },
        remove() {
          // This is a server component, so we don't need to remove cookies here.
          // The client-side Supabase instance will handle that.
        },
      },
    },
  )

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
    .maybeSingle()

  if (!profile?.is_pro || profile?.subscription_status !== "active") {
    redirect("/pricing")
  }

  return <VisualAnalysisPageClient />
}
