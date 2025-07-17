export default function IonClientsLoading() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto py-8 px-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-64 bg-slate-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-slate-700 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
          <div className="h-10 w-full bg-slate-700 rounded animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-slate-700 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-slate-700 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-slate-700 rounded animate-pulse mb-1"></div>
              <div className="h-3 w-20 bg-slate-700 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Client List Skeleton */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
          <div className="p-6 border-b border-slate-700">
            <div className="h-6 w-48 bg-slate-700 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-80 bg-slate-700 rounded animate-pulse"></div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-slate-600 rounded-full animate-pulse"></div>
                        <div>
                          <div className="h-5 w-48 bg-slate-600 rounded animate-pulse mb-1"></div>
                          <div className="h-3 w-32 bg-slate-600 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="h-4 w-32 bg-slate-600 rounded animate-pulse mb-2"></div>
                          <div className="space-y-2">
                            {[1, 2, 3].map((j) => (
                              <div key={j} className="h-3 w-40 bg-slate-600 rounded animate-pulse"></div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="h-4 w-24 bg-slate-600 rounded animate-pulse mb-2"></div>
                          <div className="space-y-2">
                            {[1, 2, 3].map((j) => (
                              <div key={j} className="h-3 w-36 bg-slate-600 rounded animate-pulse"></div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="h-4 w-28 bg-slate-600 rounded animate-pulse mb-2"></div>
                        <div className="h-3 w-64 bg-slate-600 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-16 bg-slate-600 rounded animate-pulse"></div>
                        <div className="h-6 w-20 bg-slate-600 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="h-8 w-8 bg-slate-600 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-slate-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
