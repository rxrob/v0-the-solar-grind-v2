import { NextResponse } from "next/server"
import { createSupabaseServerClient, testServerConnection, testDatabaseConnection } from "@/lib/supabase-server"
import { getClientStatus } from "@/lib/supabase-client"

export async function GET() {
  try {
    console.log("🔍 Starting Supabase diagnostics...")

    // Environment check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    const envStatus = {
      url: supabaseUrl ? "Set" : "Missing",
      anonKey: supabaseAnonKey ? "Set" : "Missing",
      serviceKey: supabaseServiceKey ? "Set" : "Missing",
      configured: !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey),
    }

    console.log("📋 Environment status:", envStatus)

    // Client status
    const clientStatus = getClientStatus()
    console.log("👤 Client status:", clientStatus)

    // Server connection test
    console.log("🔌 Testing server connection...")
    const serverTest = await testServerConnection()
    console.log("🔌 Server test result:", serverTest)

    // Database connection test
    console.log("🗄️ Testing database connection...")
    const dbTest = await testDatabaseConnection()
    console.log("🗄️ Database test result:", dbTest)

    // Auth test
    console.log("🔐 Testing auth...")
    let authTest = { success: false, error: "Not tested" }
    try {
      const supabase = createSupabaseServerClient()
      const { data, error } = await supabase.auth.getSession()
      authTest = {
        success: !error,
        error: error?.message || null,
      }
    } catch (error) {
      authTest = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown auth error",
      }
    }
    console.log("🔐 Auth test result:", authTest)

    const diagnostics = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: envStatus,
      client: clientStatus,
      server: serverTest,
      database: dbTest,
      auth: authTest,
      overall: {
        healthy: envStatus.configured && clientStatus.configured && serverTest.success,
        issues: [],
      },
    }

    // Collect issues
    if (!envStatus.configured) {
      diagnostics.overall.issues.push("Environment variables not properly configured")
    }
    if (!clientStatus.configured) {
      diagnostics.overall.issues.push("Client not properly configured")
    }
    if (!serverTest.success) {
      diagnostics.overall.issues.push(`Server connection failed: ${serverTest.error}`)
    }
    if (!dbTest.success) {
      diagnostics.overall.issues.push(`Database connection failed: ${dbTest.error}`)
    }
    if (!authTest.success) {
      diagnostics.overall.issues.push(`Auth test failed: ${authTest.error}`)
    }

    console.log("✅ Diagnostics completed:", diagnostics.overall)

    return NextResponse.json(diagnostics)
  } catch (error) {
    console.error("❌ Diagnostics error:", error)

    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: new Date().toISOString(),
      environment: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing",
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing",
        configured: false,
      },
      client: { hasInstance: false, configured: false },
      server: { success: false, error: "Failed to test" },
      database: { success: false, error: "Failed to test" },
      auth: { success: false, error: "Failed to test" },
      overall: {
        healthy: false,
        issues: ["Failed to run diagnostics"],
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
