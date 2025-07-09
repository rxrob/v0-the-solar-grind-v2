import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ProReportsClientPage } from "@/components/pro-reports-client"
import type { Report } from "@/types"

// This is a Server Component by default (no "use client")
export default async function ProReportsPage() {
  const cookieStore = cookies()

  // ✅ Correctly configure createServerClient with cookie handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.delete({ name, ...options })
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

  // Mock data - in production, fetch from your database
  const reports: Report[] = [
    {
      id: "1",
      title: "Solar Analysis Report - Smith Residence",
      client: "John Smith",
      location: "Los Angeles, CA",
      systemSize: 8.5,
      createdAt: "2024-01-15",
      status: "generated",
    },
    {
      id: "2",
      title: "Solar Proposal - Johnson Home",
      client: "Sarah Johnson",
      location: "Phoenix, AZ",
      systemSize: 6.8,
      createdAt: "2024-01-10",
      status: "generated",
    },
    {
      id: "3",
      title: "Commercial Solar Study - Brown Corp",
      client: "Brown Corporation",
      location: "San Diego, CA",
      systemSize: 45.2,
      createdAt: "2024-01-05",
      status: "pending",
    },
  ]

  // Pass server-fetched data to the client component
  return <ProReportsClientPage reports={reports} />
}
