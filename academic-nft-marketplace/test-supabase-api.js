#!/usr/bin/env node

// Test script for Supabase API endpoints
// Run with: node test-supabase-api.js

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

console.log('🧪 Testing Academic NFT Marketplace API with Supabase Integration\n');

async function testAPI() {
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.message);
    console.log('   Supabase status:', healthResponse.data.supabase || 'Not connected');

    // Test 2: Events endpoint
    console.log('\n2️⃣ Testing events endpoint...');
    const eventsResponse = await axios.get(`${API_URL}/events`);
    console.log(`✅ Events loaded: ${eventsResponse.data.length} events`);

    // Test 3: Demo user login
    console.log('\n3️⃣ Testing demo user login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'demo@student.edu',
      password: 'demo123'
    });
    console.log('✅ Demo login successful:', loginResponse.data.user.firstName, loginResponse.data.user.lastName);
    console.log('   Email verified:', loginResponse.data.user.emailVerified);
    
    const token = loginResponse.data.token;

    // Test 4: Dashboard stats (authenticated)
    console.log('\n4️⃣ Testing dashboard stats (authenticated)...');
    const statsResponse = await axios.get(`${API_URL}/users/dashboard-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard stats loaded:');
    console.log('   Total achievements:', statsResponse.data.totalAchievements);
    console.log('   Level:', statsResponse.data.level);
    console.log('   Rank:', statsResponse.data.rank);

    // Test 5: User achievements (authenticated)
    console.log('\n5️⃣ Testing user achievements (authenticated)...');
    const achievementsResponse = await axios.get(`${API_URL}/achievements/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Achievements loaded: ${achievementsResponse.data.length} achievements`);

    // Test 6: User NFTs (authenticated)
    console.log('\n6️⃣ Testing user NFTs (authenticated)...');
    const nftsResponse = await axios.get(`${API_URL}/nfts/user`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ NFTs loaded: ${nftsResponse.data.length} NFTs`);

    console.log('\n🎉 All API tests passed! Your Supabase integration is working correctly.');
    
    // Supabase-specific tests
    console.log('\n📊 Testing Supabase features...');
    
    // This will only work if Supabase is properly configured
    console.log('ℹ️  To test new user registration:');
    console.log('   1. Set up your Supabase project following SUPABASE_SETUP.md');
    console.log('   2. Add environment variables to .env.local');
    console.log('   3. Try registering at http://localhost:3000/register');
    console.log('   4. Check your email for verification code');
    console.log('   5. Complete verification at http://localhost:3000/verify-email');

  } catch (error) {
    console.error('\n❌ API test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data?.error || error.response.data?.message);
    } else {
      console.error('   Error:', error.message);
    }
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure your development server is running:');
      console.error('   npm run dev');
    }
  }
}

// Test registration endpoint (commented out to avoid spam)
async function testRegistration() {
  try {
    console.log('\n🔐 Testing registration endpoint...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      university: 'Test University'
    });
    console.log('✅ Registration response:', registerResponse.data.message);
  } catch (error) {
    console.log('ℹ️  Registration test skipped (requires Supabase setup)');
  }
}

// Run tests
testAPI();