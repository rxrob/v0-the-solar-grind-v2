// Server-side environment validation
export function validateServerEnv() {
  const requiredServerVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "GOOGLE_MAPS_API_KEY",
    "GOOGLE_GEOCODING_API_KEY",
    "GOOGLE_ELEVATION_API_KEY",
    "NREL_API_KEY",
    "SOLAR_API_KEY", // Server-side only
    "OCR_SPACE_API_KEY", // Server-side only
    "RECAPTCHA_SECRET_KEY", // Server-side only
    "RECAPTCHA_SITE_KEY", // Server-side only
    "RESEND_API_KEY",
  ]

  const missing = requiredServerVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    throw new Error(`Missing required server environment variables: ${missing.join(", ")}`)
  }
}

// Client-side environment validation (only for truly public variables)
export function validateClientEnv() {
  const requiredClientVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_BASE_URL",
  ]

  const missing = requiredClientVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.error(`Missing required client environment variables: ${missing.join(", ")}`)
  }
}
