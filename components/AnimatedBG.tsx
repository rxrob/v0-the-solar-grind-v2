"use client"

import type React from "react"

import { cn } from "@/lib/utils"

export function AnimatedBG({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("relative min-h-screen w-full overflow-hidden bg-background", className)}>
      <div className="absolute inset-0 z-0 animate-gradient-xy bg-gradient-to-br from-green-300 via-blue-300 to-purple-400 opacity-30 blur-3xl dark:from-green-900 dark:via-blue-900 dark:to-purple-900" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
