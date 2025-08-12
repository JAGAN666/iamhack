# 🚀 Quick API Tests - Copy & Paste Commands

Use these commands to quickly test the API endpoints once Vercel protection is disabled.

## Base URL
```
https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app
```

## 🔍 **Test 1: Health Check** (Most Important First)
```bash
curl -X GET "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/health" \
  -H "Content-Type: application/json"
```
**✅ Success**: Returns JSON like `{"status": "ok", "timestamp": "..."}`  
**❌ Failure**: Returns HTML with "Authentication Required"

---

## 🎟️ **Test 2: Events API**
```bash
curl -X GET "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/events" \
  -H "Content-Type: application/json"
```
**✅ Success**: Returns JSON array with 3 events  
**❌ Failure**: HTML authentication screen

---

## 👤 **Test 3: Demo User Login**
```bash
curl -X POST "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@student.edu",
    "password": "demo123"
  }'
```
**✅ Success**: Returns JSON with user data and token  
**❌ Failure**: Error message about invalid credentials (means demo user needs to be created)

---

## 📊 **Test 4: Dashboard Stats (Demo User)**
```bash
curl -X GET "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/users/dashboard-stats" \
  -H "Authorization: Bearer demo-token-12345" \
  -H "Content-Type: application/json"
```
**✅ Success**: Returns stats JSON (12 achievements, level 5, etc.)  
**❌ Failure**: 401 Unauthorized

---

## 📝 **Test 5: New User Registration**
```bash
curl -X POST "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/auth/register" \
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
**✅ Success**: Returns registration success + "check email" message  
**❌ Failure**: Supabase errors (means environment variables not set)

---

## 📧 **Test 6: OTP Verification** (Use real OTP from email)
```bash
curl -X POST "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "token": "123456",
    "type": "signup"
  }'
```
**✅ Success**: Returns user data and login token  
**❌ Failure**: "Invalid OTP" error

---

## 📧 **Test 7: Resend OTP**
```bash
curl -X POST "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "type": "signup"
  }'
```
**✅ Success**: "Verification email sent successfully"  
**❌ Failure**: Supabase connection errors

---

## 🚫 **Test 8: Error Handling** (Invalid Login)
```bash
curl -X POST "https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@test.com",
    "password": "wrongpassword"
  }'
```
**✅ Success**: Returns 400/401 with proper error message  
**❌ Failure**: Server errors or HTML responses

---

## 🏃‍♂️ **Run All Tests Automatically**
```bash
# Make executable and run the comprehensive test script
chmod +x ./test-api-endpoints.sh
./test-api-endpoints.sh
```

---

## 🎯 **Expected Results Summary**

| Test | Status | Expected Response |
|------|--------|-------------------|
| Health Check | 200 | `{"status": "ok"}` |
| Events API | 200 | Array of 3 events |
| Demo Login | 200 | User object + token |
| Dashboard Stats | 200 | Stats object |
| Registration | 200/201 | Success + verification needed |
| OTP Verify | 200 | User object (with valid OTP) |
| OTP Resend | 200 | Success message |
| Invalid Login | 400/401 | Error message |

---

## 🚨 **Common Issues & What They Mean**

### Getting HTML instead of JSON?
**Cause**: Vercel authentication protection still active  
**Fix**: Disable protection in Vercel dashboard

### "Supabase client could not be initialized"?
**Cause**: Missing environment variables  
**Fix**: Add the 3 required environment variables to Vercel

### Demo login returns "Invalid credentials"?
**Cause**: Demo user not created in Supabase  
**Fix**: Create demo user following the guide

### New registration fails?
**Cause**: Database schema not created  
**Fix**: Run `supabase-schema.sql` in Supabase SQL Editor

### OTP verification fails?
**Cause**: Need real OTP from email or Supabase logs  
**Fix**: Check email or Supabase Auth logs for actual OTP code

---

## ✅ **Success Indicators**

You'll know everything is working when:
- ✅ All API endpoints return **JSON** (not HTML)
- ✅ Demo login works immediately  
- ✅ New user registration creates users in Supabase
- ✅ Dashboard stats load for demo user
- ✅ Error messages are proper JSON responses

Once all tests pass, the authentication system is fully functional!