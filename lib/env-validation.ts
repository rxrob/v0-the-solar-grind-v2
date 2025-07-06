import { z } from "zod"

// Client-side environment schema (only NEXT_PUBLIC_ variables)
const clientEnvSchema = z.object({
  supabaseUrl: z.string().url().optional(),
  supabaseAnonKey: z.string().optional(),
  recaptchaSiteKey: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
})

// Server-side environment schema (all variables)
const serverEnvSchema = z.object({
  supabaseUrl: z.string().url().optional(),
  supabaseAnonKey: z.string().optional(),
  supabaseServiceKey: z.string().optional(),
  googleMapsApiKey: z.string().optional(),
  googleGeocodingApiKey: z.string().optional(),
  googleElevationApiKey: z.string().optional(),
  nrelApiKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripeWebhookSecret: z.string().optional(),
  recaptchaSecretKey: z.string().optional(),
  recaptchaSiteKey: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  baseUrl: z.string().url().optional(),
  nodeEnv: z.enum(["development", "production", "test"]).optional(),
})

// Client configuration getter
export function getClientConfig() {
  if (typeof window === "undefined") {
    throw new Error("getClientConfig can only be called on the client")
  }

  return clientEnvSchema.parse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  })
}

// Server configuration getter
export function getServerConfig() {
  if (typeof window !== "undefined") {
    throw new Error("getServerConfig can only be called on the server")
  }

  return serverEnvSchema.parse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    googleGeocodingApiKey: process.env.GOOGLE_GEOCODING_API_KEY,
    googleElevationApiKey: process.env.GOOGLE_ELEVATION_API_KEY,
    nrelApiKey: process.env.NREL_API_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
    recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    nodeEnv: process.env.NODE_ENV as "development" | "production" | "test",
  })
}

// Validation functions
export function validateClientEnv() {
  try {
    return getClientConfig()
  } catch (error) {
    console.error("Client environment validation failed:", error)
    throw error
  }
}

export function validateServerEnv() {
  try {
    return getServerConfig()
  } catch (error) {
    console.error("Server environment validation failed:", error)
    throw error
  }
}

// Type exports
export type ClientConfig = z.infer<typeof clientEnvSchema>
export type ServerConfig = z.infer<typeof serverEnvSchema>
