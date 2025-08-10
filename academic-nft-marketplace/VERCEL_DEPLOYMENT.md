# 🚀 Vercel Deployment Guide

## Academic NFT Marketplace - Production Deployment

This guide will help you deploy both the frontend (Next.js) and backend (Node.js API) to Vercel for public launch.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Database** - Set up a production PostgreSQL database (recommended: PlanetScale, Supabase, or Railway)

## 🗄️ Database Setup

### Option 1: PlanetScale (Recommended)
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create a new database
3. Get your connection string from the dashboard
4. Format: `mysql://username:password@host/database?sslaccept=strict`

### Option 2: Supabase
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Get your connection string
5. Format: `postgresql://postgres:[password]@[host]:5432/postgres`

### Option 3: Railway
1. Sign up at [railway.app](https://railway.app)
2. Create a new PostgreSQL service
3. Get your connection string from the dashboard

## 🔧 Environment Variables Setup

### Required Environment Variables for Vercel:

```bash
# Database
DATABASE_URL="your-production-database-connection-string"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Email (Optional - for EmailJS features)
NEXT_PUBLIC_EMAILJS_SERVICE_ID="your-emailjs-service-id"
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID="your-emailjs-template-id"
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY="your-emailjs-public-key"

# Blockchain (Optional - for Web3 features)
NEXT_PUBLIC_POLYGON_RPC_URL="https://polygon-rpc.com"
```

## 📦 Deployment Steps

### Step 1: Prepare Your Repository
1. Push all your code to GitHub
2. Ensure the following files are in your repository root:
   - `vercel.json` ✅ (already configured)
   - `package.json` ✅ (already configured)
   - `api/` directory with serverless functions ✅ (already created)

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a monorepo with Next.js

### Step 3: Configure Build Settings
Vercel should automatically detect the configuration, but verify:
- **Framework Preset**: Next.js
- **Root Directory**: `frontend` (if asked)
- **Build Command**: `npm run build` (uses the frontend package.json)
- **Output Directory**: `.next` (default for Next.js)

### Step 4: Add Environment Variables
1. In your Vercel project dashboard, go to "Settings" > "Environment Variables"
2. Add all the environment variables listed above
3. Make sure to add them for all environments: Production, Preview, and Development

### Step 5: Deploy
1. Click "Deploy"
2. Vercel will build and deploy your application
3. You'll get a URL like `https://your-project.vercel.app`

## 🔄 Database Migration

After deployment, you need to set up your production database:

### Option 1: Using Prisma (if you have it set up)
```bash
# Generate Prisma client for production
npx prisma generate

# Push database schema to production
npx prisma db push --schema=./backend/prisma/schema.prisma
```

### Option 2: Manual Setup (for demo data)
Run these SQL commands in your production database:

```sql
-- Create demo user
INSERT INTO users (id, email, "firstName", "lastName", university, "emailVerified") 
VALUES (
  '08cf72f9-8db2-469c-b9e4-f865e037b25d',
  'demo@student.edu',
  'John',
  'Demo',
  'Eastern Michigan University',
  true
) ON CONFLICT (id) DO NOTHING;

-- Add more demo data as needed
```

## ✅ Verification Checklist

After deployment, test these endpoints:
- [ ] `https://your-app.vercel.app/api/health` - Should return API health status
- [ ] `https://your-app.vercel.app/` - Should load the homepage
- [ ] `https://your-app.vercel.app/login` - Should load login page
- [ ] `https://your-app.vercel.app/tickets` - Should load events page
- [ ] `https://your-app.vercel.app/dashboard` - Should work after login

## 🚨 Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify your DATABASE_URL is correct
   - Check that your database accepts connections from all IPs (0.0.0.0/0)
   - Ensure SSL is properly configured

2. **Build Errors**
   - Check Vercel build logs in the dashboard
   - Verify all dependencies are listed in package.json
   - Ensure TypeScript types are correctly configured

3. **API Routes Not Working**
   - Verify `api/index.ts` is properly configured
   - Check that environment variables are set in Vercel
   - Look at function logs in Vercel dashboard

4. **Frontend/Backend Communication Issues**
   - Ensure NEXT_PUBLIC_API_URL is set to "/" for same-domain requests
   - Check CORS configuration in the API

## 🎯 Production Optimizations

### Performance:
- Images are optimized by Next.js automatically
- API responses are cached where appropriate
- Frontend assets are served via Vercel's CDN

### Security:
- CORS is configured for production domains only
- Environment variables are secure
- HTTPS is enforced by Vercel

### Monitoring:
- Use Vercel Analytics for performance insights
- Monitor function execution times in Vercel dashboard
- Set up error tracking with Sentry (optional)

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to your main branch:
1. Push changes to GitHub
2. Vercel automatically triggers a new deployment
3. Changes go live in ~1-2 minutes

## 📞 Support

If you encounter issues:
1. Check Vercel's deployment logs
2. Review the Vercel documentation
3. Check the GitHub repository for issues

## 🎉 Go Live!

Once everything is working:
1. Set up a custom domain (optional)
2. Enable Vercel Analytics
3. Share your amazing Academic NFT Marketplace with the world!

**Live Demo**: `https://your-app.vercel.app`

---

## 🏆 Features Included in Production

✅ **User Authentication** - Login/Register system
✅ **NFT Management** - View and manage academic NFTs
✅ **Achievement System** - Upload and verify achievements
✅ **Ticketing System** - Exclusive events with NFT discounts
✅ **Responsive Design** - Mobile-friendly interface
✅ **Real-time Features** - Live achievement feed
✅ **Dashboard** - Comprehensive user dashboard
✅ **Clean Production UI** - Polished design for public launch

Your Academic NFT Marketplace is now ready for the world! 🌟
