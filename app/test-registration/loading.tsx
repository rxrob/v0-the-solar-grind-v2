import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestRegistrationLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-96" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-64" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
                  <div className="flex-grow space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
