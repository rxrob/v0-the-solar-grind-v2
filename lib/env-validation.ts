// Environment validation for server-side only
export function validateServerEnv() {
  const requiredEnvVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NREL_API_KEY",
    "GOOGLE_MAPS_API_KEY",
    "GOOGLE_GEOCODING_API_KEY",
    "GOOGLE_ELEVATION_API_KEY",
  ]

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
  }

  return true
}

export function getPublicEnvVars() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  }
}
