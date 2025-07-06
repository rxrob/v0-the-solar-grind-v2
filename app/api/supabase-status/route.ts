import { NextResponse } from "next/server"
import {
  createSupabaseServerClient,
  testServerConnection,
  testDatabaseConnection,
  getSupabaseServerConfig,
} from "@/lib/supabase-server"

export async function GET() {
  try {
    // Get configuration status
    const config = getSupabaseServerConfig()

    // Test connections
    const serverTest = await testServerConnection()
    const databaseTest = await testDatabaseConnection()

    // Test auth
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
        error: error instanceof Error ? error.message : "Auth test failed",
      }
    }

    return NextResponse.json({
      success: true,
      status: {
        configuration: config,
        connections: {
          server: serverTest,
          database: databaseTest,
          auth: authTest,
        },
        overall: config.isConfigured && serverTest.success && databaseTest.success,
      },
    })
  } catch (error) {
    console.error("Supabase status error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check Supabase status",
        status: {
          configuration: {
            url: "Error",
            anonKey: "Error",
            serviceKey: "Error",
            isConfigured: false,
          },
          connections: {
            server: { success: false, error: "Status check failed" },
            database: { success: false, error: "Status check failed" },
            auth: { success: false, error: "Status check failed" },
          },
          overall: false,
        },
      },
      { status: 500 },
    )
  }
}
