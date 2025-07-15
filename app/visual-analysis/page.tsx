import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

// Force dynamic rendering to prevent build-time auth issues
export const dynamic = "force-dynamic"

export default async function VisualAnalysisPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect("/login")
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Visual Analysis</h1>
            <p className="text-xl text-gray-300">AI-powered visual analysis of your property</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-semibold text-white mb-6">Upload Property Images</h2>
            <div className="border-2 border-dashed border-white/30 rounded-lg p-12 text-center">
              <p className="text-gray-300 text-lg">Drag and drop images here or click to browse</p>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Visual analysis page error:", error)
    redirect("/login")
  }
}
