#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRO_MONTHLY_PRICE_ID",
  "STRIPE_SINGLE_REPORT_PRICE_ID",
  "NREL_API_KEY",
  "GOOGLE_MAPS_API_KEY",
  "GOOGLE_GEOCODING_API_KEY",
  "GOOGLE_ELEVATION_API_KEY",
  "NEXT_PUBLIC_RECAPTCHA_SITE_KEY",
  "RECAPTCHA_SECRET_KEY",
  "RESEND_API_KEY",
]

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local")
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8")
    envContent.split("\n").forEach((line) => {
      const [key, value] = line.split("=")
      if (key && value) {
        process.env[key.trim()] = value.trim()
      }
    })
  }
}

function validateEnvironment() {
  loadEnvFile()

  const errors = []
  const warnings = []

  console.log("🔍 Validating environment variables...\n")

  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value || value.trim() === "") {
      errors.push(`❌ Missing: ${varName}`)
    } else {
      console.log(`✅ ${varName}: ${value.substring(0, 10)}...`)
    }
  }

  // Additional validations
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !isValidUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    errors.push("❌ NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
  }

  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
    warnings.push('⚠️  STRIPE_SECRET_KEY should start with "sk_"')
  }

  if (
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith("pk_")
  ) {
    warnings.push('⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should start with "pk_"')
  }

  console.log("\n📊 Validation Results:")
  console.log(`✅ Valid variables: ${requiredVars.length - errors.length}/${requiredVars.length}`)

  if (warnings.length > 0) {
    console.log("\n⚠️  Warnings:")
    warnings.forEach((warning) => console.log(`  ${warning}`))
  }

  if (errors.length > 0) {
    console.log("\n❌ Errors:")
    errors.forEach((error) => console.log(`  ${error}`))
    console.log("\n💡 Create a .env.local file with the missing variables")
    process.exit(1)
  }

  console.log("\n🎉 All environment variables are properly configured!")
}

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

validateEnvironment()
