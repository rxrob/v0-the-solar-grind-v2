import type React from "react"
import { AnimatedBG } from "@/components/AnimatedBG"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      <AnimatedBG />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
