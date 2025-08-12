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
    const { email, password, firstName, lastName, university, universityEmail, studentId } = req.body;

    console.log('🔐 Registration attempt for:', email);

    if (!email || !password || !firstName || !lastName || !university) {
      console.error('❌ Missing required fields:', { email: !!email, password: !!password, firstName: !!firstName, lastName: !!lastName, university: !!university });
      return res.status(400).json({ error: 'Missing required fields: email, password, firstName, lastName, university' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('❌ Invalid email format:', email);
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Validate password strength
    if (password.length < 6) {
      console.error('❌ Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if this is a demo/test user
    const isTestUser = email.includes('test') || email.includes('demo') || email.includes('example');
    
    if (isTestUser) {
      console.log('🎭 Processing demo/test user registration');
      const demoUser = {
        id: `demo-${Date.now()}`,
        email,
        first_name: firstName,
        last_name: lastName,
        university,
        university_email: universityEmail || email,
        student_id: studentId || `STU${Date.now()}`,
        role: 'student',
        email_confirmed_at: new Date().toISOString()
      };

      console.log('✅ Demo registration successful:', email);
      return res.json({
        message: 'Demo registration successful! You can now log in.',
        user: demoUser,
        needsVerification: false,
        email: email
      });
    }

    // Check Supabase configuration
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase configuration missing');
      return res.status(500).json({ 
        error: 'Authentication service is not configured. Please use a test email (containing "test", "demo", or "example") for now.' 
      });
    }

    console.log('🔐 Attempting Supabase registration for real user');
    
    // Register user with Supabase for real emails
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          university,
          university_email: universityEmail,
          student_id: studentId,
          role: 'student'
        }
      }
    });

    if (error) {
      console.error('❌ Supabase registration error:', error);
      
      // Handle specific Supabase errors
      if (error.message.includes('Invalid email')) {
        return res.status(400).json({ 
          error: 'Please use a valid email address. For testing, you can use an email containing "test", "demo", or "example".' 
        });
      }
      
      if (error.message.includes('User already registered')) {
        return res.status(400).json({ 
          error: 'An account with this email already exists. Please sign in instead.' 
        });
      }

      if (error.message.includes('Password should be at least')) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters long with a mix of letters and numbers.' 
        });
      }

      if (error.message.includes('rate limit')) {
        return res.status(429).json({ 
          error: 'Too many registration attempts. Please wait a few minutes and try again.' 
        });
      }

      // If Supabase is completely unavailable, offer test mode
      if (error.message.includes('fetch')) {
        return res.status(503).json({ 
          error: 'Authentication service is temporarily unavailable. Please use a test email (containing "test", "demo", or "example") for now.' 
        });
      }
      
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      console.error('❌ No user returned from Supabase registration');
      return res.status(500).json({ error: 'Registration failed unexpectedly. Please try again.' });
    }

    console.log('✅ Supabase registration successful:', email);
    console.log('📧 Email verification required for:', email);

    return res.json({
      message: 'Registration successful! Please check your email for verification.',
      user: data.user,
      needsVerification: true,
      email: email
    });

  } catch (error: any) {
    console.error('❌ Registration error:', error);
    
    // Handle network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Authentication service is temporarily unavailable. Please use a test email (containing "test", "demo", or "example") for now.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Registration failed. Please try again or use a test email for demo purposes.' 
    });
  }
}