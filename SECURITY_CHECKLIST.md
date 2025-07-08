# 🔒 Solar Grind V2 Security Checklist

## 🚨 Critical Security Requirements

### 1. Environment Variables Security

#### ✅ Server-Only Secrets (NEVER expose to client)
\`\`\`bash
# These MUST remain server-side only
STRIPE_SECRET_KEY=sk_live_...           # ⚠️ CRITICAL - Payment processing
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # ⚠️ CRITICAL - Database admin access
RECAPTCHA_SECRET_KEY=6Lf...             # ⚠️ CRITICAL - Bot protection
NREL_API_KEY=your_nrel_key              # 🔐 SENSITIVE - API access
GOOGLE_ELEVATION_API_KEY=AIza...        # 🔐 SENSITIVE - API access
GOOGLE_GEOCODING_API_KEY=AIza...        # 🔐 SENSITIVE - API access
STRIPE_WEBHOOK_SECRET=whsec_...         # 🔐 SENSITIVE - Webhook verification
RESEND_API_KEY=re_...                   # 🔐 SENSITIVE - Email service
\`\`\`

#### ✅ Client-Safe Variables (Prefixed with NEXT_PUBLIC_)
\`\`\`bash
# These are safe to expose to the browser
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lf...
NEXT_PUBLIC_BASE_URL=https://...
\`\`\`

### 2. Pre-Deployment Security Validation

#### Run Security Check Script
\`\`\`bash
npm run security-check
\`\`\`

#### Manual Verification Checklist
- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets in client-side code
- [ ] All API keys have domain restrictions
- [ ] Stripe webhooks are properly secured
- [ ] Supabase RLS policies are enabled
- [ ] reCAPTCHA is configured for production

### 3. API Security Configuration

#### Google APIs Domain Restrictions
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. For each API key, set HTTP referrers:
   \`\`\`
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   \`\`\`

#### Stripe Security Settings
1. Configure webhook endpoints in Stripe Dashboard
2. Set webhook URL: `https://yourdomain.com/api/webhooks/stripe`
3. Enable events: `customer.subscription.*`, `invoice.*`
4. Verify webhook secret matches environment variable

#### Supabase Security
1. Enable Row Level Security (RLS) on all tables
2. Configure authentication providers
3. Set up proper database policies
4. Verify service role key is secure

### 4. Production Deployment Steps

#### Vercel Environment Variables
1. Go to Vercel Dashboard > Project > Settings > Environment Variables
2. Add all production environment variables
3. Ensure sensitive keys are marked as "Sensitive"
4. Test deployment with environment validation

#### Domain Security
\`\`\`bash
# Add these headers to next.config.mjs
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
\`\`\`

### 5. Monitoring & Incident Response

#### Security Monitoring
- [ ] Set up Vercel Analytics
- [ ] Configure error tracking (Sentry/Axiom)
- [ ] Monitor API usage patterns
- [ ] Set up alerts for unusual activity

#### Incident Response Plan
1. **Immediate Response** (0-15 minutes)
   - Rotate compromised API keys
   - Disable affected services
   - Document the incident

2. **Investigation** (15-60 minutes)
   - Identify scope of compromise
   - Check logs for unauthorized access
   - Assess data exposure

3. **Recovery** (1-4 hours)
   - Deploy security patches
   - Update all affected credentials
   - Verify system integrity

4. **Post-Incident** (24-48 hours)
   - Conduct security review
   - Update security procedures
   - Notify affected users if required

### 6. Regular Security Maintenance

#### Weekly Tasks
- [ ] Review access logs
- [ ] Check for dependency updates
- [ ] Monitor API usage quotas
- [ ] Verify backup integrity

#### Monthly Tasks
- [ ] Rotate API keys (if required)
- [ ] Review user permissions
- [ ] Update security documentation
- [ ] Conduct security scan

#### Quarterly Tasks
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Review and update policies
- [ ] Team security training

### 7. Emergency Contacts & Procedures

#### Key Contacts
- **Technical Lead**: [Your Email]
- **Security Team**: [Security Email]
- **Vercel Support**: support@vercel.com
- **Stripe Support**: support@stripe.com

#### Emergency Procedures
\`\`\`bash
# Emergency API key rotation
npm run rotate-keys

# Emergency deployment rollback
vercel rollback

# Emergency service shutdown
npm run emergency-shutdown
\`\`\`

### 8. Compliance & Legal

#### Data Protection
- [ ] GDPR compliance for EU users
- [ ] CCPA compliance for California users
- [ ] Data retention policies
- [ ] User consent management

#### Terms & Privacy
- [ ] Privacy policy updated
- [ ] Terms of service current
- [ ] Cookie policy compliant
- [ ] Data processing agreements

---

## 🛡️ Security Validation Commands

\`\`\`bash
# Check for exposed secrets
npm run check-secrets

# Validate environment setup
npm run validate-env

# Test API security
npm run test-security

# Generate security report
npm run security-report
\`\`\`

## 📞 Emergency Response

If you suspect a security breach:
1. **Immediately** run: `npm run emergency-lockdown`
2. Contact security team: security@yourdomain.com
3. Document everything
4. Do not attempt to "fix" without consultation

---

**Last Updated**: [Current Date]
**Next Review**: [Date + 3 months]
**Version**: 2.0
\`\`\`

```plaintext file=".env.local.example"
# 🔒 Solar Grind V2 Environment Variables
# Copy this file to .env.local and fill in your actual values
# NEVER commit .env.local to version control!

# ==========================================
# 🚨 CRITICAL SECRETS (Server-side only)
# ==========================================

# Stripe Configuration (KEEP SECRET!)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Service Role (ADMIN ACCESS - KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Keys (KEEP SECRET!)
NREL_API_KEY=your_nrel_api_key_here
GOOGLE_ELEVATION_API_KEY=AIzaSyC_your_elevation_api_key_here
GOOGLE_GEOCODING_API_KEY=AIzaSyC_your_geocoding_api_key_here

# reCAPTCHA Secret (KEEP SECRET!)
RECAPTCHA_SECRET_KEY=6LfYour_recaptcha_secret_key_here

# Email Service (KEEP SECRET!)
RESEND_API_KEY=re_your_resend_api_key_here

# ==========================================
# 🌐 PUBLIC VARIABLES (Client-safe)
# ==========================================

# Supabase Public Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Maps (with domain restrictions)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC_your_maps_api_key_here

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# reCAPTCHA Site Key
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6LfYour_recaptcha_site_key_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_price_id
NEXT_PUBLIC_STRIPE_SINGLE_REPORT_PRICE_ID=price_your_single_report_price_id
STRIPE_PRO_MONTHLY_PRICE_ID=price_your_pro_monthly_price_id
STRIPE_SINGLE_REPORT_PRICE_ID=price_your_single_report_price_id

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT=https://api.axiom.co/v1/datasets/your-dataset/ingest

# ==========================================
# 📋 SETUP INSTRUCTIONS
# ==========================================

# 1. SUPABASE SETUP
# - Create project at https://supabase.com
# - Go to Settings > API to get URL and keys
# - Run the SQL scripts in /scripts/ folder
# - Enable Row Level Security on all tables

# 2. STRIPE SETUP
# - Create account at https://stripe.com
# - Get API keys from Dashboard > Developers > API keys
# - Create products and prices for Pro subscription and single reports
# - Set up webhook endpoint: https://yourdomain.com/api/webhooks/stripe

# 3. GOOGLE APIS SETUP
# - Go to https://console.cloud.google.com
# - Enable: Maps JavaScript API, Geocoding API, Elevation API
# - Create API keys with domain restrictions
# - Set HTTP referrers to your domain

# 4. NREL API SETUP
# - Register at https://developer.nrel.gov/signup/
# - Get API key for PVWatts and Solar Resource APIs

# 5. RECAPTCHA SETUP
# - Go to https://www.google.com/recaptcha/admin
# - Create v2 "I'm not a robot" site
# - Add your domain to the site list

# 6. RESEND SETUP (Optional - for emails)
# - Create account at https://resend.com
# - Get API key from dashboard
# - Verify your sending domain

# ==========================================
# 🔍 VERIFICATION CHECKLIST
# ==========================================

# Before deploying to production:
# □ All API keys are valid and active
# □ Stripe webhook endpoint is configured
# □ Supabase RLS policies are enabled
# □ Google APIs have domain restrictions
# □ reCAPTCHA is configured for your domain
# □ .env.local is in .gitignore
# □ No secrets are exposed in client code

# ==========================================
# 🚨 SECURITY WARNINGS
# ==========================================

# NEVER:
# - Commit .env.local to version control
# - Share secret keys in chat/email
# - Use production keys in development
# - Expose server-side keys to client code

# ALWAYS:
# - Use environment variables in Vercel dashboard for production
# - Rotate keys if compromised
# - Monitor API usage for unusual activity
# - Keep this file updated with new variables

# ==========================================
# 🆘 EMERGENCY PROCEDURES
# ==========================================

# If keys are compromised:
# 1. Immediately rotate all affected keys
# 2. Update environment variables in Vercel
# 3. Redeploy the application
# 4. Monitor for unauthorized usage
# 5. Document the incident

# Emergency contacts:
# - Technical Lead: your-email@domain.com
# - Stripe Support: https://support.stripe.com
# - Supabase Support: https://supabase.com/support
