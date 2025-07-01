import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function ToggleGroupDemoLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <Skeleton className="h-10 w-80 mx-auto" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      <div className="flex gap-4 justify-center">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Toggle Groups Loading */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-1">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
            <Skeleton className="h-4 w-40" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-1">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-1">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-52" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-1">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-1">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <div className="space-y-2">
                <div className="flex gap-1">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-16" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-10 w-20" />
                  <Skeleton className="h-10 w-20" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-11 w-20" />
                  <Skeleton className="h-11 w-20" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Solar System Controls Loading */}
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto mt-2" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-1 flex-wrap">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-30" />
                <Skeleton className="h-10 w-36" />
              </div>
              <Skeleton className="h-4 w-44" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-1">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-28" />
              </div>
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Media Player Controls Loading */}
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-8 w-56 mx-auto" />
          <Skeleton className="h-5 w-72 mx-auto mt-2" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-4 w-52" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-1">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-24" />
              </div>
              <Skeleton className="h-4 w-40" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-1">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-10 w-10" />
              </div>
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <div className="flex gap-1">
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-20" />
                </div>
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-1">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-26" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Individual Toggle Components Loading */}
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-8 w-72 mx-auto" />
          <Skeleton className="h-5 w-64 mx-auto mt-2" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-44" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-22" />
                <Skeleton className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-44" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-18" />
                <Skeleton className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-9 w-9" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-11 w-11" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
