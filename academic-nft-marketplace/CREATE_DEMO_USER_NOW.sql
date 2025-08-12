-- ========================================
-- CREATE DEMO USER - RUN AFTER DATABASE SETUP
-- ========================================

-- First, you need to create the demo user in Supabase Auth Dashboard:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" 
-- 3. Email: demo@student.edu
-- 4. Password: demo123
-- 5. ✅ IMPORTANT: Check "Auto Confirm User"
-- 6. Create the user

-- After creating the auth user, find the User ID and replace 'DEMO_USER_ID_HERE' below
-- Then run this SQL to create the demo user profile:

-- REPLACE 'DEMO_USER_ID_HERE' WITH THE ACTUAL UUID FROM SUPABASE AUTH
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
  '56ce2ca9-248a-480a-b8ce-e8f7a38e69b9',
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
  university_email = EXCLUDED.university_email,
  student_id = EXCLUDED.student_id,
  email_verified = EXCLUDED.email_verified;

-- Verify the demo user was created
SELECT 'Demo user profile created successfully!' as status;
SELECT id, email, first_name, last_name, university, email_verified 
FROM user_profiles 
WHERE email = 'demo@student.edu';

-- Check that the auth user and profile are linked
SELECT 
  au.email as auth_email,
  au.email_confirmed_at,
  up.email as profile_email,
  up.email_verified
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'demo@student.edu';