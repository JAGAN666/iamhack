# Vercel Environment Variables Setup Guide

## Critical Environment Variables Required

Your authentication system needs these environment variables to function properly. These must be set in your Vercel deployment.

## Step 1: Get Supabase Credentials

### 1.1 Get Project URL and Keys
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (starts with `https://xyz.supabase.co`)
   - **Anon (public) key** (starts with `eyJ...`)
   - **Service role (secret) key** (starts with `eyJ...`)

## Step 2: Set Environment Variables in Vercel

### 2.1 Access Vercel Project Settings
1. Go to: https://vercel.com/dashboard
2. Select your project: `frontend`
3. Go to **Settings** → **Environment Variables**

### 2.2 Add Required Environment Variables

Add these three environment variables:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Your Supabase Project URL (e.g., `https://abcdefghijk.supabase.co`)
- **Environment:** Production, Preview, Development (select all)

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Your Supabase Anon Key (long string starting with `eyJ...`)
- **Environment:** Production, Preview, Development (select all)

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your Supabase Service Role Key (long string starting with `eyJ...`)
- **Environment:** Production, Preview, Development (select all)

### 2.3 Save and Redeploy
1. Click **Save** for each variable
2. After adding all three, trigger a new deployment:
   - Go to **Deployments** tab
   - Click **Create Deployment** or trigger a new commit to redeploy

## Step 3: Verify Environment Variables

### 3.1 Check if Variables are Set
After redeployment, you can verify by checking the build logs or by testing API endpoints.

### 3.2 Test Environment Variable Access
Once Vercel protection is disabled, this endpoint should work:
```bash
curl https://your-vercel-url.vercel.app/api/health
```

## Additional Environment Variables (Optional)

These are for email functionality and other features:

```env
# EmailJS (for email notifications)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Polygon RPC (for NFT functionality)
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com

# JWT Secret (for additional security)
JWT_SECRET=your-random-jwt-secret-string
```

## Environment Variables Summary

### Required (Critical for Authentication):
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`

### Optional (for Enhanced Features):
- `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
- `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
- `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
- `NEXT_PUBLIC_POLYGON_RPC_URL`
- `JWT_SECRET`

## Troubleshooting

### Issue: Variables not loading
**Solution:** 
1. Make sure all three required variables are set
2. Ensure they're enabled for Production environment
3. Trigger a new deployment after adding variables

### Issue: Supabase connection fails
**Solution:**
1. Double-check the Project URL format (should include `https://`)
2. Verify the keys are copied completely (they're very long)
3. Make sure there are no extra spaces in the values

### Issue: API still not working
**Solution:**
1. First disable Vercel authentication protection
2. Then check if environment variables are properly set
3. Test API endpoints after both fixes are applied

## Next Steps After Setting Variables

1. **Disable Vercel Protection** (if not done already)
2. **Redeploy** the application
3. **Test API endpoints** to verify they're accessible
4. **Test authentication flow** with demo user and registration

Your authentication system will be fully functional once both Vercel protection is disabled and these environment variables are properly configured.