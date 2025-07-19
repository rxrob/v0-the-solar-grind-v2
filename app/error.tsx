"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-orange-500 mb-4">Application Error</h1>
      <h2 className="text-2xl mb-4">Something went wrong!</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        We've encountered an unexpected issue. Please try again. If the problem persists, contact support.
      </p>
      <Button
        onClick={() => reset()}
        className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
      >
        Try again
      </Button>
      {error.digest && <p className="text-xs text-gray-600 mt-8">Error Digest: {error.digest}</p>}
    </div>
  )
}
