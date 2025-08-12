#!/bin/bash

# API Testing Script for Academic NFT Marketplace
# Run this script once Vercel protection is disabled

# Configuration
BASE_URL="https://frontend-wmshtqalv-jaganjagannath666-gmailcoms-projects.vercel.app"
API_URL="$BASE_URL/api"

echo "🚀 Academic NFT Marketplace API Testing"
echo "======================================"
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "🔍 Test 1: Health Check"
echo "------------------------"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$API_URL/health" -H "Content-Type: application/json")
HTTP_STATUS=$(echo $RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]*$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Health check successful"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ FAIL${NC} - HTTP Status: $HTTP_STATUS"
    echo "Response: $BODY"
fi
echo ""

# Test 2: Events API
echo "🎟️ Test 2: Events API"
echo "------------------------"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$API_URL/events" -H "Content-Type: application/json")
HTTP_STATUS=$(echo $RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]*$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Events API working"
    EVENTS_COUNT=$(echo "$BODY" | grep -o '"id"' | wc -l)
    echo "Found $EVENTS_COUNT events"
else
    echo -e "${RED}❌ FAIL${NC} - HTTP Status: $HTTP_STATUS"
    echo "Response: $BODY"
fi
echo ""

# Test 3: Demo User Login
echo "👤 Test 3: Demo User Login"
echo "-----------------------------"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@student.edu",
    "password": "demo123"
  }')
HTTP_STATUS=$(echo $RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]*$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Demo user login successful"
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d: -f2 | tr -d '"')
    echo "Login token: $TOKEN"
else
    echo -e "${RED}❌ FAIL${NC} - HTTP Status: $HTTP_STATUS"
    echo "Response: $BODY"
fi
echo ""

# Test 4: Dashboard Stats (with demo token)
if [ "$HTTP_STATUS" -eq 200 ] && [ "$TOKEN" = "demo-token-12345" ]; then
    echo "📊 Test 4: Dashboard Stats (Demo User)"
    echo "--------------------------------------"
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$API_URL/users/dashboard-stats" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    HTTP_STATUS=$(echo $RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]*$//')
    
    if [ "$HTTP_STATUS" -eq 200 ]; then
        echo -e "${GREEN}✅ PASS${NC} - Dashboard stats retrieved"
        ACHIEVEMENTS=$(echo "$BODY" | grep -o '"totalAchievements":[0-9]*' | cut -d: -f2)
        LEVEL=$(echo "$BODY" | grep -o '"level":[0-9]*' | cut -d: -f2)
        echo "Achievements: $ACHIEVEMENTS, Level: $LEVEL"
    else
        echo -e "${RED}❌ FAIL${NC} - HTTP Status: $HTTP_STATUS"
        echo "Response: $BODY"
    fi
    echo ""
else
    echo -e "${YELLOW}⚠️  SKIP${NC} - Dashboard test skipped (demo login failed)"
    echo ""
fi

# Test 5: New User Registration
echo "📝 Test 5: New User Registration"
echo "--------------------------------"
RANDOM_EMAIL="test$(date +%s)@university.edu"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"test123456\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\",
    \"university\": \"Test University\",
    \"universityEmail\": \"test.user@testuni.edu\",
    \"studentId\": \"TU123456\"
  }")
HTTP_STATUS=$(echo $RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]*$//')

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ]; then
    echo -e "${GREEN}✅ PASS${NC} - User registration successful"
    echo "Test email: $RANDOM_EMAIL"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ FAIL${NC} - HTTP Status: $HTTP_STATUS"
    echo "Response: $BODY"
fi
echo ""

# Test 6: OTP Resend
echo "📧 Test 6: OTP Resend"
echo "---------------------"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$API_URL/auth/resend-otp" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RANDOM_EMAIL\",
    \"type\": \"signup\"
  }")
HTTP_STATUS=$(echo $RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]*$//')

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ PASS${NC} - OTP resend successful"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ FAIL${NC} - HTTP Status: $HTTP_STATUS"
    echo "Response: $BODY"
fi
echo ""

# Test 7: Invalid Login Test
echo "🚫 Test 7: Invalid Login (Error Handling)"
echo "------------------------------------------"
RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@test.com",
    "password": "wrongpassword"
  }')
HTTP_STATUS=$(echo $RESPONSE | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo $RESPONSE | sed -E 's/HTTPSTATUS:[0-9]*$//')

if [ "$HTTP_STATUS" -eq 400 ] || [ "$HTTP_STATUS" -eq 401 ]; then
    echo -e "${GREEN}✅ PASS${NC} - Error handling works correctly"
    echo "Response: $BODY"
else
    echo -e "${YELLOW}⚠️  UNEXPECTED${NC} - HTTP Status: $HTTP_STATUS"
    echo "Response: $BODY"
fi
echo ""

# Summary
echo "🏁 Test Summary"
echo "==============="
echo "All tests completed!"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. If tests are failing with HTML responses, Vercel protection is still active"
echo "2. If tests pass, proceed with frontend testing"
echo "3. Create demo user in Supabase if demo login failed"
echo "4. Set up environment variables if Supabase errors occur"
echo ""
echo -e "${GREEN}✅ Authentication system is ready once all tests pass!${NC}"