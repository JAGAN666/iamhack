# 🚀 Supabase Integration Setup Guide

## **Complete Setup Instructions for Academic NFT Marketplace**

This guide will walk you through setting up Supabase for user registration, authentication, and OTP verification.

---

## 📋 **Step 1: Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)** and sign in/create account
2. **Click "New Project"**
3. **Project Settings:**
   - **Organization**: Choose your organization
   - **Name**: `academic-nft-marketplace`
   - **Database Password**: Create a secure password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development

4. **Wait for project creation** (~2-3 minutes)

---

## 🔑 **Step 2: Get API Keys**

Once your project is created:

1. **Go to Project Settings** (gear icon in sidebar)
2. **Click "API" in the left menu**
3. **Copy these values** (you'll need them for environment variables):

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# Public anon key  
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service role key (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ **Step 3: Set Up Database Schema**

1. **Go to SQL Editor** in your Supabase dashboard
2. **Create a new query**
3. **Copy and paste the entire contents** of `supabase-schema.sql`
4. **Click "Run"** to create all tables and policies

This will create:
- ✅ **user_profiles** table with automatic profile creation
- ✅ **achievements** table for academic accomplishments  
- ✅ **nfts** table for blockchain assets
- ✅ **events** table for ticketing system
- ✅ **tickets** table for event tickets
- ✅ **Row Level Security (RLS)** policies
- ✅ **Automatic triggers** for profile creation

---

## 📧 **Step 4: Configure Email Authentication**

1. **Go to Authentication** in your Supabase dashboard
2. **Click "Settings" tab**
3. **Configure Email Templates** (optional but recommended):
   - Go to "Email Templates"
   - Customize "Confirm signup" template
   - Add your branding and custom message

4. **SMTP Settings** (optional - uses Supabase SMTP by default):
   - For production, configure your own SMTP in "SMTP Settings"
   - For development, Supabase's built-in SMTP works fine

---

## ⚙️ **Step 5: Environment Variables**

Create/update these files with your Supabase credentials:

### **Frontend (.env.local)**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration  
NEXT_PUBLIC_APP_NAME=Academic NFT Marketplace
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Vercel Environment Variables**
Add these in your Vercel project settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here  
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

---

## 👤 **Step 6: Add Demo User (Optional)**

To keep the demo user working alongside Supabase:

1. **Go to Authentication > Users** in Supabase dashboard
2. **Click "Add user"**
3. **Add demo user:**
   - Email: `demo@student.edu`
   - Password: `demo123` 
   - Email Confirmed: ✅ **Yes**
   - User Metadata:
   ```json
   {
     "first_name": "John",
     "last_name": "Demo", 
     "university": "Eastern Michigan University",
     "role": "student"
   }
   ```

4. **Copy the User ID** and update it in the API code if needed

---

## 🚀 **Step 7: Test Locally**

1. **Start the development server:**
```bash
npm run dev
```

2. **Test the registration flow:**
   - Go to `http://localhost:3000/register`
   - Fill out the form with a real email
   - Check your email for verification code
   - Complete verification at `/verify-email`

3. **Test demo user:**
   - Go to `http://localhost:3000/login`
   - Use `demo@student.edu` / `demo123`
   - Should login without verification

---

## 📊 **Step 8: Verify Database**

Check that everything is working:

1. **Go to Table Editor** in Supabase
2. **Check user_profiles table** - should see new registrations
3. **Check auth.users table** - should see auth entries
4. **Verify RLS policies** are working correctly

---

## 🔄 **Step 9: Deploy to Vercel**

1. **Add environment variables** in Vercel dashboard:
   - Go to your project settings
   - Add all the environment variables from Step 5
   - Make sure to add them to **Production**, **Preview**, and **Development**

2. **Deploy:**
```bash
vercel --prod
```

3. **Test live site:**
   - Try registering with a real email
   - Verify OTP functionality works
   - Test demo user login

---

## ✅ **What You Get**

After completing this setup:

### **🔐 Authentication Features:**
- ✅ **User registration** with email/password
- ✅ **Email verification** via OTP codes  
- ✅ **Secure login** with JWT tokens
- ✅ **Demo user** preserved for testing
- ✅ **Password reset** (built into Supabase)
- ✅ **Session management** with auto-refresh

### **📊 Database Features:**
- ✅ **User profiles** with university info
- ✅ **Achievement tracking** system
- ✅ **NFT management** with metadata
- ✅ **Event ticketing** with discounts
- ✅ **Secure data access** with RLS policies

### **🚀 Production Ready:**
- ✅ **Scalable** to thousands of users
- ✅ **Secure** with industry standards
- ✅ **Fast** with global CDN
- ✅ **Monitored** with built-in analytics
- ✅ **Backed up** automatically

---

## 🔧 **Troubleshooting**

### **Email Verification Not Working:**
- Check SMTP settings in Supabase
- Verify email templates are enabled
- Check spam folder
- Ensure environment variables are correct

### **RLS Errors:**
- Verify policies are created correctly
- Check user is authenticated  
- Ensure tables have RLS enabled

### **Demo User Issues:**
- Verify demo user exists in Supabase
- Check user ID matches in API code
- Ensure email is marked as confirmed

### **API Connection Issues:**
- Verify all environment variables are set
- Check Supabase service key has correct permissions
- Confirm project URL is correct

---

## 📞 **Support**

If you encounter issues:
1. Check Supabase logs in dashboard
2. Review Vercel function logs  
3. Verify environment variables are correct
4. Check the database schema was created properly

**Your Academic NFT Marketplace now has production-ready authentication with Supabase! 🎉**