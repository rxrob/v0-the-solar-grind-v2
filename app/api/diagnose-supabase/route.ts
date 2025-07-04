import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("🔍 Testing Supabase connection...")

    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: supabaseUrl ? "✓ Present" : "✗ Missing",
        supabaseAnonKey: supabaseAnonKey ? "✓ Present" : "✗ Missing",
        supabaseServiceKey: supabaseServiceKey ? "✓ Present" : "✗ Missing",
      },
      validation: {
        urlFormat: supabaseUrl?.includes(".supabase.co") ? "✓ Valid" : "✗ Invalid",
        keyLength: supabaseAnonKey?.length > 100 ? "✓ Valid" : "✗ Invalid",
      },
      connection: {
        status: "unknown",
        error: null as string | null,
      },
      summary: {
        configurationValid: false,
        connectionWorking: false,
        errors: [] as string[],
        nextSteps: [] as string[],
      },
    }

    // Check configuration
    const configErrors = []
    if (!supabaseUrl) configErrors.push("NEXT_PUBLIC_SUPABASE_URL is missing")
    if (!supabaseAnonKey) configErrors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing")
    if (!supabaseUrl?.includes(".supabase.co")) configErrors.push("NEXT_PUBLIC_SUPABASE_URL must contain .supabase.co")

    diagnostics.summary.configurationValid = configErrors.length === 0
    diagnostics.summary.errors = configErrors

    // Test connection if configuration is valid
    if (diagnostics.summary.configurationValid) {
      try {
        const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

        // Test basic connection
        const { data, error } = await supabase.from("users").select("count").limit(1)

        if (error) {
          diagnostics.connection.status = "failed"
          diagnostics.connection.error = error.message
          diagnostics.summary.errors.push(`Connection failed: ${error.message}`)
        } else {
          diagnostics.connection.status = "success"
          diagnostics.summary.connectionWorking = true
          console.log("✅ Connection test passed")
        }
      } catch (connectionError: any) {
        diagnostics.connection.status = "error"
        diagnostics.connection.error = connectionError.message
        diagnostics.summary.errors.push(`Connection error: ${connectionError.message}`)
      }
    }

    // Generate next steps
    if (!diagnostics.summary.configurationValid) {
      diagnostics.summary.nextSteps.push("Fix environment variable configuration")
      diagnostics.summary.nextSteps.push("Check your .env.local file")
      diagnostics.summary.nextSteps.push("Verify Supabase project settings")
    }

    if (!diagnostics.summary.connectionWorking && diagnostics.summary.configurationValid) {
      diagnostics.summary.nextSteps.push("Check Supabase project status")
      diagnostics.summary.nextSteps.push("Verify API keys are correct")
      diagnostics.summary.nextSteps.push("Check database tables exist")
    }

    console.log("📊 Diagnostics complete:", diagnostics.summary.configurationValid ? "configured" : "needs setup")

    return NextResponse.json({
      success: true,
      diagnostics,
      summary: diagnostics.summary,
    })
  } catch (error: any) {
    console.error("❌ Diagnostics failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        help: {
          possibleCauses: [
            "Environment variables not set correctly",
            "Supabase project not configured",
            "Network connectivity issues",
            "Invalid API keys",
          ],
          nextSteps: [
            "Check your .env.local file",
            "Verify Supabase project settings",
            "Test network connectivity",
            "Regenerate API keys if needed",
          ],
        },
      },
      { status: 500 },
    )
  }
}
