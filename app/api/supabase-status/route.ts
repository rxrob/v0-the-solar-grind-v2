import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { createServiceClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    const results = {
      environment: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      connections: {
        client: { success: false, error: null as string | null },
        server: { success: false, error: null as string | null },
        service: { success: false, error: null as string | null },
      },
      database: {
        accessible: false,
        tablesExist: false,
        error: null as string | null,
      },
      auth: {
        configured: false,
        working: false,
        error: null as string | null,
      },
    }

    // Test server client connection
    try {
      const serverClient = createClient()
      const { data, error } = await serverClient.from("users").select("count").limit(1)

      if (error) {
        results.connections.server.error = error.message
      } else {
        results.connections.server.success = true
        results.database.accessible = true
        results.database.tablesExist = true
      }
    } catch (error) {
      results.connections.server.error = error instanceof Error ? error.message : "Unknown error"
    }

    // Test service client connection
    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const serviceClient = createServiceClient()
        const { data, error } = await serviceClient.from("users").select("count").limit(1)

        if (error) {
          results.connections.service.error = error.message
        } else {
          results.connections.service.success = true
        }
      } else {
        results.connections.service.error = "Service role key not configured"
      }
    } catch (error) {
      results.connections.service.error = error instanceof Error ? error.message : "Unknown error"
    }

    // Test auth configuration
    try {
      const authClient = createClient()
      const {
        data: { session },
        error,
      } = await authClient.auth.getSession()

      if (error) {
        results.auth.error = error.message
      } else {
        results.auth.configured = true
        results.auth.working = true
      }
    } catch (error) {
      results.auth.error = error instanceof Error ? error.message : "Unknown error"
    }

    const overallStatus = {
      healthy: results.connections.server.success && results.database.accessible,
      issues: [
        !results.environment.url && "NEXT_PUBLIC_SUPABASE_URL missing",
        !results.environment.anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY missing",
        !results.environment.serviceKey && "SUPABASE_SERVICE_ROLE_KEY missing",
        !results.connections.server.success && "Server connection failed",
        !results.database.accessible && "Database not accessible",
        !results.auth.configured && "Auth not configured",
      ].filter(Boolean),
    }

    return NextResponse.json({
      success: true,
      status: overallStatus,
      details: results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Supabase status check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Status check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
