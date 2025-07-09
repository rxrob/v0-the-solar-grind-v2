"use client"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { VisualAnalysisPageClient } from "@/components/visual-analysis-page-client"

const presetLocations = [
  { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194, address: "San Francisco, CA" },
  { name: "Austin, TX", lat: 30.2672, lng: -97.7431, address: "Austin, TX" },
  { name: "Denver, CO", lat: 39.7392, lng: -104.9903, address: "Denver, CO" },
  { name: "Phoenix, AZ", lat: 33.4484, lng: -112.074, address: "Phoenix, AZ" },
  { name: "Miami, FL", lat: 25.7617, lng: -80.1918, address: "Miami, FL" },
]

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
