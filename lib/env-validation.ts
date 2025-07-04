// Environment variable validation utilities

export interface EnvironmentConfig {
  // Supabase
  supabaseUrl: string | undefined
  supabaseAnonKey: string | undefined
  supabaseServiceKey: string | undefined

  // Google APIs (server-side only)
  googleMapsApiKey: string | undefined
  googleGeocodingApiKey: string | undefined
  googleElevationApiKey: string | undefined

  // NREL API
  nrelApiKey: string | undefined

  // Stripe
  stripePublishableKey: string | undefined
  stripeSecretKey: string | undefined
  stripeWebhookSecret: string | undefined
  stripeProMonthlyPriceId: string | undefined
  stripeSingleReportPriceId: string | undefined

  // reCAPTCHA (server-side only)
  recaptchaSiteKey: string | undefined
  recaptchaSecretKey: string | undefined

  // Email
  resendApiKey: string | undefined

  // Base URL
  baseUrl: string | undefined
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return {
    // Supabase
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

    // Google APIs (server-side only)
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    googleGeocodingApiKey: process.env.GOOGLE_GEOCODING_API_KEY,
    googleElevationApiKey: process.env.GOOGLE_ELEVATION_API_KEY,

    // NREL API
    nrelApiKey: process.env.NREL_API_KEY,

    // Stripe
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    stripeProMonthlyPriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    stripeSingleReportPriceId: process.env.NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID,

    // reCAPTCHA (server-side only)
    recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
    recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,

    // Email
    resendApiKey: process.env.RESEND_API_KEY,

    // Base URL
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export function validateEnvironment(): ValidationResult {
  const config = getEnvironmentConfig()
  const errors: string[] = []
  const warnings: string[] = []

  // Required for basic functionality
  if (!config.supabaseUrl) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is required")
  }
  if (!config.supabaseAnonKey) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is required")
  }
  if (!config.baseUrl) {
    warnings.push("NEXT_PUBLIC_BASE_URL is recommended for proper redirects")
  }

  // Server-side required for advanced features
  if (!config.supabaseServiceKey) {
    warnings.push("SUPABASE_SERVICE_ROLE_KEY is required for admin operations")
  }

  // Google APIs
  if (!config.googleMapsApiKey) {
    warnings.push("GOOGLE_MAPS_API_KEY is required for map features")
  }
  if (!config.googleGeocodingApiKey) {
    warnings.push("GOOGLE_GEOCODING_API_KEY is required for address lookup")
  }
  if (!config.googleElevationApiKey) {
    warnings.push("GOOGLE_ELEVATION_API_KEY is required for elevation data")
  }

  // NREL API
  if (!config.nrelApiKey) {
    warnings.push("NREL_API_KEY is required for solar data")
  }

  // Stripe (for payments)
  if (!config.stripePublishableKey) {
    warnings.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required for payments")
  }
  if (!config.stripeSecretKey) {
    warnings.push("STRIPE_SECRET_KEY is required for payment processing")
  }
  if (!config.stripeWebhookSecret) {
    warnings.push("STRIPE_WEBHOOK_SECRET is required for webhook verification")
  }

  // reCAPTCHA
  if (!config.recaptchaSiteKey) {
    warnings.push("RECAPTCHA_SITE_KEY is required for spam protection")
  }
  if (!config.recaptchaSecretKey) {
    warnings.push("RECAPTCHA_SECRET_KEY is required for verification")
  }

  // Email
  if (!config.resendApiKey) {
    warnings.push("RESEND_API_KEY is required for email functionality")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function getServiceStatus() {
  const config = getEnvironmentConfig()

  return {
    supabase: {
      configured: !!(config.supabaseUrl && config.supabaseAnonKey),
      adminConfigured: !!config.supabaseServiceKey,
    },
    googleMaps: {
      configured: !!config.googleMapsApiKey,
    },
    googleGeocoding: {
      configured: !!config.googleGeocodingApiKey,
    },
    googleElevation: {
      configured: !!config.googleElevationApiKey,
    },
    nrel: {
      configured: !!config.nrelApiKey,
    },
    stripe: {
      configured: !!(config.stripePublishableKey && config.stripeSecretKey),
      webhookConfigured: !!config.stripeWebhookSecret,
    },
    recaptcha: {
      configured: !!(config.recaptchaSiteKey && config.recaptchaSecretKey),
    },
    email: {
      configured: !!config.resendApiKey,
    },
  }
}

// Utility to check if a service is available
export function isServiceAvailable(service: keyof ReturnType<typeof getServiceStatus>): boolean {
  const status = getServiceStatus()
  return status[service].configured
}

// Get configuration for client-side use (only public keys)
export function getClientConfig() {
  const config = getEnvironmentConfig()

  return {
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    stripePublishableKey: config.stripePublishableKey,
    stripeProMonthlyPriceId: config.stripeProMonthlyPriceId,
    stripeSingleReportPriceId: config.stripeSingleReportPriceId,
    baseUrl: config.baseUrl,
  }
}

// Get server-only configuration
export function getServerConfig() {
  const config = getEnvironmentConfig()

  return {
    supabaseServiceKey: config.supabaseServiceKey,
    googleMapsApiKey: config.googleMapsApiKey,
    googleGeocodingApiKey: config.googleGeocodingApiKey,
    googleElevationApiKey: config.googleElevationApiKey,
    nrelApiKey: config.nrelApiKey,
    stripeSecretKey: config.stripeSecretKey,
    stripeWebhookSecret: config.stripeWebhookSecret,
    recaptchaSiteKey: config.recaptchaSiteKey,
    recaptchaSecretKey: config.recaptchaSecretKey,
    resendApiKey: config.resendApiKey,
  }
}

// Individual service checks
export const isSupabaseConfigured = () => {
  const config = getEnvironmentConfig()
  return !!(config.supabaseUrl && config.supabaseAnonKey && config.supabaseServiceKey)
}

export const isStripeConfigured = () => {
  const config = getEnvironmentConfig()
  return !!(config.stripePublishableKey && config.stripeSecretKey)
}

export const isGoogleMapsConfigured = () => {
  const config = getEnvironmentConfig()
  return !!config.googleMapsApiKey
}

export const isNRELConfigured = () => {
  const config = getEnvironmentConfig()
  return !!config.nrelApiKey
}

export const isRecaptchaConfigured = () => {
  const config = getEnvironmentConfig()
  return !!(config.recaptchaSiteKey && config.recaptchaSecretKey)
}

export const isResendConfigured = () => {
  const config = getEnvironmentConfig()
  return !!config.resendApiKey
}
