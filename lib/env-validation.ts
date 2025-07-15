// Environment validation for client-side variables only
export const validateClientEnv = () => {
  const requiredClientVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_BASE_URL",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ]

  const missing = requiredClientVars.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required client environment variables: ${missing.join(", ")}`)
  }
}

// Server-side validation (to be used in API routes only)
export const validateServerEnv = () => {
  const requiredServerVars = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "NREL_API_KEY",
    "GOOGLE_MAPS_API_KEY",
    "GOOGLE_GEOCODING_API_KEY",
    "GOOGLE_ELEVATION_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RECAPTCHA_SECRET_KEY",
    "RECAPTCHA_SITE_KEY",
  ]

  const missing = requiredServerVars.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required server environment variables: ${missing.join(", ")}`)
  }
}

export const getClientConfig = () => {
  validateClientEnv()

  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL!,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  }
}
