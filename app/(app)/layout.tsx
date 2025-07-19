import type React from "react"
import { SiteNavigation } from "@/components/site-navigation"
import { SiteFooter } from "@/components/site-footer"
import { AnimatedBG } from "@/components/AnimatedBG"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AnimatedBG />
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteNavigation />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </div>
  )
}
