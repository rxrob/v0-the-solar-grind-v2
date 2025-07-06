import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { createServiceClient } from "@/lib/supabase-server"

export async function GET() {
  try {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    const envStatus = {
      url: hasUrl,
      anonKey: hasAnonKey,
      serviceKey: hasServiceKey,
      configured: hasUrl && hasAnonKey,
    }

    // Test server client connection
    let serverConnection = { success: false, error: "Not tested" }
    if (envStatus.configured) {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("users").select("count").limit(1)

        if (error) {
          serverConnection = { success: false, error: error.message }
        } else {
          serverConnection = { success: true, error: null }
        }
      } catch (error) {
        serverConnection = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown server error",
        }
      }
    }

    // Test service client connection
    let serviceConnection = { success: false, error: "Not tested" }
    if (hasServiceKey) {
      try {
        const serviceClient = createServiceClient()
        const { data, error } = await serviceClient.from("users").select("count").limit(1)

        if (error) {
          serviceConnection = { success: false, error: error.message }
        } else {
          serviceConnection = { success: true, error: null }
        }
      } catch (error) {
        serviceConnection = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown service error",
        }
      }
    }

    // Test auth
    let authStatus = { success: false, error: "Not tested" }
    if (envStatus.configured) {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          authStatus = { success: false, error: error.message }
        } else {
          authStatus = { success: true, error: null }
        }
      } catch (error) {
        authStatus = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown auth error",
        }
      }
    }

    return NextResponse.json({
      environment: envStatus,
      connections: {
        server: serverConnection,
        service: serviceConnection,
        auth: authStatus,
      },
      overall: {
        configured: envStatus.configured,
        operational: envStatus.configured && serverConnection.success,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Supabase status check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check Supabase status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
