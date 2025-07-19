"use client"

import { useAuth } from "@/hooks/use-auth-real"
import type { ReactNode } from "react"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
      </div>
    )
  }

  return <>{children}</>
}
