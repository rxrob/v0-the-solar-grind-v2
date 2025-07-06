import { z } from "zod"

// Server-only environment schema (no sensitive client-exposed variables)
const serverEnvSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase service role key is required"),

  // Google APIs (server-side only - no public exposure)
  GOOGLE_MAPS_API_KEY: z.string().min(1, "Google Maps API key is required"),
  GOOGLE_GEOCODING_API_KEY: z.string().min(1, "Google Geocoding API key is required"),
  GOOGLE_ELEVATION_API_KEY: z.string().min(1, "Google Elevation API key is required"),

  // NREL API (server-side only)
  NREL_API_KEY: z.string().min(1, "NREL API key is required"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
  STRIPE_PUBLISHABLE_KEY: z.string().min(1, "Stripe publishable key is required"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1, "Public Stripe publishable key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe webhook secret is required"),
  STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1, "Stripe Pro monthly price ID is required"),
  NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1, "Public Stripe Pro monthly price ID is required"),
  NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID: z.string().min(1, "Public Stripe single report price ID is required"),

  // reCAPTCHA (server-side only)
  RECAPTCHA_SECRET_KEY: z.string().min(1, "reCAPTCHA secret key is required"),

  // Resend (server-side only)
  RESEND_API_KEY: z.string().min(1, "Resend API key is required"),

  // Base URL
  NEXT_PUBLIC_BASE_URL: z.string().url("Invalid base URL"),

  // Optional
  NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT: z.string().url().optional(),
  VERCEL: z.string().optional(),
})

// Client-safe environment schema (only non-sensitive public variables)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1),
  NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID: z.string().min(1),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT: z.string().url().optional(),
})

// Validate server environment
export function validateServerEnv() {
  try {
    const env = serverEnvSchema.parse(process.env)
    return { success: true, env }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`)
      return {
        success: false,
        error: `Missing or invalid server environment variables:\n${missingVars.join("\n")}`,
        missingVars,
      }
    }
    return {
      success: false,
      error: "Unknown server environment validation error",
      missingVars: [],
    }
  }
}

// Validate client environment
export function validateClientEnv() {
  if (typeof window === "undefined") {
    throw new Error("validateClientEnv can only be called on the client side")
  }

  try {
    const env = clientEnvSchema.parse(process.env)
    return { success: true, env }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`)
      return {
        success: false,
        error: `Missing or invalid client environment variables:\n${missingVars.join("\n")}`,
        missingVars,
      }
    }
    return {
      success: false,
      error: "Unknown client environment validation error",
      missingVars: [],
    }
  }
}

// Get server environment (server-side only)
export function getServerEnv() {
  const result = validateServerEnv()
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.env
}

// Check if specific environment variables are available
export function checkEnvVars(vars: string[]) {
  const missing = vars.filter((varName) => !process.env[varName])
  return {
    allPresent: missing.length === 0,
    missing,
    present: vars.filter((varName) => !!process.env[varName]),
  }
}

// Environment variable groups (server-side only)
export const ENV_GROUPS = {
  supabase: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
  google: ["GOOGLE_MAPS_API_KEY", "GOOGLE_GEOCODING_API_KEY", "GOOGLE_ELEVATION_API_KEY"],
  stripe: [
    "STRIPE_SECRET_KEY",
    "STRIPE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET",
  ],
  nrel: ["NREL_API_KEY"],
  recaptcha: ["RECAPTCHA_SECRET_KEY"],
  resend: ["RESEND_API_KEY"],
} as const

// Check environment group
export function checkEnvGroup(group: keyof typeof ENV_GROUPS) {
  return checkEnvVars(ENV_GROUPS[group])
}

// Get environment status (server-side only)
export function getEnvStatus() {
  const groups = Object.keys(ENV_GROUPS) as (keyof typeof ENV_GROUPS)[]
  const status = groups.reduce(
    (acc, group) => {
      acc[group] = checkEnvGroup(group)
      return acc
    },
    {} as Record<keyof typeof ENV_GROUPS, ReturnType<typeof checkEnvVars>>,
  )

  const allPresent = Object.values(status).every((group) => group.allPresent)
  const totalMissing = Object.values(status).reduce((acc, group) => acc + group.missing.length, 0)

  return {
    allPresent,
    totalMissing,
    groups: status,
  }
}
