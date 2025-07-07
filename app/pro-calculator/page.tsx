import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { SmartSolarAnalysis } from "@/components/smart-solar-analysis"
import { Crown } from "lucide-react"

export default async function ProCalculatorPage() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pro Solar Calculator</h1>
              <p className="text-gray-600 mt-2">Advanced solar analysis with AI-powered insights</p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-yellow-500" />
              Pro User
            </Badge>
          </div>
        </div>

        <SmartSolarAnalysis />
      </div>
    </div>
  )
}
