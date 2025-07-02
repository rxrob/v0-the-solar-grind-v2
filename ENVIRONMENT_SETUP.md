# Environment Setup Guide

This guide will help you configure all the necessary environment variables for the Solar Grind application.

## Required Environment Variables

### 1. Supabase (Database & Authentication)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the following values:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
\`\`\`

### 2. Stripe (Payments)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from Developers → API keys
3. For webhooks, go to Developers → Webhooks

\`\`\`env
STRIPE_SECRET_KEY=sk_test_... (for test) or sk_live_... (for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (for test) or pk_live_... (for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (same as above)
STRIPE_WEBHOOK_SECRET=whsec_... (from webhook endpoint)
STRIPE_PRO_MONTHLY_PRICE_ID=price_... (create a monthly subscription price)
\`\`\`

### 3. Google APIs (Server-side only)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the required APIs:
   - Maps JavaScript API
   - Geocoding API
   - Elevation API
3. Create API credentials

\`\`\`env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_GEOCODING_API_KEY=your_google_geocoding_api_key
GOOGLE_ELEVATION_API_KEY=your_google_elevation_api_key
\`\`\`

### 4. NREL API (Solar Data)

1. Go to [NREL Developer Network](https://developer.nrel.gov)
2. Sign up for an API key
3. Add to your environment:

\`\`\`env
NREL_API_KEY=your_nrel_api_key
\`\`\`

### 5. reCAPTCHA (Form Protection)

1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Create a new site (v2 checkbox)
3. Add your domain
4. Get the secret key (server-side only):

\`\`\`env
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
\`\`\`

### 6. Application Configuration

\`\`\`env
NEXT_PUBLIC_BASE_URL=http://localhost:3000 (for development)
NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT=your_axiom_endpoint (optional)
\`\`\`

## Setup Instructions

1. Copy `.env.local.example` to `.env.local`
2. Fill in all the values with your actual API keys
3. Restart your development server
4. Test each integration using the status endpoints

## Testing Your Configuration

Visit these endpoints to test your configuration:

- `/api/status/all` - Check all services
- `/api/status/supabase` - Test Supabase connection
- `/api/status/stripe` - Test Stripe configuration
- `/api/status/nrel` - Test NREL API
- `/api/status/recaptcha` - Test reCAPTCHA configuration

## Security Notes

- Never commit your `.env.local` file to version control
- Use different API keys for development and production
- Regularly rotate your API keys
- Set up proper domain restrictions for your Google API keys
- Use Stripe test mode during development
- Google Maps API keys are kept server-side only for security

## Troubleshooting

### Common Issues

1. **Supabase "Auth session missing" error**
   - This is normal when not logged in
   - The app will work in demo mode without Supabase

2. **Stripe checkout errors**
   - Make sure you're using the correct test/live keys
   - Check that webhook endpoints are configured

3. **Google Maps not loading**
   - Verify API key has proper permissions
   - Check domain restrictions
   - Ensure billing is enabled in Google Cloud Console

4. **NREL API rate limits**
   - Free tier has limited requests
   - Consider caching responses

For more help, check the console logs or contact support.
