import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("[SERVER] 🔍 === ENVIRONMENT CHECK START ===")

    const environment = {
      supabase: {
        configured: false,
        url_present: false,
        anon_key_present: false,
        service_role_present: false,
        issues: [] as string[],
      },
      stripe: {
        configured: false,
        secret_key_present: false,
        publishable_key_present: false,
        webhook_secret_present: false,
        pro_monthly_price_id_present: false,
        single_report_price_id_present: false,
        environment_type: "unknown" as "test" | "live" | "unknown",
        issues: [] as string[],
      },
      google: {
        configured: false,
        maps_key_present: false,
        geocoding_key_present: false,
        elevation_key_present: false,
        issues: [] as string[],
      },
      nrel: {
        configured: false,
        api_key_present: false,
        issues: [] as string[],
      },
      resend: {
        configured: false,
        api_key_present: false,
        issues: [] as string[],
      },
      overall: {
        status: "unknown" as "healthy" | "partial" | "critical" | "unknown",
        critical_issues: 0,
        warnings: 0,
      },
    }

    // Check Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    environment.supabase.url_present = !!supabaseUrl
    environment.supabase.anon_key_present = !!supabaseAnonKey
    environment.supabase.service_role_present = !!supabaseServiceKey

    if (!supabaseUrl) {
      environment.supabase.issues.push("NEXT_PUBLIC_SUPABASE_URL is missing")
    } else if (supabaseUrl === "your_supabase_project_url" || supabaseUrl.includes("your-project")) {
      environment.supabase.issues.push("NEXT_PUBLIC_SUPABASE_URL contains placeholder value")
    } else if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
      environment.supabase.issues.push("NEXT_PUBLIC_SUPABASE_URL format is invalid")
    }

    if (!supabaseAnonKey) {
      environment.supabase.issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing")
    } else if (supabaseAnonKey === "your_supabase_anon_key" || supabaseAnonKey.includes("your_")) {
      environment.supabase.issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY contains placeholder value")
    }

    if (!supabaseServiceKey) {
      environment.supabase.issues.push("SUPABASE_SERVICE_ROLE_KEY is missing")
    } else if (supabaseServiceKey === "your_supabase_service_role_key" || supabaseServiceKey.includes("your_")) {
      environment.supabase.issues.push("SUPABASE_SERVICE_ROLE_KEY contains placeholder value")
    }

    environment.supabase.configured = !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey)

    // Check Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    const stripeProMonthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID
    const stripeSingleReportPriceId = process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID

    environment.stripe.secret_key_present = !!stripeSecretKey
    environment.stripe.publishable_key_present = !!stripePublishableKey
    environment.stripe.webhook_secret_present = !!stripeWebhookSecret
    environment.stripe.pro_monthly_price_id_present = !!stripeProMonthlyPriceId
    environment.stripe.single_report_price_id_present = !!stripeSingleReportPriceId

    if (stripeSecretKey) {
      if (stripeSecretKey.startsWith("sk_test_")) {
        environment.stripe.environment_type = "test"
      } else if (stripeSecretKey.startsWith("sk_live_")) {
        environment.stripe.environment_type = "live"
      }
    }

    if (!stripeSecretKey) {
      environment.stripe.issues.push("STRIPE_SECRET_KEY is missing")
    }

    if (!stripePublishableKey) {
      environment.stripe.issues.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing")
    } else {
      const publishableIsTest = stripePublishableKey.startsWith("pk_test_")
      const publishableIsLive = stripePublishableKey.startsWith("pk_live_")
      const secretIsTest = stripeSecretKey?.startsWith("sk_test_")
      const secretIsLive = stripeSecretKey?.startsWith("sk_live_")

      if ((secretIsTest && publishableIsLive) || (secretIsLive && publishableIsTest)) {
        environment.stripe.issues.push("Stripe key environment mismatch (test vs live)")
      }
    }

    if (!stripeWebhookSecret) {
      environment.stripe.issues.push("STRIPE_WEBHOOK_SECRET is missing")
    }

    if (!stripeProMonthlyPriceId) {
      environment.stripe.issues.push("NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID is missing")
    }

    if (!stripeSingleReportPriceId) {
      environment.stripe.issues.push("NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID is missing")
    }

    environment.stripe.configured = environment.stripe.issues.length === 0

    // Check Google APIs
    const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY
    const googleGeocodingKey = process.env.GOOGLE_GEOCODING_API_KEY
    const googleElevationKey = process.env.GOOGLE_ELEVATION_API_KEY

    environment.google.maps_key_present = !!googleMapsKey
    environment.google.geocoding_key_present = !!googleGeocodingKey
    environment.google.elevation_key_present = !!googleElevationKey

    if (!googleMapsKey) {
      environment.google.issues.push("GOOGLE_MAPS_API_KEY is missing")
    }
    if (!googleGeocodingKey) {
      environment.google.issues.push("GOOGLE_GEOCODING_API_KEY is missing")
    }
    if (!googleElevationKey) {
      environment.google.issues.push("GOOGLE_ELEVATION_API_KEY is missing")
    }

    environment.google.configured = environment.google.issues.length === 0

    // Check NREL
    const nrelApiKey = process.env.NREL_API_KEY

    environment.nrel.api_key_present = !!nrelApiKey

    if (!nrelApiKey) {
      environment.nrel.issues.push("NREL_API_KEY is missing")
    }

    environment.nrel.configured = environment.nrel.issues.length === 0

    // Check Resend
    const resendApiKey = process.env.RESEND_API_KEY

    environment.resend.api_key_present = !!resendApiKey

    if (!resendApiKey) {
      environment.resend.issues.push("RESEND_API_KEY is missing")
    }

    environment.resend.configured = environment.resend.issues.length === 0

    // Calculate overall status
    const totalIssues =
      environment.supabase.issues.length +
      environment.stripe.issues.length +
      environment.google.issues.length +
      environment.nrel.issues.length +
      environment.resend.issues.length

    const criticalServices = [
      environment.supabase.configured,
      environment.stripe.configured,
      environment.google.configured,
      environment.nrel.configured,
      environment.resend.configured,
    ]
    const criticalConfigured = criticalServices.filter(Boolean).length

    if (totalIssues === 0) {
      environment.overall.status = "healthy"
    } else if (criticalConfigured >= 2) {
      environment.overall.status = "partial"
    } else {
      environment.overall.status = "critical"
    }

    environment.overall.critical_issues = totalIssues
    environment.overall.warnings = environment.supabase.configured ? 0 : 1

    console.log("[SERVER] 📊 Environment Status:")
    console.log(`[SERVER]    - Overall: ${environment.overall.status}`)
    console.log(`[SERVER]    - Supabase: ${environment.supabase.configured ? "✅" : "❌"}`)
    console.log(`[SERVER]    - Stripe: ${environment.stripe.configured ? "✅" : "❌"}`)
    console.log(`[SERVER]    - Google: ${environment.google.configured ? "✅" : "❌"}`)
    console.log(`[SERVER]    - NREL: ${environment.nrel.configured ? "✅" : "❌"}`)
    console.log(`[SERVER]    - Resend: ${environment.resend.configured ? "✅" : "❌"}`)
    console.log("[SERVER] ✅ === ENVIRONMENT CHECK COMPLETE ===")

    // Test Supabase connection only if configured
    let supabaseConnection = "Not configured"
    if (environment.supabase.configured) {
      try {
        const { createSupabaseServerClient } = await import("@/lib/supabase-server")
        const supabase = createSupabaseServerClient()
        const { data, error } = await supabase.from("users").select("id").limit(1)
        supabaseConnection = error ? `Failed: ${error.message}` : "Success"
      } catch (error) {
        supabaseConnection = `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      }
    }

    const status = {
      supabaseConnection,
      environmentVariables: environment.overall.status,
      environment,
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error("[SERVER] ❌ Environment check failed:", error)
    return NextResponse.json({ error: "Environment check failed" }, { status: 500 })
  }
}
