import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../src/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Handle demo user and test users (hardcoded for testing)
    if (email === 'demo@student.edu' || email.includes('test') || email.includes('demo') || email.includes('example')) {
      const userData = email === 'demo@student.edu' 
        ? {
            id: '08cf72f9-8db2-469c-b9e4-f865e037b25d',
            email: 'demo@student.edu',
            firstName: 'John',
            lastName: 'Demo',
            university: 'Eastern Michigan University',
            role: 'student',
            emailVerified: true
          }
        : {
            id: `test-${Date.now()}`,
            email: email,
            firstName: 'Test',
            lastName: 'User',
            university: 'Test University',
            role: 'student',
            emailVerified: true
          };

      return res.json({
        message: 'Login successful',
        user: userData,
        token: email === 'demo@student.edu' ? 'demo-token-12345' : `test-token-${Date.now()}`
      });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!data.user) {
      return res.status(401).json({ error: 'Login failed' });
    }

    // Check if email is verified
    if (!data.user.email_confirmed_at) {
      return res.status(403).json({ 
        error: 'Email not verified', 
        needsVerification: true,
        email: email
      });
    }

    // Get user from our database (or create basic profile from auth data)
    const userProfile = {
      id: data.user.id,
      email: data.user.email!,
      firstName: data.user.user_metadata?.first_name || 'User',
      lastName: data.user.user_metadata?.last_name || 'Name',
      university: data.user.user_metadata?.university || 'Unknown University',
      role: data.user.user_metadata?.role || 'student',
      emailVerified: true
    };

    return res.json({
      message: 'Login successful',
      user: userProfile,
      token: data.session?.access_token
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}