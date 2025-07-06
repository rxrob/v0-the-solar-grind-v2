import { z } from "zod"

// Client-side environment schema (only NEXT_PUBLIC_ variables)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
})

// Server-side environment schema (all variables)
const serverEnvSchema = z.object({
  // Public variables (available on both client and server)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),

  // Server-only variables
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  GOOGLE_GEOCODING_API_KEY: z.string().optional(),
  GOOGLE_ELEVATION_API_KEY: z.string().optional(),
  NREL_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Get client-side configuration
export function getClientConfig() {
  if (typeof window === "undefined") {
    throw new Error("getClientConfig can only be called on the client side")
  }

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  }

  const parsed = clientEnvSchema.safeParse(env)

  if (!parsed.success) {
    console.error("Invalid client environment configuration:", parsed.error.format())
    return {}
  }

  return {
    supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    googleMapsApiKey: parsed.data.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    stripePublishableKey: parsed.data.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    recaptchaSiteKey: parsed.data.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    baseUrl: parsed.data.NEXT_PUBLIC_BASE_URL,
  }
}

// Get server-side configuration
export function getServerConfig() {
  if (typeof window !== "undefined") {
    throw new Error("getServerConfig can only be called on the server side")
  }

  const parsed = serverEnvSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error("Invalid server environment configuration:", parsed.error.format())
    throw new Error("Invalid server environment configuration")
  }

  return {
    // Public variables
    supabaseUrl: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    googleMapsApiKeyPublic: parsed.data.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    stripePublishableKey: parsed.data.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    recaptchaSiteKey: parsed.data.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    baseUrl: parsed.data.NEXT_PUBLIC_BASE_URL,

    // Server-only variables
    supabaseServiceKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
    googleMapsApiKey: parsed.data.GOOGLE_MAPS_API_KEY,
    googleGeocodingApiKey: parsed.data.GOOGLE_GEOCODING_API_KEY,
    googleElevationApiKey: parsed.data.GOOGLE_ELEVATION_API_KEY,
    nrelApiKey: parsed.data.NREL_API_KEY,
    stripeSecretKey: parsed.data.STRIPE_SECRET_KEY,
    stripeWebhookSecret: parsed.data.STRIPE_WEBHOOK_SECRET,
    stripeProMonthlyPriceId: parsed.data.STRIPE_PRO_MONTHLY_PRICE_ID,
    stripeProMonthlyPriceIdPublic: parsed.data.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    stripeSingleReportPriceId: parsed.data.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID,
    resendApiKey: parsed.data.RESEND_API_KEY,
    recaptchaSecretKey: parsed.data.RECAPTCHA_SECRET_KEY,
    nodeEnv: parsed.data.NODE_ENV,
  }
}

// Check if required environment variables are available
export function isConfigured() {
  try {
    if (typeof window !== "undefined") {
      const config = getClientConfig()
      return !!(config.supabaseUrl && config.supabaseAnonKey)
    } else {
      const config = getServerConfig()
      return !!(config.supabaseUrl && config.supabaseAnonKey)
    }
  } catch {
    return false
  }
}

// Export validated environment for server use
export const env = typeof window === "undefined" ? getServerConfig() : {}
