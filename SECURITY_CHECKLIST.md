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
GOOGLE_MAPS_API_KEY=AIza...             # 🔐 SENSITIVE - API access
STRIPE_WEBHOOK_SECRET=whsec_...         # 🔐 SENSITIVE - Webhook verification
RESEND_API_KEY=re_...                   # 🔐 SENSITIVE - Email service
\`\`\`

#### ✅ Client-Safe Variables (Prefixed with NEXT_PUBLIC_)
\`\`\`bash
# These are safe to expose to the browser
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lf...
NEXT_PUBLIC_BASE_URL=https://...
NEXT_PUBLIC_SOLAR_API_KEY=...           # Required for Google Solar API on client
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
**Version**: 2.1
