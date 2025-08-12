# Supabase Database Verification & Setup Guide

## Step 1: Verify Database Tables

Go to your Supabase Dashboard → SQL Editor and run this query to check all tables exist:

```sql
-- Check if all required tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'user_profiles', 'achievements', 'nfts', 'events', 'tickets'
)
ORDER BY table_name;
```

**Expected Result:** Should show 5 tables (user_profiles, achievements, nfts, events, tickets)

## Step 2: Verify Table Structure

Check if the user_profiles table has correct columns:

```sql
-- Verify user_profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Expected Columns:** id, email, first_name, last_name, university, university_email, student_id, role, email_verified, avatar_url, created_at, updated_at

## Step 3: Check Sample Events Data

Verify that sample events were inserted:

```sql
-- Check sample events
SELECT id, title, price, max_attendees, current_attendees, status
FROM events
ORDER BY created_at;
```

**Expected Result:** Should show 3 events (Future of Academic Research Conference, Student Leadership Summit 2025, Cross-University Networking Night)

## Step 4: Create Demo User in Supabase Auth

### 4.1 Go to Authentication → Users in Supabase Dashboard

### 4.2 Click "Add User" and create:
- **Email:** demo@student.edu
- **Password:** demo123
- **Email Confirm:** ✅ Confirm email
- **Auto Confirm User:** ✅ Enabled

### 4.3 After creating, get the User ID from the Auth table

### 4.4 Manually insert demo user profile:
```sql
-- Replace 'USER_ID_FROM_AUTH' with actual UUID from auth.users table
INSERT INTO user_profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  university, 
  university_email, 
  student_id, 
  role, 
  email_verified
) VALUES (
  'USER_ID_FROM_AUTH',  -- Replace with actual UUID
  'demo@student.edu',
  'John',
  'Demo',
  'Eastern Michigan University',
  'john.demo@emich.edu',
  'EMU123456',
  'student',
  true
) ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  university = EXCLUDED.university,
  email_verified = EXCLUDED.email_verified;
```

## Step 5: Verify RLS Policies

Check that Row Level Security is enabled:

```sql
-- Check RLS status
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'achievements', 'nfts', 'tickets');
```

**Expected Result:** All tables should show rowsecurity = true

## Step 6: Test Database Functions

Test the automatic profile creation trigger:

```sql
-- Check if the trigger function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';
```

**Expected Result:** Should show 'handle_new_user'

## Environment Variables Needed

Ensure these environment variables are set in your application:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Verification Checklist

- [ ] All 5 tables exist (user_profiles, achievements, nfts, events, tickets)
- [ ] Sample events data is inserted (3 events)
- [ ] RLS policies are enabled on all tables
- [ ] Demo user created in Supabase Auth
- [ ] Demo user profile inserted in user_profiles table
- [ ] Environment variables configured
- [ ] Trigger functions created and working

## Common Issues & Solutions

### Issue: Tables not created
**Solution:** Run the complete `supabase-schema.sql` file in SQL Editor

### Issue: Demo user can't be created
**Solution:** Make sure email confirmation is enabled when creating the auth user

### Issue: RLS blocking queries
**Solution:** Verify policies are correctly configured for authenticated users

### Issue: Trigger not working
**Solution:** Check if the trigger function exists and is properly attached to auth.users table

Once all verification steps pass, the database is ready for the authentication system to work properly.