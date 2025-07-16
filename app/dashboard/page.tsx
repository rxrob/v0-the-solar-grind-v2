"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthReal } from "@/hooks/use-auth-real"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  const { user, profile, loading, isPro, isIONEmployee } = useAuthReal()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
        return
      }

      // Redirect to appropriate dashboard based on user type
      if (isPro || isIONEmployee) {
        router.push("/dashboard/pro")
      } else {
        router.push("/dashboard/free")
      }
    }
  }, [user, loading, isPro, isIONEmployee, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Loading Dashboard...</h1>
          <p className="text-gray-600">Redirecting you to the appropriate dashboard...</p>
        </div>
      </div>
    </div>
  )
}
