import type React from "react"
import { SiteNavigation } from "@/components/site-navigation"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-900">
      <SiteNavigation />
      {children}
    </div>
  )
}
