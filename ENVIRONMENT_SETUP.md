# Environment Variables Setup Guide

This guide will help you set up all the required environment variables for The Solar Grind V2.

## Quick Start

1. Copy the example environment file:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Fill in your API keys in `.env.local`

3. Restart your development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Required API Keys

### Google Maps API Key (CRITICAL for address autocomplete)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable the following APIs**:
   - Places API (New)
   - Geocoding API
   - Static Maps API
   - Street View Static API
   - Elevation API
4. **Create credentials**:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the API key
5. **Add to .env.local**:
   \`\`\`
   GOOGLE_MAPS_API_KEY=AIzaSyC4R6AN7SmxxdKVQjfVR2C_your_actual_key_here
   \`\`\`

### NREL API Key (Required for solar data)

1. **Sign up**: https://developer.nrel.gov/signup/
2. **Get your API key** from the dashboard
3. **Add to .env.local**:
   \`\`\`
   NREL_API_KEY=your_nrel_api_key_here
   \`\`\`

### Supabase (Required for database)

1. **Create project**: https://supabase.com/dashboard
2. **Get your keys** from Settings → API
3. **Add to .env.local**:
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   \`\`\`

### Stripe (Required for payments)

1. **Create account**: https://dashboard.stripe.com/
2. **Get your keys** from Developers → API keys
3. **Add to .env.local**:
   \`\`\`
   STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   \`\`\`

## Verification

After setting up your environment variables:

1. **Check configuration**: Visit `/environment-check`
2. **Test APIs**: Visit `/api-status`
3. **Test address autocomplete**: Visit `/test-address-autocomplete`

## Troubleshooting

### Address autocomplete not working
- Verify `GOOGLE_MAPS_API_KEY` is set correctly
- Check that Places API is enabled in Google Cloud Console
- Ensure billing is set up in Google Cloud Console

### API errors
- Check the `/api-status` page for detailed error messages
- Verify all required APIs are enabled
- Check API quotas and billing

### Database errors
- Verify Supabase credentials are correct
- Check that your Supabase project is active
- Ensure RLS policies are configured correctly

## Security Notes

- Never commit `.env.local` to version control
- Use test keys for development
- Rotate keys regularly in production
- Set up proper API restrictions in Google Cloud Console
