import type React from "react"
import { SiteFooter } from "@/components/site-footer"
import SiteNavigation from "@/components/site-navigation"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col animated-gradient-background">
      <SiteNavigation />
      <main className="flex-grow">{children}</main>
      <SiteFooter />
    </div>
  )
}
