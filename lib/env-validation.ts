interface EnvironmentConfig {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  STRIPE_PRO_MONTHLY_PRICE_ID: string
  STRIPE_SINGLE_REPORT_PRICE_ID: string
  NREL_API_KEY: string
  GOOGLE_MAPS_API_KEY: string
  GOOGLE_GEOCODING_API_KEY: string
  GOOGLE_ELEVATION_API_KEY: string
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: string
  RECAPTCHA_SECRET_KEY: string
  RESEND_API_KEY: string
}

export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  const requiredVars: (keyof EnvironmentConfig)[] = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRO_MONTHLY_PRICE_ID",
    "STRIPE_SINGLE_REPORT_PRICE_ID",
    "NREL_API_KEY",
    "GOOGLE_MAPS_API_KEY",
    "GOOGLE_GEOCODING_API_KEY",
    "GOOGLE_ELEVATION_API_KEY",
    "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
    "RECAPTCHA_SECRET_KEY",
    "RESEND_API_KEY",
  ]

  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value || value.trim() === "") {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  }

  // Validate URL formats
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
  }

  // Validate Stripe keys format
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
    errors.push('STRIPE_SECRET_KEY must start with "sk_"')
  }

  if (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_")
  ) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_"')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

export function getEnvironmentReport(): string {
  const { isValid, errors } = validateEnvironment()

  if (isValid) {
    return "✅ All environment variables are properly configured"
  }

  return `❌ Environment validation failed:\n${errors.map((error) => `  - ${error}`).join("\n")}`
}
