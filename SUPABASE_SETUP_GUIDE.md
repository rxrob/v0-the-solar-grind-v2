# Supabase Setup Guide for Solar Grind

This guide will walk you through setting up Supabase authentication for your Solar Grind application.

## 🚀 Quick Start

### Step 1: Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email

### Step 2: Create a New Project

1. Click "New Project"
2. Choose your organization
3. Enter project details:
   - **Name**: `solar-grind` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### Step 3: Get Your API Credentials

1. In your project dashboard, go to **Settings** → **API**
2. You'll see three important values:

\`\`\`env
# Copy these EXACT values to your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### Step 4: Configure Your Environment

1. Create a `.env.local` file in your project root
2. Copy the contents from `.env.local.example`
3. Replace the placeholder values with your real Supabase credentials
4. Save the file

### Step 5: Set Up Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`

### Step 6: Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Get these from [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`

### Step 7: Set Up Database Tables

The application will automatically create the necessary tables when you first run it. The required tables are:

- `users` - User profiles and subscription info
- `user_projects` - Solar projects for each user
- `solar_calculations` - Calculation history

### Step 8: Test Your Setup

1. Restart your development server: `npm run dev`
2. Visit `http://localhost:3000/login`
3. Try signing up with email or Google
4. Check the Supabase dashboard to see if users are created

## 🔧 Troubleshooting

### Common Issues

#### "Invalid API key" Error
- **Cause**: Wrong or missing Supabase credentials
- **Fix**: Double-check your `.env.local` file has the correct values from Supabase dashboard

#### "Project is paused" Error
- **Cause**: Supabase pauses inactive projects
- **Fix**: Go to your Supabase dashboard and click "Resume project"

#### "Auth session missing" Error
- **Cause**: Normal behavior when no user is logged in
- **Fix**: This is expected - not an error

#### Environment Variables Not Loading
- **Cause**: `.env.local` file not in the right location or server not restarted
- **Fix**: 
  1. Ensure `.env.local` is in your project root (same level as `package.json`)
  2. Restart your development server
  3. Check that variables start with `NEXT_PUBLIC_` for client-side access

### Diagnostic Tools

Use the built-in diagnostic tools to troubleshoot:

1. **Configuration Diagnostic**: Visit `/api/diagnose-supabase`
2. **Login Page Diagnostic**: Click "Diagnose Configuration" on the login page
3. **Environment Check**: Visit `/environment-check`

### Getting Help

If you're still having issues:

1. Check the browser console for error messages
2. Check the server console (terminal) for server-side errors
3. Verify your Supabase project is active (not paused)
4. Ensure your API keys are copied completely (they're very long!)

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## 🔐 Security Notes

- Never commit your `.env.local` file to version control
- Use different Supabase projects for development and production
- Regularly rotate your service role key
- Enable Row Level Security (RLS) on your database tables
- Use the anon key for client-side operations only
- Use the service role key for server-side operations only

## 🚀 Production Deployment

When deploying to production:

1. Create a new Supabase project for production
2. Update your environment variables in your hosting platform
3. Update the Site URL and Redirect URLs in Supabase settings
4. Enable RLS policies on your database tables
5. Test authentication flows thoroughly

Your Solar Grind application should now be ready with full authentication support!
