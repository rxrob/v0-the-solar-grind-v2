# Environment Setup Guide

This guide explains how to set up all the required environment variables for The Solar Grind V2 application.

## Security Architecture

This application follows a **server-side first** security model:

- **Client-side variables**: Only safe, public keys (prefixed with `NEXT_PUBLIC_`)
- **Server-side variables**: All sensitive API keys and secrets
- **Secure delivery**: Configuration delivered via API endpoints when needed

## Required Environment Variables

### 1. Supabase (Database & Authentication)

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
\`\`\`

**Setup Instructions:**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy the Project URL and anon key (these are safe for client-side)
4. Copy the service_role key (keep this server-side only)

### 2. Stripe (Payment Processing)

\`\`\`bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID=price_...
\`\`\`

**Setup Instructions:**
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get publishable key from Dashboard > Developers > API keys (safe for client-side)
3. Get secret key from the same location (keep server-side only)
4. Set up webhook endpoint for `/api/webhooks` and get webhook secret
5. Create products and get their price IDs

### 3. Google APIs (Server-side Only)

\`\`\`bash
GOOGLE_MAPS_API_KEY=AIza...your-maps-key
GOOGLE_GEOCODING_API_KEY=AIza...your-geocoding-key
GOOGLE_ELEVATION_API_KEY=AIza...your-elevation-key
GOOGLE_STREET_VIEW_API_KEY=AIza...your-street-view-key
\`\`\`

**Setup Instructions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Elevation API
   - Street View Static API
4. Create API keys with appropriate restrictions
5. **Important**: These keys are server-side only for security

### 4. NREL API (Solar Data)

\`\`\`bash
NREL_API_KEY=your-nrel-api-key
\`\`\`

**Setup Instructions:**
1. Register at [developer.nrel.gov](https://developer.nrel.gov)
2. Request an API key for PVWatts and Solar Resource APIs
3. Keep this key server-side only

### 5. reCAPTCHA (Spam Protection)

\`\`\`bash
RECAPTCHA_SITE_KEY=6Le...your-site-key
RECAPTCHA_SECRET_KEY=6Le...your-secret-key
\`\`\`

**Setup Instructions:**
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha)
2. Register your site for reCAPTCHA v3
3. Get both site key and secret key
4. **Important**: Both keys are server-side only for enhanced security

### 6. Resend (Email Service)

\`\`\`bash
RESEND_API_KEY=re_...your-resend-key
\`\`\`

**Setup Instructions:**
1. Create account at [resend.com](https://resend.com)
2. Generate API key from dashboard
3. Verify your domain for email sending

### 7. Application Configuration

\`\`\`bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT=https://api.axiom.co/v1/datasets/your-dataset/ingest
\`\`\`

## Security Best Practices

### Client vs Server Variables

**✅ Safe for Client (NEXT_PUBLIC_)**:
- Supabase URL and anon key (designed to be public)
- Stripe publishable key (designed to be public)
- Base URL and public configuration
- Stripe price IDs (product identifiers)

**🔒 Server-side Only**:
- All Google API keys
- Supabase service role key
- Stripe secret key and webhook secret
- reCAPTCHA site and secret keys
- NREL API key
- Resend API key

### API Key Security

1. **Google Maps**: Delivered securely via `/api/google-maps-config`
2. **reCAPTCHA**: Site key delivered via `/api/recaptcha-config`
3. **Restrictions**: Set up API key restrictions in Google Cloud Console
4. **Monitoring**: Monitor API usage and set up alerts

### Environment File Security

\`\`\`bash
# Add to .gitignore
.env.local
.env*.local

# Never commit these files
.env.production
.env.development
\`\`\`

## Deployment

### Vercel Deployment

1. Add all environment variables in Vercel dashboard
2. Separate preview and production environments
3. Use different API keys for different environments

### Environment Validation

The application includes built-in environment validation:

\`\`\`typescript
import { validateEnvironment } from '@/lib/env-validation'

const validation = validateEnvironment()
if (!validation.isValid) {
  console.error('Environment validation failed:', validation.errors)
}
\`\`\`

## Troubleshooting

### Common Issues

1. **Supabase Connection**: Check URL format and key validity
2. **Google APIs**: Verify API is enabled and key has correct permissions
3. **Stripe Webhooks**: Ensure webhook endpoint is accessible
4. **reCAPTCHA**: Verify domain is registered for the keys

### Status Endpoints

Check service status via API endpoints:
- `/api/status/supabase` - Supabase connection
- `/api/status/stripe` - Stripe configuration
- `/api/status/google-maps` - Google Maps API
- `/api/status/nrel` - NREL API
- `/api/status/recaptcha` - reCAPTCHA configuration

### Environment Validation

Use the validation utilities:

\`\`\`typescript
import { getServiceStatus } from '@/lib/env-validation'

const status = getServiceStatus()
console.log('Service status:', status)
\`\`\`

## Development vs Production

### Development
- Use test keys for Stripe
- Use localhost for base URL
- Enable debug logging

### Production
- Use live keys for Stripe
- Use production domain for base URL
- Disable debug logging
- Set up monitoring and alerts

## Support

If you encounter issues:
1. Check the status endpoints
2. Validate your environment variables
3. Review the console for error messages
4. Check API quotas and limits
