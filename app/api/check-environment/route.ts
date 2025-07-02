import { NextResponse } from "next/server"
import { isSupabaseAvailable } from "@/lib/supabase"

export async function GET() {
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

  environment.supabase.configured = isSupabaseAvailable()

  // Check Stripe
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  environment.stripe.secret_key_present = !!stripeSecretKey
  environment.stripe.publishable_key_present = !!stripePublishableKey
  environment.stripe.webhook_secret_present = !!stripeWebhookSecret

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

  // Calculate overall status
  const totalIssues =
    environment.supabase.issues.length +
    environment.stripe.issues.length +
    environment.google.issues.length +
    environment.nrel.issues.length

  const criticalServices = [environment.stripe.configured, environment.google.configured, environment.nrel.configured]
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
  console.log("[SERVER] ✅ === ENVIRONMENT CHECK COMPLETE ===")

  return NextResponse.json(environment)
}
