#!/usr/bin/env node

// Server-side environment validation script
const requiredServerVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_BASE_URL",
  "NREL_API_KEY",
  "GOOGLE_MAPS_API_KEY",
  "GOOGLE_GEOCODING_API_KEY",
  "GOOGLE_ELEVATION_API_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RECAPTCHA_SECRET_KEY",
  "RECAPTCHA_SITE_KEY",
]

const requiredClientVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
]

function validateEnvironment() {
  console.log("🔍 Validating environment variables...")

  const missingServer = requiredServerVars.filter((key) => !process.env[key])
  const missingClient = requiredClientVars.filter((key) => !process.env[key])

  if (missingServer.length > 0) {
    console.error("❌ Missing required server environment variables:")
    missingServer.forEach((key) => console.error(`  - ${key}`))
  }

  if (missingClient.length > 0) {
    console.error("❌ Missing required client environment variables:")
    missingClient.forEach((key) => console.error(`  - ${key}`))
  }

  if (missingServer.length === 0 && missingClient.length === 0) {
    console.log("✅ All required environment variables are present")
  } else {
    process.exit(1)
  }
}

validateEnvironment()
