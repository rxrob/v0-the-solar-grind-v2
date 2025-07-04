# Environment Setup Guide

This guide explains how to set up all the required environment variables for the Solar Analysis application.

## Security Architecture

This application follows a **server-side first** security model:

- **Server-side only**: All API keys that could be abused (Google Maps, NREL, reCAPTCHA)
- **Client-side safe**: Only public keys and configuration that's safe to expose
- **Secure delivery**: Sensitive configuration delivered via secure API endpoints

## Required Environment Variables

### 1. Supabase Database & Authentication

\`\`\`bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
\`\`\`

**Setup:**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to Settings > API
3. Copy the Project URL and anon key (safe for client)
4. Copy the service_role key (server-side only)

### 2. Google APIs (Server-side only)

\`\`\`bash
GOOGLE_MAPS_API_KEY=AIza...your-maps-key
GOOGLE_GEOCODING_API_KEY=AIza...your-geocoding-key
GOOGLE_ELEVATION_API_KEY=AIza...your-elevation-key
\`\`\`

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable APIs: Maps JavaScript API, Geocoding API, Elevation API
4. Create API keys with appropriate restrictions
5. **Important**: These keys are server-side only for security

### 3. NREL Solar Data API

\`\`\`bash
NREL_API_KEY=your-nrel-api-key
\`\`\`

**Setup:**
1. Register at [NREL Developer Network](https://developer.nrel.gov/signup/)
2. Get your API key for PVWatts and Solar Resource APIs
3. Server-side only to prevent quota abuse

### 4. Stripe Payment Processing

\`\`\`bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_...
NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID=price_...
\`\`\`

**Setup:**
1. Create account at [Stripe](https://stripe.com)
2. Get publishable key (safe for client) and secret key (server-side)
3. Create products and get price IDs
4. Set up webhook endpoint for subscription events

### 5. reCAPTCHA (Server-side only)

\`\`\`bash
RECAPTCHA_SITE_KEY=6Le...your-site-key
RECAPTCHA_SECRET_KEY=6Le...your-secret-key
\`\`\`

**Setup:**
1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin)
2. Register your site for reCAPTCHA v2
3. **Important**: Both keys are server-side only
4. Client gets site key via `/api/recaptcha-config`

### 6. Email Service

\`\`\`bash
RESEND_API_KEY=re_...your-resend-key
\`\`\`

**Setup:**
1. Create account at [Resend](https://resend.com)
2. Get API key for transactional emails
3. Server-side only for security

### 7. Application Configuration

\`\`\`bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
\`\`\`

**Setup:**
- Set to your production domain
- Used for OAuth redirects and email links

## Security Best Practices

### ✅ Safe for Client (NEXT_PUBLIC_)
- Supabase URL and anon key
- Stripe publishable key
- Stripe price IDs
- Base URL

### 🔒 Server-side Only
- All Google API keys
- NREL API key
- reCAPTCHA keys
- Stripe secret key
- Supabase service role key
- Email API keys

### 🛡️ Secure Delivery
- reCAPTCHA site key: `/api/recaptcha-config`
- Google Maps config: `/api/google-maps-config`
- Service status: `/api/status/*`

## Development Setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in your actual API keys
3. Never commit `.env.local` to version control
4. Use different keys for development and production

## Production Deployment

1. Set environment variables in your hosting platform
2. Use production API keys and URLs
3. Enable proper CORS and domain restrictions
4. Monitor API usage and quotas

## Troubleshooting

### Check Configuration Status
Visit `/api-status` to see which services are properly configured.

### Common Issues
- **Google Maps not loading**: Check GOOGLE_MAPS_API_KEY is set server-side
- **reCAPTCHA not working**: Verify both RECAPTCHA keys are set
- **Payments failing**: Check Stripe keys and webhook configuration
- **Database errors**: Verify Supabase keys and RLS policies

### Environment Validation
The app includes built-in environment validation that will warn about missing configuration.

## Support

If you encounter issues with environment setup:
1. Check the `/api-status` endpoint
2. Review browser console for client-side errors
3. Check server logs for API key issues
4. Verify all keys are for the correct environment (test vs production)
