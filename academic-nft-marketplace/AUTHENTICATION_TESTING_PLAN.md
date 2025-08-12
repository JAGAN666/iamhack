# Authentication System Testing Plan

## Prerequisites
- ✅ Vercel authentication protection disabled
- ✅ Environment variables set in Vercel
- ✅ Database schema created in Supabase
- ✅ Demo user created in Supabase Auth

## Phase 1: API Endpoint Testing

### Test 1: Health Check
```bash
curl -X GET "https://your-vercel-url.vercel.app/api/health"
```
**Expected:** JSON response `{"status": "ok", "timestamp": "..."}`
**Not:** HTML authentication screen

### Test 2: Events API
```bash
curl -X GET "https://your-vercel-url.vercel.app/api/events"
```
**Expected:** JSON array with 3 sample events

### Test 3: Dashboard Stats (with Demo User)
```bash
curl -X GET "https://your-vercel-url.vercel.app/api/users/dashboard-stats" \
  -H "Authorization: Bearer demo-token-12345"
```
**Expected:** JSON with demo user stats (achievements: 12, level: 5, etc.)

## Phase 2: Authentication Flow Testing

### Test 4: Demo User Login
```bash
curl -X POST "https://your-vercel-url.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@student.edu",
    "password": "demo123"
  }'
```
**Expected:** 
```json
{
  "message": "Login successful",
  "user": {
    "id": "08cf72f9-8db2-469c-b9e4-f865e037b25d",
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

### Test 5: New User Registration
```bash
curl -X POST "https://your-vercel-url.vercel.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "password": "test123456",
    "firstName": "Test",
    "lastName": "User",
    "university": "Test University",
    "universityEmail": "test.user@testuni.edu",
    "studentId": "TU123456"
  }'
```
**Expected:**
```json
{
  "message": "Registration successful. Please check your email for verification.",
  "needsVerification": true,
  "email": "test@university.edu"
}
```

### Test 6: OTP Verification
```bash
curl -X POST "https://your-vercel-url.vercel.app/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "token": "123456",
    "type": "signup"
  }'
```
**Expected:** Either success message with user data or error for invalid token

### Test 7: OTP Resend
```bash
curl -X POST "https://your-vercel-url.vercel.app/api/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "type": "signup"
  }'
```
**Expected:**
```json
{
  "message": "Verification email sent successfully"
}
```

## Phase 3: Frontend Testing

### Test 8: Homepage Access
1. Visit: `https://your-vercel-url.vercel.app/`
2. **Expected:** Homepage loads with "Academic NFT Marketplace" content
3. **Not:** Authentication screen

### Test 9: Login Page
1. Visit: `https://your-vercel-url.vercel.app/login`
2. Try demo credentials: demo@student.edu / demo123
3. **Expected:** Successful login → redirect to dashboard

### Test 10: Registration Page  
1. Visit: `https://your-vercel-url.vercel.app/register`
2. Fill out registration form with test data
3. **Expected:** Success message → redirect to email verification page

### Test 11: Email Verification Page
1. Visit: `https://your-vercel-url.vercel.app/verify-email`
2. Enter 6-digit OTP (from email or manually test)
3. **Expected:** Either verification success or proper error handling

## Phase 4: Integration Testing

### Test 12: Complete Registration Flow
1. Register new user → receive "check email" message
2. Check Supabase Auth dashboard → user should appear
3. Get OTP from email (or Supabase logs)
4. Verify OTP → should login successfully
5. Check user_profiles table → profile should be created

### Test 13: Demo User Dashboard
1. Login with demo@student.edu / demo123
2. Visit dashboard
3. **Expected:** See demo stats (12 achievements, 5 NFTs, level 5)
4. All data should load without errors

### Test 14: Error Handling
1. Try invalid login credentials
2. Try registering with existing email
3. Try invalid OTP verification
4. **Expected:** Proper error messages, no crashes

## Phase 5: Database Verification

### Test 15: Check User Profiles
```sql
-- In Supabase SQL Editor
SELECT email, first_name, last_name, university, email_verified, created_at
FROM user_profiles
ORDER BY created_at DESC;
```
**Expected:** Demo user + any new registered users

### Test 16: Check Auth Integration
```sql
-- Verify auth users match profiles
SELECT 
  au.email as auth_email,
  up.email as profile_email,
  au.email_confirmed_at,
  up.email_verified
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id;
```
**Expected:** All auth users should have matching profiles

## Success Criteria

### ✅ All Tests Pass If:
1. **API endpoints return JSON** (not HTML auth screens)
2. **Demo user login works** with correct credentials
3. **New user registration** creates Supabase auth user
4. **OTP verification** completes successfully
5. **Frontend pages load** without authentication blocks
6. **Database entries** are created correctly
7. **Error handling** works properly

### 🚨 Issues to Debug If:
- API returns HTML instead of JSON → Vercel protection still active
- Supabase errors → Check environment variables
- OTP not working → Check email configuration in Supabase
- Database errors → Verify RLS policies and table structure

## Post-Testing Actions

After all tests pass:
1. **Document any remaining issues**
2. **Create user-friendly error messages**
3. **Add additional security measures**
4. **Performance optimization**
5. **Production deployment checklist**

## Testing Tools

### Recommended Tools:
- **cURL** for API testing
- **Postman** for comprehensive API testing
- **Browser DevTools** for frontend debugging
- **Supabase Dashboard** for database verification

### Automated Testing (Future):
- Jest tests for API endpoints
- Cypress for end-to-end testing  
- Database seeding scripts
- Load testing for production

This comprehensive testing plan ensures your authentication system works perfectly once the Vercel protection is resolved.