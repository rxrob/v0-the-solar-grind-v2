// Environment variable validation (server-side only for sensitive keys)
export function validateServerEnvironment() {
  const requiredServerVars = [
    "NREL_API_KEY",
    "GOOGLE_ELEVATION_API_KEY",
    "GOOGLE_GEOCODING_API_KEY",
    "GOOGLE_MAPS_API_KEY", // Server-side only now
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "RECAPTCHA_SECRET_KEY", // Server-side only
    "SUPABASE_SERVICE_ROLE_KEY",
  ]

  const missing = requiredServerVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.warn(`Missing required server environment variables: ${missing.join(", ")}`)
    return false
  }

  return true
}

export function validateClientEnvironment() {
  const requiredClientVars = [
    "NEXT_PUBLIC_BASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    // Note: Google Maps API key handled server-side only for security
  ]

  const missing = requiredClientVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.warn(`Missing client environment variables: ${missing.join(", ")}`)
    return false
  }

  return true
}

// Get environment status for API responses (server-side only)
export function getEnvironmentStatus() {
  return {
    server: {
      nrel: !!process.env.NREL_API_KEY,
      googleElevation: !!process.env.GOOGLE_ELEVATION_API_KEY,
      googleGeocoding: !!process.env.GOOGLE_GEOCODING_API_KEY,
      googleMaps: !!process.env.GOOGLE_MAPS_API_KEY, // Server-side only
      stripe: !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET,
      recaptcha: !!process.env.RECAPTCHA_SECRET_KEY, // Server-side only
      supabase: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    client: {
      baseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      stripePublishable: !!process.env.STRIPE_PUBLISHABLE_KEY,
      // Google Maps API key handled server-side only for security
    },
  }
}

// Check if critical services are available
export function checkCriticalServices() {
  const serverEnv = validateServerEnvironment()
  const clientEnv = validateClientEnvironment()

  return {
    server: serverEnv,
    client: clientEnv,
    overall: serverEnv && clientEnv,
  }
}
