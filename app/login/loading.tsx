import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Skeleton className="h-7 w-32 mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-10 w-full" />

          <div className="text-center">
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>

          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-40 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
