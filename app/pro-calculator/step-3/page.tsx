import { Suspense } from "react"
import Step3Client from "./step-3-client"

export default function Step3Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Step 3: Visual Analysis</h1>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <Step3Client />
      </Suspense>
    </div>
  )
}
