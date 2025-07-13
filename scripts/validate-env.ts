#!/usr/bin/env node

import { config } from "dotenv"
import { validateServerEnv } from "../lib/env-validation"

// Load environment variables
config({ path: ".env.local" })

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "NREL_API_KEY",
  "GOOGLE_MAPS_API_KEY",
  "GOOGLE_GEOCODING_API_KEY",
  "GOOGLE_ELEVATION_API_KEY",
  "OCR_SPACE_API_KEY", // Server-side only
  "RECAPTCHA_SECRET_KEY", // Server-side only
  "RECAPTCHA_SITE_KEY", // Server-side only
  "SOLAR_API_KEY", // Server-side only
]

const missing = requiredVars.filter((varName) => !process.env[varName])

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:")
  missing.forEach((varName) => console.error(`  - ${varName}`))
  process.exit(1)
} else {
  try {
    validateServerEnv()
    console.log("✅ All required server environment variables are present")
  } catch (error) {
    console.error("❌ Environment validation failed:", error)
    process.exit(1)
  }
  console.log("✅ All required environment variables are present")
}
