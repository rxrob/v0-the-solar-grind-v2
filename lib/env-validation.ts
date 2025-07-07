interface EnvValidationResult {
  isValid: boolean
  missing: string[]
  warnings: string[]
}

export function validateStripeEnv(): EnvValidationResult {
  const required = [
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRO_MONTHLY_PRICE_ID",
    "STRIPE_SINGLE_REPORT_PRICE_ID",
  ]

  const missing = required.filter((key) => !process.env[key])
  const warnings: string[] = []

  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
    warnings.push("STRIPE_SECRET_KEY should start with 'sk_'")
  }

  if (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_")
  ) {
    warnings.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should start with 'pk_'")
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

export function validateSupabaseEnv(): EnvValidationResult {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

  const missing = required.filter((key) => !process.env[key])
  const warnings: string[] = []

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("supabase.co")) {
    warnings.push("NEXT_PUBLIC_SUPABASE_URL should be a valid Supabase URL")
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

export function validateGoogleEnv(): EnvValidationResult {
  const required = ["GOOGLE_MAPS_API_KEY", "GOOGLE_ELEVATION_API_KEY", "GOOGLE_GEOCODING_API_KEY"]

  const missing = required.filter((key) => !process.env[key])
  const warnings: string[] = []

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

export function validateAllEnv(): {
  stripe: EnvValidationResult
  supabase: EnvValidationResult
  google: EnvValidationResult
  overall: boolean
} {
  const stripe = validateStripeEnv()
  const supabase = validateSupabaseEnv()
  const google = validateGoogleEnv()

  const overall = stripe.isValid && supabase.isValid && google.isValid

  // Log results in development
  if (process.env.NODE_ENV === "development") {
    console.log("🔐 Environment Validation Results:")
    console.log(
      "Stripe:",
      stripe.isValid ? "✅" : "❌",
      stripe.missing.length ? `Missing: ${stripe.missing.join(", ")}` : "",
    )
    console.log(
      "Supabase:",
      supabase.isValid ? "✅" : "❌",
      supabase.missing.length ? `Missing: ${supabase.missing.join(", ")}` : "",
    )
    console.log(
      "Google:",
      google.isValid ? "✅" : "❌",
      google.missing.length ? `Missing: ${google.missing.join(", ")}` : "",
    )
    console.log("Overall:", overall ? "✅ Ready for production" : "❌ Missing required variables")
  }

  return { stripe, supabase, google, overall }
}
