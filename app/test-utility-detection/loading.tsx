import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 text-orange-400 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Loading Test Suite</h2>
        <p className="text-gray-400">Initializing utility detection tests...</p>
      </div>
    </div>
  )
}
