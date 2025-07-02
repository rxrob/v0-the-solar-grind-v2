// Environment validation utilities
interface EnvironmentConfig {
  required: string[]
  optional: string[]
  warnings: string[]
}

const ENV_CONFIG: EnvironmentConfig = {
  required: [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_BASE_URL",
  ],
  optional: [
    "GOOGLE_MAPS_API_KEY",
    "GOOGLE_GEOCODING_API_KEY",
    "GOOGLE_ELEVATION_API_KEY",
    "NREL_API_KEY",
    "RECAPTCHA_SECRET_KEY",
    "NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT",
    "STRIPE_PRO_MONTHLY_PRICE_ID",
  ],
  warnings: [],
}

export interface ValidationResult {
  isValid: boolean
  missing: string[]
  warnings: string[]
  configured: string[]
  recommendations: string[]
}

export function validateEnvironment(): ValidationResult {
  const missing: string[] = []
  const configured: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  // Check required environment variables
  ENV_CONFIG.required.forEach((key) => {
    if (process.env[key]) {
      configured.push(key)
    } else {
      missing.push(key)
    }
  })

  // Check optional environment variables
  ENV_CONFIG.optional.forEach((key) => {
    if (process.env[key]) {
      configured.push(key)
    }
  })

  // Specific validations
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (stripeSecret && stripePublishable) {
    const isSecretTest = stripeSecret.startsWith("sk_test_")
    const isPublishableTest = stripePublishable.startsWith("pk_test_")

    if (isSecretTest !== isPublishableTest) {
      warnings.push("Stripe key environment mismatch: secret and publishable keys are from different environments")
      recommendations.push("Ensure both Stripe keys are from the same environment (both test or both live)")
    }
  }

  // Supabase URL validation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.startsWith("https://")) {
    warnings.push("Supabase URL should start with https://")
  }

  // Base URL validation
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (baseUrl && !baseUrl.startsWith("http")) {
    warnings.push("Base URL should start with http:// or https://")
  }

  // Add general recommendations
  if (missing.length > 0) {
    recommendations.push("Copy .env.local.example to .env.local and fill in the missing values")
  }

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    recommendations.push("Add Google Maps API key for enhanced location features")
  }

  if (!process.env.NREL_API_KEY) {
    recommendations.push("Add NREL API key for accurate solar data calculations")
  }

  if (!process.env.RECAPTCHA_SECRET_KEY) {
    recommendations.push("Add reCAPTCHA secret key for form protection")
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    configured,
    recommendations,
  }
}

export function getEnvironmentSummary() {
  const validation = validateEnvironment()

  return {
    ...validation,
    services: {
      supabase: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      stripe: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      googleMaps: !!process.env.GOOGLE_MAPS_API_KEY,
      nrel: !!process.env.NREL_API_KEY,
      recaptcha: !!process.env.RECAPTCHA_SECRET_KEY,
    },
  }
}
