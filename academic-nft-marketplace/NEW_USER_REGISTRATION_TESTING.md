# 📝 New User Registration Flow Testing Plan

## 🎯 **Objective**: Verify complete user registration with OTP verification

**Test Flow**: Registration → Email OTP → Verification → Login → Profile Creation

## 📋 **Complete Registration Flow**

### **Step 1: User Registration**
```bash
curl -X POST "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@university.edu",
    "password": "securepassword123",
    "firstName": "Test",
    "lastName": "User",
    "university": "Test University",
    "universityEmail": "test.user@testuni.edu", 
    "studentId": "TU123456"
  }'
```

**✅ Expected Success Response**:
```json
{
  "message": "Registration successful. Please check your email for verification.",
  "needsVerification": true,
  "email": "testuser@university.edu"
}
```

### **Step 2: Check Supabase Auth Dashboard**
After registration, verify:
1. **New User Created**: Go to Supabase → Authentication → Users
2. **User Status**: Should show email_confirmed_at as NULL (unconfirmed)
3. **User Metadata**: Should contain university info from registration
4. **Email**: testuser@university.edu should appear in users list

### **Step 3: Get OTP Code**
**Method 1: Check Email**
- Look for email from Supabase with 6-digit OTP code
- Subject typically: "Confirm your signup"

**Method 2: Check Supabase Logs** (if email not configured)
1. Go to Supabase Dashboard → Authentication → Settings
2. Check email templates or logs for OTP code

### **Step 4: Verify OTP**
```bash
curl -X POST "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@university.edu",
    "token": "123456",
    "type": "signup"
  }'
```
*Replace "123456" with actual OTP from email*

**✅ Expected Success Response**:
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "new-user-uuid",
    "email": "testuser@university.edu",
    "firstName": "Test",
    "lastName": "User", 
    "university": "Test University",
    "role": "student",
    "emailVerified": true
  },
  "token": "jwt-access-token"
}
```

### **Step 5: Verify Profile Creation**
Check database for automatic profile creation:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM user_profiles WHERE email = 'testuser@university.edu';
```

**Expected**: Profile should exist with all registration data

### **Step 6: Test New User Login** 
```bash
curl -X POST "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@university.edu",
    "password": "securepassword123"
  }'
```

**✅ Expected**: Should login successfully after verification

## 🖥️ **Frontend Registration Testing**

### **Test 1: Registration Form**
1. **Navigate to**: /register
2. **Fill Form**:
   - Email: testuser@university.edu
   - Password: securepassword123
   - Confirm Password: securepassword123
   - First Name: Test
   - Last Name: User
   - University: Test University
   - University Email: test.user@testuni.edu
   - Student ID: TU123456
3. **Submit Form**
4. **Expected**: Success message + redirect to email verification page

### **Test 2: Email Verification Page**
1. **Should Show**: 6-digit OTP input form
2. **Should Display**: Email address where OTP was sent
3. **Should Have**: "Resend OTP" button with countdown timer
4. **Enter OTP**: From email or Supabase logs
5. **Submit**: Should verify and redirect to dashboard

### **Test 3: Complete User Journey**
1. **Registration** → Success message
2. **Email Verification** → Enter OTP  
3. **Dashboard Access** → New user with basic stats
4. **Profile Completion** → All registration data saved
5. **Event Access** → Can browse and purchase tickets

## 🔍 **Registration Testing Scenarios**

### **Scenario 1: Successful Registration**
- **Input**: Valid email and strong password
- **Expected**: User created, OTP sent, verification works
- **Result**: Complete profile with all permissions

### **Scenario 2: Duplicate Email Registration**
```bash
# Register same email twice
curl -X POST ".../api/auth/register" -d '{"email": "duplicate@test.com", ...}'
curl -X POST ".../api/auth/register" -d '{"email": "duplicate@test.com", ...}'
```
**Expected**: Second attempt should return error about existing user

### **Scenario 3: Invalid Email Format**
```bash
curl -X POST ".../api/auth/register" -d '{"email": "invalid-email", ...}'
```
**Expected**: Validation error about invalid email format

### **Scenario 4: Weak Password**
```bash
curl -X POST ".../api/auth/register" -d '{"password": "123", ...}'
```
**Expected**: Error about password requirements

### **Scenario 5: Missing Required Fields**
```bash
curl -X POST ".../api/auth/register" -d '{"email": "test@test.com"}'
```
**Expected**: Validation errors about missing fields

## 📧 **OTP Testing Procedures**

### **Test 1: OTP Generation**
- **Trigger**: Registration API call
- **Check**: Supabase Auth logs for OTP generation
- **Verify**: 6-digit numeric code created

### **Test 2: OTP Delivery**
- **Check Email**: Look for Supabase confirmation email
- **Verify Content**: Email should contain 6-digit code
- **Test Timing**: OTP should arrive within 1-2 minutes

### **Test 3: OTP Verification**
- **Valid OTP**: Should verify successfully and login user
- **Invalid OTP**: Should return appropriate error message
- **Expired OTP**: Should handle expiration properly

### **Test 4: OTP Resend**
```bash
curl -X POST "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@university.edu",
    "type": "signup"
  }'
```
**Expected**: New OTP generated and sent

## 🔧 **Debugging Failed Registration**

### **Issue**: "Supabase client could not be initialized"
**Cause**: Missing environment variables
**Fix**: Add SUPABASE_* variables to Vercel

### **Issue**: Registration succeeds but no OTP email
**Cause**: Email not configured in Supabase
**Fix**: Check Supabase Auth → Settings → Email configuration

### **Issue**: OTP verification fails with valid code
**Cause**: Email not confirmed in Supabase or expired OTP
**Fix**: Check auth.users table for email_confirmed_at status

### **Issue**: Profile not created after verification
**Cause**: Database trigger not working or RLS blocking
**Fix**: Verify handle_new_user() trigger exists and RLS policies

### **Issue**: User can't login after verification
**Cause**: Profile creation failed or password mismatch
**Fix**: Check user_profiles table and re-test login

## 📊 **Registration Success Metrics**

Track these metrics during testing:

### **API Performance**:
- Registration endpoint response time
- OTP verification response time
- Profile creation speed

### **Success Rates**:
- Registration completion rate
- Email delivery rate
- OTP verification success rate

### **User Experience**:
- Form validation effectiveness
- Error message clarity
- Overall flow completion time

## 🎯 **Registration Success Criteria**

Registration testing is successful when:

### **Backend Functionality**:
- ✅ Registration API creates Supabase Auth user
- ✅ User metadata is correctly stored
- ✅ OTP is generated and can be retrieved
- ✅ OTP verification updates user status
- ✅ Profile is automatically created in database

### **Frontend Functionality**:
- ✅ Registration form validates input properly
- ✅ Success messages guide user to next step
- ✅ Email verification page works correctly
- ✅ OTP input and submission functions properly
- ✅ User is redirected to dashboard after verification

### **Database Integration**:
- ✅ Users appear in auth.users table
- ✅ Profiles are created in user_profiles table
- ✅ RLS policies allow appropriate access
- ✅ Triggers execute successfully

### **Email Integration**:
- ✅ OTP emails are sent successfully
- ✅ Email content is properly formatted
- ✅ Resend functionality works
- ✅ OTP codes are valid and verifiable

## 🚀 **Post-Registration Testing**

After successful registration, test:

### **New User Capabilities**:
- **Dashboard Access**: Basic stats for new user
- **Event Browsing**: Can view and purchase tickets
- **Profile Management**: Can update personal information
- **Achievement System**: Can earn and track achievements

### **Data Persistence**:
- **Login/Logout**: Session management works
- **Cross-Device**: Account accessible from different devices
- **Data Integrity**: User data remains consistent

### **Security Verification**:
- **Data Isolation**: User can only see own data
- **Permission Enforcement**: RLS policies working correctly
- **Session Security**: Tokens expire appropriately

**Complete registration testing validates the entire user onboarding flow and ensures new users can successfully join and use the platform.**