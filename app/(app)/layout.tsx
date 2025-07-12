import type React from "react"
import { SiteNavigation } from "@/components/site-navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <SiteNavigation />
      <main className="flex-1">{children}</main>
    </div>
  )
}
