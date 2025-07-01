import { NextResponse } from "next/server"

interface EnvironmentVariable {
  name: string
  value: string | null
  required: boolean
  description: string
  category: string
}

interface CategoryData {
  variables: EnvironmentVariable[]
  total: number
  configured: number
  required: number
  required_configured: number
}

export async function GET() {
  try {
    const environmentVariables: EnvironmentVariable[] = [
      // Database
      {
        name: "NEXT_PUBLIC_SUPABASE_URL",
        value: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
        required: true,
        description: "Supabase project URL for database connection",
        category: "Database",
      },
      {
        name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null,
        required: true,
        description: "Supabase anonymous key for client-side access",
        category: "Database",
      },
      {
        name: "SUPABASE_SERVICE_ROLE_KEY",
        value: process.env.SUPABASE_SERVICE_ROLE_KEY || null,
        required: true,
        description: "Supabase service role key for server-side operations",
        category: "Database",
      },

      // Google Services
      {
        name: "GOOGLE_MAPS_API_KEY",
        value: process.env.GOOGLE_MAPS_API_KEY || null,
        required: true,
        description: "Google Maps API key for map functionality",
        category: "Google Services",
      },
      {
        name: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
        value: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null,
        required: true,
        description: "Google Maps API key for client-side map rendering",
        category: "Google Services",
      },
      {
        name: "GOOGLE_GEOCODING_API_KEY",
        value: process.env.GOOGLE_GEOCODING_API_KEY || null,
        required: true,
        description: "Google Geocoding API key for address conversion",
        category: "Google Services",
      },
      {
        name: "GOOGLE_ELEVATION_API_KEY",
        value: process.env.GOOGLE_ELEVATION_API_KEY || null,
        required: true,
        description: "Google Elevation API key for terrain analysis",
        category: "Google Services",
      },

      // Solar Data
      {
        name: "NREL_API_KEY",
        value: process.env.NREL_API_KEY || null,
        required: true,
        description: "NREL API key for solar irradiance and weather data",
        category: "Solar Data",
      },

      // Payments
      {
        name: "STRIPE_PUBLISHABLE_KEY",
        value: process.env.STRIPE_PUBLISHABLE_KEY || null,
        required: true,
        description: "Stripe publishable key for client-side payment processing",
        category: "Payments",
      },
      {
        name: "STRIPE_SECRET_KEY",
        value: process.env.STRIPE_SECRET_KEY || null,
        required: true,
        description: "Stripe secret key for server-side payment processing",
        category: "Payments",
      },
      {
        name: "STRIPE_WEBHOOK_SECRET",
        value: process.env.STRIPE_WEBHOOK_SECRET || null,
        required: true,
        description: "Stripe webhook secret for secure webhook verification",
        category: "Payments",
      },

      // Security
      {
        name: "RECAPTCHA_SECRET_KEY",
        value: process.env.RECAPTCHA_SECRET_KEY || null,
        required: true,
        description: "reCAPTCHA secret key for server-side verification",
        category: "Security",
      },
      {
        name: "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
        value: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || null,
        required: true,
        description: "reCAPTCHA site key for client-side integration",
        category: "Security",
      },

      // Optional/Development
      {
        name: "NEXT_PUBLIC_BASE_URL",
        value: process.env.NEXT_PUBLIC_BASE_URL || null,
        required: false,
        description: "Base URL for the application (auto-detected if not set)",
        category: "Configuration",
      },
      {
        name: "NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT",
        value: process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT || null,
        required: false,
        description: "Axiom logging endpoint for analytics",
        category: "Analytics",
      },
    ]

    // Group by category
    const categories: Record<string, CategoryData> = {}

    environmentVariables.forEach((env) => {
      if (!categories[env.category]) {
        categories[env.category] = {
          variables: [],
          total: 0,
          configured: 0,
          required: 0,
          required_configured: 0,
        }
      }

      categories[env.category].variables.push(env)
      categories[env.category].total++

      if (env.value) {
        categories[env.category].configured++
      }

      if (env.required) {
        categories[env.category].required++
        if (env.value) {
          categories[env.category].required_configured++
        }
      }
    })

    // Calculate summary
    const totalVariables = environmentVariables.length
    const configuredVariables = environmentVariables.filter((env) => env.value).length
    const requiredVariables = environmentVariables.filter((env) => env.required).length
    const requiredConfigured = environmentVariables.filter((env) => env.required && env.value).length

    const configurationPercentage = Math.round((configuredVariables / totalVariables) * 100)
    const requiredPercentage = Math.round((requiredConfigured / requiredVariables) * 100)

    // Find missing required variables
    const missingRequired = environmentVariables
      .filter((env) => env.required && !env.value)
      .map((env) => ({
        name: env.name,
        description: env.description,
        category: env.category,
      }))

    // Generate recommendations
    const recommendations: string[] = []

    if (missingRequired.length > 0) {
      recommendations.push(`Configure ${missingRequired.length} missing required environment variables`)
    }

    if (requiredPercentage < 100) {
      recommendations.push("Complete required variable configuration for full functionality")
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      recommendations.push("Set NEXT_PUBLIC_BASE_URL for production deployment")
    }

    // Generate environment template
    const envTemplate = environmentVariables
      .map((env) => {
        const comment = `# ${env.description} (${env.required ? "Required" : "Optional"})`
        const line = `${env.name}=${env.value || ""}`
        return `${comment}\n${line}`
      })
      .join("\n\n")

    // Determine overall status
    let status: "complete" | "partial" | "missing"
    let message: string

    if (requiredPercentage === 100) {
      status = "complete"
      message = "All required environment variables are configured"
    } else if (requiredPercentage > 0) {
      status = "partial"
      message = `${requiredConfigured}/${requiredVariables} required variables configured`
    } else {
      status = "missing"
      message = "Critical environment variables are missing"
    }

    return NextResponse.json({
      status,
      message,
      categories,
      missing_required: missingRequired,
      recommendations,
      env_template: envTemplate,
      summary: {
        total_variables: totalVariables,
        configured_variables: configuredVariables,
        required_variables: requiredVariables,
        required_configured: requiredConfigured,
        configuration_percentage: configurationPercentage,
        required_percentage: requiredPercentage,
      },
    })
  } catch (error) {
    console.error("Environment check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check environment configuration",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
