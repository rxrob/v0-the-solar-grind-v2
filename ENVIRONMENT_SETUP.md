# Environment Setup Guide

This guide will help you set up all the required environment variables for the Solar Grind application.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Supabase Configuration
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### Stripe Configuration
\`\`\`
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID=price_...
\`\`\`

### Google APIs
\`\`\`
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_GEOCODING_API_KEY=your_google_geocoding_api_key
GOOGLE_ELEVATION_API_KEY=your_google_elevation_api_key
\`\`\`

### NREL API
\`\`\`
NREL_API_KEY=your_nrel_api_key
\`\`\`

### reCAPTCHA
\`\`\`
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
\`\`\`

### Email (Resend)
\`\`\`
RESEND_API_KEY=your_resend_api_key
\`\`\`

### Other
\`\`\`
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT=your_axiom_endpoint
\`\`\`

## Setup Instructions

### 1. Supabase Setup
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and anon key
5. Copy the service_role key (keep this secret!)

### 2. Stripe Setup
1. Go to [stripe.com](https://stripe.com)
2. Create an account and get your API keys
3. Create products and prices for your subscription plans
4. Set up webhooks for your application

### 3. Google APIs Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Elevation API
3. Create API keys and restrict them appropriately

### 4. NREL API Setup
1. Go to [NREL Developer Network](https://developer.nrel.gov)
2. Sign up for an API key
3. This gives you access to PVWatts and solar resource data

### 5. reCAPTCHA Setup
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha)
2. Register your site
3. Get your site key and secret key

## Security Notes

- Never commit your `.env.local` file to version control
- Use different keys for development and production
- Regularly rotate your API keys
- Use environment-specific configurations
- Keep service role keys and secret keys secure

## Testing Your Setup

Run the environment check endpoint to verify all your keys are working:

\`\`\`bash
curl http://localhost:3000/api/check-environment
\`\`\`

This will test all your API connections and report any issues.
\`\`\`

```plaintext file=".env.local.example"
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID=price_...

# Google APIs
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_GEOCODING_API_KEY=your_google_geocoding_api_key
GOOGLE_ELEVATION_API_KEY=your_google_elevation_api_key

# NREL API
NREL_API_KEY=your_nrel_api_key

# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

# Email
RESEND_API_KEY=your_resend_api_key

# Other
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT=your_axiom_endpoint
