import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

// Force dynamic rendering to prevent build-time auth issues
export const dynamic = "force-dynamic"

export default async function ReportsPage() {
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
            <h1 className="text-4xl font-bold text-white mb-4">Solar Reports</h1>
            <p className="text-xl text-gray-300">Access your comprehensive solar analysis reports</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Reports</h3>
              <p className="text-gray-300">View your latest solar analysis reports</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Saved Projects</h3>
              <p className="text-gray-300">Access your saved solar projects</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4">Analytics</h3>
              <p className="text-gray-300">View detailed performance analytics</p>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Reports page error:", error)
    redirect("/login")
  }
}
