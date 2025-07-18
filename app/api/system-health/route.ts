import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("🔍 Running comprehensive system health check...")

    const healthCheck = {
      timestamp: new Date().toISOString(),
      overall: {
        status: "unknown" as "healthy" | "degraded" | "unhealthy",
        score: 0,
        message: "",
      },
      services: {
        database: {
          status: "unknown" as "healthy" | "degraded" | "unhealthy",
          connection: false,
          tables: [] as string[],
          rls_enabled: false,
          response_time: 0,
        },
        authentication: {
          status: "unknown" as "healthy" | "degraded" | "unhealthy",
          service_available: false,
          session_management: false,
        },
        apis: {
          google_maps: { configured: false, accessible: false },
          google_geocoding: { configured: false, accessible: false },
          google_elevation: { configured: false, accessible: false },
          nrel: { configured: false, accessible: false },
          stripe: { configured: false, accessible: false },
        },
        environment: {
          client_vars: 0,
          server_vars: 0,
          missing_vars: [] as string[],
        },
      },
      performance: {
        database_latency: 0,
        api_response_times: {} as Record<string, number>,
      },
      security: {
        rls_policies: 0,
        environment_secure: false,
        https_enabled: true,
      },
    }

    // Test Database Connection and Performance
    const dbStartTime = Date.now()
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Test connection and get table info
        const { data: tables, error: tablesError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_schema", "public")

        if (!tablesError && tables) {
          healthCheck.services.database.connection = true
          healthCheck.services.database.tables = tables.map((t) => t.table_name)
          healthCheck.services.database.response_time = Date.now() - dbStartTime
          healthCheck.services.database.status = "healthy"
        }

        // Test authentication service
        try {
          const { data: authData, error: authError } = await supabase.auth.getSession()
          healthCheck.services.authentication.service_available = !authError
          healthCheck.services.authentication.session_management = true
          healthCheck.services.authentication.status = "healthy"
        } catch (authError) {
          healthCheck.services.authentication.status = "degraded"
        }

        // Check RLS policies
        const { data: policies, error: policiesError } = await supabase.from("pg_policies").select("*")

        if (!policiesError && policies) {
          healthCheck.security.rls_policies = policies.length
          healthCheck.services.database.rls_enabled = policies.length > 0
        }
      } else {
        healthCheck.services.database.status = "unhealthy"
        healthCheck.services.authentication.status = "unhealthy"
      }
    } catch (dbError) {
      console.error("Database health check failed:", dbError)
      healthCheck.services.database.status = "unhealthy"
    }

    healthCheck.performance.database_latency = Date.now() - dbStartTime

    // Test API Integrations
    const apiTests = [
      { name: "google_maps", endpoint: "/api/status/google-maps" },
      { name: "google_geocoding", endpoint: "/api/status/google-geocoding" },
      { name: "google_elevation", endpoint: "/api/status/google-elevation" },
      { name: "nrel", endpoint: "/api/status/nrel" },
      { name: "stripe", endpoint: "/api/status/stripe" },
    ]

    for (const api of apiTests) {
      const apiStartTime = Date.now()
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${api.endpoint}`)
        const result = await response.json()

        const apiKey = api.name as keyof typeof healthCheck.services.apis
        healthCheck.services.apis[apiKey] = {
          configured: result.configured || false,
          accessible: response.ok,
        }

        healthCheck.performance.api_response_times[api.name] = Date.now() - apiStartTime
      } catch (error) {
        const apiKey = api.name as keyof typeof healthCheck.services.apis
        healthCheck.services.apis[apiKey] = {
          configured: false,
          accessible: false,
        }
        healthCheck.performance.api_response_times[api.name] = -1
      }
    }

    // Check Environment Variables
    const requiredClientVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_BASE_URL",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    ]

    const requiredServerVars = [
      "SUPABASE_SERVICE_ROLE_KEY",
      "GOOGLE_MAPS_API_KEY",
      "GOOGLE_GEOCODING_API_KEY",
      "GOOGLE_ELEVATION_API_KEY",
      "NREL_API_KEY",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ]

    const missingVars = [
      ...requiredClientVars.filter((key) => !process.env[key]),
      ...requiredServerVars.filter((key) => !process.env[key]),
    ]

    healthCheck.services.environment = {
      client_vars: requiredClientVars.filter((key) => process.env[key]).length,
      server_vars: requiredServerVars.filter((key) => process.env[key]).length,
      missing_vars: missingVars,
    }

    healthCheck.security.environment_secure = missingVars.length === 0

    // Calculate Overall Health Score
    let score = 0
    const maxScore = 100

    // Database (30 points)
    if (healthCheck.services.database.status === "healthy") score += 30
    else if (healthCheck.services.database.status === "degraded") score += 15

    // Authentication (20 points)
    if (healthCheck.services.authentication.status === "healthy") score += 20
    else if (healthCheck.services.authentication.status === "degraded") score += 10

    // APIs (25 points)
    const configuredApis = Object.values(healthCheck.services.apis).filter((api) => api.configured).length
    score += (configuredApis / 5) * 25

    // Environment (15 points)
    const totalVars = requiredClientVars.length + requiredServerVars.length
    const configuredVars = totalVars - missingVars.length
    score += (configuredVars / totalVars) * 15

    // Security (10 points)
    if (healthCheck.security.environment_secure) score += 5
    if (healthCheck.security.rls_policies > 0) score += 5

    healthCheck.overall.score = Math.round(score)

    // Determine overall status
    if (score >= 90) {
      healthCheck.overall.status = "healthy"
      healthCheck.overall.message = "All systems operational"
    } else if (score >= 70) {
      healthCheck.overall.status = "degraded"
      healthCheck.overall.message = "Some services need attention"
    } else {
      healthCheck.overall.status = "unhealthy"
      healthCheck.overall.message = "Critical issues detected"
    }

    console.log(
      `✅ System health check complete - Score: ${healthCheck.overall.score}/100 (${healthCheck.overall.status})`,
    )

    return NextResponse.json({
      success: true,
      health: healthCheck,
      recommendations: generateRecommendations(healthCheck),
    })
  } catch (error) {
    console.error("❌ System health check failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Health check failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function generateRecommendations(health: any): string[] {
  const recommendations: string[] = []

  if (health.services.database.status !== "healthy") {
    recommendations.push("Check Supabase configuration and database connection")
  }

  if (health.services.authentication.status !== "healthy") {
    recommendations.push("Verify authentication service configuration")
  }

  if (health.services.environment.missing_vars.length > 0) {
    recommendations.push(
      `Configure missing environment variables: ${health.services.environment.missing_vars.join(", ")}`,
    )
  }

  const unconfiguredApis = Object.entries(health.services.apis)
    .filter(([_, api]: [string, any]) => !api.configured)
    .map(([name, _]) => name)

  if (unconfiguredApis.length > 0) {
    recommendations.push(`Configure API integrations: ${unconfiguredApis.join(", ")}`)
  }

  if (health.security.rls_policies === 0) {
    recommendations.push("Enable Row Level Security policies for data protection")
  }

  if (health.performance.database_latency > 1000) {
    recommendations.push("Database response time is slow - check connection and queries")
  }

  return recommendations
}
