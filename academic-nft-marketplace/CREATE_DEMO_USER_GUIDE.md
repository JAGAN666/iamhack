# Create Demo User in Supabase - Step by Step Guide

## 🎯 **Goal: Create Pre-Verified Demo User**

Create a demo user that can login immediately without OTP verification:
- **Email**: demo@student.edu
- **Password**: demo123
- **Status**: Pre-verified and ready to use

## 📋 **Step-by-Step Instructions**

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Select your Academic NFT Marketplace project
3. Click **Authentication** in the sidebar
4. Click **Users** tab

### Step 2: Create New Auth User
1. Click the **"Add User"** button (usually a green + button)
2. Fill in the user creation form:

```
Email: demo@student.edu
Password: demo123
Auto Confirm User: ✅ YES (IMPORTANT - Check this box)
User Metadata: (Optional - leave empty for now)
```

3. Click **"Create User"** or **"Add User"**

### Step 3: Verify User Creation
After creation, you should see:
- ✅ User appears in the users list
- ✅ Email shows as `demo@student.edu`
- ✅ **Confirmed At** column shows a timestamp (not null)
- ✅ **Email Confirmed At** shows a timestamp

### Step 4: Get the User ID
1. Click on the newly created user in the list
2. Copy the **User ID** (UUID format like: `12345678-1234-1234-1234-123456789abc`)
3. Keep this ID handy for Step 5

### Step 5: Create User Profile in Database
1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Paste this SQL (replace `USER_ID_HERE` with the actual UUID from Step 4):

```sql
-- Insert demo user profile
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
  'USER_ID_HERE',  -- Replace with the actual UUID from Step 4
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
```

4. Click **"Run"** to execute the query
5. You should see "Success. No rows returned" or similar success message

### Step 6: Verify Demo User Profile
Run this query to confirm the profile was created:

```sql
-- Verify demo user profile
SELECT 
  id,
  email,
  first_name,
  last_name,
  university,
  email_verified,
  created_at
FROM user_profiles 
WHERE email = 'demo@student.edu';
```

**Expected Result:**
- Should return 1 row
- email: demo@student.edu
- first_name: John
- last_name: Demo  
- university: Eastern Michigan University
- email_verified: true

## 🔍 **Verification Steps**

### Verify 1: Check Auth User
In Authentication → Users:
- ✅ demo@student.edu user exists
- ✅ "Confirmed At" has a timestamp
- ✅ "Last Sign In" is null (hasn't logged in yet)

### Verify 2: Check User Profile
In SQL Editor, run:
```sql
SELECT * FROM user_profiles WHERE email = 'demo@student.edu';
```
- ✅ Should return 1 profile record
- ✅ All fields populated correctly

### Verify 3: Check Profile-Auth Link
```sql
-- Verify auth user matches profile
SELECT 
  au.email as auth_email,
  au.email_confirmed_at,
  up.email as profile_email,
  up.email_verified
FROM auth.users au
JOIN user_profiles up ON au.id = up.id
WHERE au.email = 'demo@student.edu';
```
- ✅ Should return 1 row showing both records linked

## 🧪 **Test Demo User (After Vercel Fix)**

Once Vercel protection is disabled, test with:

```bash
curl -X POST "https://your-vercel-url.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@student.edu",
    "password": "demo123"
  }'
```

**Expected Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-uuid-here",
    "email": "demo@student.edu",
    "firstName": "John",
    "lastName": "Demo",
    "university": "Eastern Michigan University",
    "role": "student",
    "emailVerified": true
  },
  "token": "demo-token-12345"
}
```

## 🚨 **Common Issues & Solutions**

### Issue: "Add User" button not found
**Solution**: Make sure you're in Authentication → Users, not Authentication → Policies

### Issue: User created but not confirmed
**Solution**: Edit the user and check "Auto Confirm User" box, then save

### Issue: Profile insert fails
**Cause**: User ID doesn't match
**Solution**: Double-check you copied the exact UUID from the auth user

### Issue: Profile insert says "permission denied"
**Cause**: RLS policies blocking insert
**Solution**: Temporarily disable RLS or use service role key

### Issue: Can't see user_profiles table
**Cause**: Table doesn't exist yet
**Solution**: Run the complete `supabase-schema.sql` first

## 📊 **Demo User Stats**

The demo user will have these pre-configured stats (hardcoded in API):

```json
{
  "totalAchievements": 12,
  "verifiedAchievements": 8,
  "mintedNFTs": 5,
  "unlockedOpportunities": 23,
  "level": 5,
  "xp": 2400,
  "totalXP": 5000,
  "streakDays": 15,
  "rank": "Epic Scholar",
  "battlePassLevel": 7,
  "skillPoints": 120,
  "rareAchievements": 3,
  "legendaryAchievements": 1
}
```

## ✅ **Success Checklist**

- [ ] Demo user created in Supabase Auth
- [ ] User is auto-confirmed (email_confirmed_at not null)
- [ ] User profile inserted in user_profiles table
- [ ] Profile fields match expected values
- [ ] Auth user and profile IDs match
- [ ] Ready to test login once Vercel protection is disabled

## 🎯 **Next Steps**

After creating the demo user:
1. **Add environment variables to Vercel**
2. **Disable Vercel authentication protection**  
3. **Test demo user login** with API endpoint
4. **Test frontend login** through the website
5. **Verify dashboard loads** with demo user stats

The demo user will provide immediate access to test the complete Academic NFT Marketplace functionality once the Vercel issues are resolved.