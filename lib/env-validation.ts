import { z } from "zod"

// Server-side environment schema
const serverSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),
  NREL_API_KEY: z.string().min(1, "NREL API key is required"),
  GOOGLE_MAPS_API_KEY: z.string().min(1, "Google Maps API key is required"),
  GOOGLE_GEOCODING_API_KEY: z.string().min(1, "Google Geocoding API key is required"),
  GOOGLE_ELEVATION_API_KEY: z.string().min(1, "Google Elevation API key is required"),
  RESEND_API_KEY: z.string().min(1, "Resend API key is required"),
  RECAPTCHA_SECRET_KEY: z.string().min(1, "reCAPTCHA secret key is required"),
})

// Client-side environment schema (only NEXT_PUBLIC_ variables)
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, "Stripe publishable key is required"),
  NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1, "Stripe pro monthly price ID is required"),
  NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID: z.string().min(1, "Stripe single report price ID is required"),
  NEXT_PUBLIC_BASE_URL: z.string().url("Invalid base URL"),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().min(1, "reCAPTCHA site key is required"),
})

// Validate server environment
export function validateServerEnv() {
  try {
    return serverSchema.parse(process.env)
  } catch (error) {
    console.error("❌ Invalid server environment variables:", error)
    throw new Error("Invalid server environment configuration")
  }
}

// Validate client environment
export function validateClientEnv() {
  try {
    return clientSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    })
  } catch (error) {
    console.error("❌ Invalid client environment variables:", error)
    throw new Error("Invalid client environment configuration")
  }
}

// Safe environment variable access
export function getServerEnv(key: keyof z.infer<typeof serverSchema>) {
  const env = process.env[key]
  if (typeof env !== "string" || env.length === 0) {
    throw new Error(`Missing required server environment variable: ${key}`)
  }
  return env
}

export function getClientEnv(key: keyof z.infer<typeof clientSchema>) {
  const env = process.env[key]
  if (typeof env !== "string" || env.length === 0) {
    throw new Error(`Missing required client environment variable: ${key}`)
  }
  return env
}

// Environment status check
export function checkEnvironmentStatus() {
  const status = {
    server: {
      valid: false,
      missing: [] as string[],
      errors: [] as string[],
    },
    client: {
      valid: false,
      missing: [] as string[],
      errors: [] as string[],
    },
  }

  // Check server environment
  try {
    validateServerEnv()
    status.server.valid = true
  } catch (error) {
    status.server.valid = false
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        if (err.code === "invalid_type" && err.received === "undefined") {
          status.server.missing.push(err.path.join("."))
        } else {
          status.server.errors.push(`${err.path.join(".")}: ${err.message}`)
        }
      })
    } else {
      status.server.errors.push(error instanceof Error ? error.message : "Unknown error")
    }
  }

  // Check client environment
  try {
    validateClientEnv()
    status.client.valid = true
  } catch (error) {
    status.client.valid = false
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        if (err.code === "invalid_type" && err.received === "undefined") {
          status.client.missing.push(err.path.join("."))
        } else {
          status.client.errors.push(`${err.path.join(".")}: ${err.message}`)
        }
      })
    } else {
      status.client.errors.push(error instanceof Error ? error.message : "Unknown error")
    }
  }

  return status
}

// Individual environment variable checks
export function checkSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  return {
    url: {
      exists: typeof supabaseUrl === "string" && supabaseUrl.length > 0,
      valid: typeof supabaseUrl === "string" && supabaseUrl.startsWith("https://"),
      value: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "Not set",
    },
    anonKey: {
      exists: typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 0,
      valid: typeof supabaseAnonKey === "string" && supabaseAnonKey.length > 50,
      value: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "Not set",
    },
    serviceKey: {
      exists: typeof supabaseServiceKey === "string" && supabaseServiceKey.length > 0,
      valid: typeof supabaseServiceKey === "string" && supabaseServiceKey.length > 50,
      value: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : "Not set",
    },
  }
}

export function checkStripeConfig() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  return {
    secretKey: {
      exists: typeof stripeSecretKey === "string" && stripeSecretKey.length > 0,
      valid: typeof stripeSecretKey === "string" && stripeSecretKey.startsWith("sk_"),
      value: stripeSecretKey ? `${stripeSecretKey.substring(0, 20)}...` : "Not set",
    },
    publishableKey: {
      exists: typeof stripePublishableKey === "string" && stripePublishableKey.length > 0,
      valid: typeof stripePublishableKey === "string" && stripePublishableKey.startsWith("pk_"),
      value: stripePublishableKey ? `${stripePublishableKey.substring(0, 20)}...` : "Not set",
    },
    webhookSecret: {
      exists: typeof stripeWebhookSecret === "string" && stripeWebhookSecret.length > 0,
      valid: typeof stripeWebhookSecret === "string" && stripeWebhookSecret.startsWith("whsec_"),
      value: stripeWebhookSecret ? `${stripeWebhookSecret.substring(0, 20)}...` : "Not set",
    },
  }
}

export function checkGoogleConfig() {
  const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY
  const googleGeocodingKey = process.env.GOOGLE_GEOCODING_API_KEY
  const googleElevationKey = process.env.GOOGLE_ELEVATION_API_KEY

  return {
    mapsKey: {
      exists: typeof googleMapsKey === "string" && googleMapsKey.length > 0,
      valid: typeof googleMapsKey === "string" && googleMapsKey.length > 20,
      value: googleMapsKey ? `${googleMapsKey.substring(0, 20)}...` : "Not set",
    },
    geocodingKey: {
      exists: typeof googleGeocodingKey === "string" && googleGeocodingKey.length > 0,
      valid: typeof googleGeocodingKey === "string" && googleGeocodingKey.length > 20,
      value: googleGeocodingKey ? `${googleGeocodingKey.substring(0, 20)}...` : "Not set",
    },
    elevationKey: {
      exists: typeof googleElevationKey === "string" && googleElevationKey.length > 0,
      valid: typeof googleElevationKey === "string" && googleElevationKey.length > 20,
      value: googleElevationKey ? `${googleElevationKey.substring(0, 20)}...` : "Not set",
    },
  }
}

export function checkNrelConfig() {
  const nrelApiKey = process.env.NREL_API_KEY

  return {
    apiKey: {
      exists: typeof nrelApiKey === "string" && nrelApiKey.length > 0,
      valid: typeof nrelApiKey === "string" && nrelApiKey.length > 10,
      value: nrelApiKey ? `${nrelApiKey.substring(0, 20)}...` : "Not set",
    },
  }
}
